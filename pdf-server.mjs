import http from "node:http";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const PORT = 8787;
const MAX_BODY_BYTES = 12 * 1024 * 1024;

let browserPromise = null;

/*
 * PDF-only margin reader.
 *
 * Your existing React preview places these CSS variables on each
 * .offer-generator-a4-page:
 *
 * --letter-margin-top
 * --letter-margin-right
 * --letter-margin-bottom
 * --letter-margin-left
 *
 * We read those values from the HTML sent to Chromium so every
 * physical PDF page uses the same margins.
 */
function getPreviewMargins(html) {
  const readMargin = (side) => {
    const match = html.match(
      new RegExp(
        `--letter-margin-${side}\\s*:\\s*([0-9.]+)mm`,
        "i"
      )
    );

    return match ? `${match[1]}mm` : "15mm";
  };

  return {
    top: readMargin("top"),
    right: readMargin("right"),
    bottom: readMargin("bottom"),
    left: readMargin("left"),
  };
}

/*
 * PDF-only print CSS.
 *
 * IMPORTANT:
 * This CSS exists only inside the temporary HTML sent to Chromium.
 * It does NOT modify the application's real preview CSS.
 */
function buildPdfPrintCss(margins) {
  return `
<style id="noorado-pdf-print-rules">
  @page {
    size: A4;
    margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  /*
   * The @page rule owns the physical page margins.
   * Remove the preview page's outer margin/padding only inside
   * the temporary PDF document so margins are not applied twice.
   */
  .offer-generator-a4-page {
    box-sizing: border-box !important;

    width: 100% !important;
    min-width: 0 !important;

    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;

    margin: 0 !important;
    padding: 0 !important;

    break-inside: auto !important;
    page-break-inside: auto !important;

    break-after: auto !important;
    page-break-after: auto !important;
  }

  /*
   * Do not split the closing/signature block.
   */
  .offer-generator-letter-closing,
  .offer-generator-signature,
  .offer-generator-signature-space,
  .offer-generator-signature-image {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /*
   * Keep individual table rows/cells and images intact where possible.
   */
  table,
  tr,
  td,
  th,
  img {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /*
   * Preserve exact screen colors in the PDF.
   */
  *,
  *::before,
  *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
</style>`;
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        headless: true,
      })
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }

  return browserPromise;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  res.end(body);
}

function sendPdf(res, buffer) {
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Length": buffer.length,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Disposition": 'attachment; filename="Noorado-Letter.pdf"',
  });

  res.end(buffer);
}

async function readJson(req) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;

    if (total > MAX_BODY_BYTES) {
      const error = new Error("PDF request is too large.");
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");

  if (!raw) {
    const error = new Error("Empty PDF request.");
    error.statusCode = 400;
    throw error;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Invalid JSON payload.");
    error.statusCode = 400;
    throw error;
  }
}

async function createPdf(html) {
  const browser = await getBrowser();

  const context = await browser.newContext({
    viewport: {
      width: 794,
      height: 1123,
    },
    deviceScaleFactor: 1,
  });

  try {
    const page = await context.newPage();

    /*
     * Read the exact margins embedded in the existing preview HTML.
     */
    const margins = getPreviewMargins(html);

    /*
     * Inject PDF-only CSS into the temporary document.
     */
    const printCss = buildPdfPrintCss(margins);

    const pdfHtml = /<\/head>/i.test(html)
      ? html.replace(
          /<\/head>/i,
          `${printCss}</head>`
        )
      : `${printCss}${html}`;

    await page.setContent(pdfHtml, {
      waitUntil: "load",
      timeout: 30_000,
    });

    /*
     * Use Chromium's actual print rendering mode.
     */
    await page.emulateMedia({
      media: "print",
    });

    /*
     * Wait until fonts and images are completely ready.
     */
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const images = Array.from(
        document.images
      );

      await Promise.all(
        images.map(async (image) => {
          if (!image.complete) {
            await new Promise((resolve) => {
              image.addEventListener(
                "load",
                resolve,
                { once: true }
              );

              image.addEventListener(
                "error",
                resolve,
                { once: true }
              );
            });
          }

          if (typeof image.decode === "function") {
            try {
              await image.decode();
            } catch {
              /*
               * Image may already be available even if
               * decode() rejects.
               */
            }
          }
        })
      );
    });

    /*
     * Ensure the temporary PDF document has a white page background.
     */
    await page.evaluate(() => {
      document.documentElement.style.background =
        "#ffffff";

      document.body.style.background =
        "#ffffff";
    });

    /*
     * IMPORTANT:
     * Use the SAME margin values for page.pdf().
     * This gives every physical page the same top/bottom/left/right margin.
     */
    const pdf = await page.pdf({
      format: "A4",

      printBackground: true,

      preferCSSPageSize: true,

      scale: 1,

      margin: {
        top: margins.top,
        right: margins.right,
        bottom: margins.bottom,
        left: margins.left,
      },

      tagged: true,
    });

    return pdf;
  } finally {
    await context.close();
  }
}

const server = http.createServer(
  async (req, res) => {
    /*
     * CORS preflight
     */
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type",
      });

      res.end();
      return;
    }

    /*
     * Support both endpoints.
     */
    if (
      req.method !== "POST" ||
      ![
        "/api/pdf",
        "/generate-pdf",
      ].includes(req.url)
    ) {
      sendJson(res, 404, {
        error: "Not found.",
      });

      return;
    }

    try {
      const payload = await readJson(req);

      const html =
        typeof payload?.html === "string"
          ? payload.html
          : "";

      if (!html.trim()) {
        sendJson(res, 400, {
          error:
            "The HTML document is missing.",
        });

        return;
      }

      const pdf = await createPdf(html);

      sendPdf(res, pdf);
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      sendJson(
        res,
        error?.statusCode || 500,
        {
          error:
            error instanceof Error
              ? error.message
              : "Unknown PDF generation error.",
        }
      );
    }
  }
);

server.listen(PORT, HOST, () => {
  console.log(
    `Noorado Chromium PDF service running at http://${HOST}:${PORT}`
  );

  console.log(
    "PDF endpoints: /api/pdf and /generate-pdf"
  );
});

async function shutdown(signal) {
  console.log(
    `Received ${signal}. Shutting down PDF service...`
  );

  server.close(async () => {
    try {
      const browser = browserPromise
        ? await browserPromise
        : null;

      await browser?.close();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGINT", () =>
  shutdown("SIGINT")
);

process.on("SIGTERM", () =>
  shutdown("SIGTERM")
);