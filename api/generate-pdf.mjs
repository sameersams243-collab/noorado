import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

const MAX_BODY_BYTES = 12 * 1024 * 1024;

let browserPromise = null;

/*
 * Read the same margins used by the React preview.
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
 * PDF-only CSS.
 * This does not modify the actual React preview.
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

      .offer-generator-letter-closing,
      .offer-generator-signature,
      .offer-generator-signature-space,
      .offer-generator-signature-image {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      table,
      tr,
      td,
      th,
      img {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      *,
      *::before,
      *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    </style>
  `;
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const executablePath = await chromium.executablePath();

      return playwrightChromium.launch({
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
        executablePath,
        headless: chromium.headless,
      });
    })().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }

  return browserPromise;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);

  res.status(status);
  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );
  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  res.send(body);
}

function sendPdf(
  res,
  buffer,
  fileName = "Noorado-Letter.pdf"
) {
  res.status(200);
  res.setHeader(
    "Content-Type",
    "application/pdf"
  );
  res.setHeader(
    "Content-Length",
    buffer.length
  );
  res.setHeader(
    "Cache-Control",
    "no-store"
  );
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  const safeFileName = fileName
    .replace(/["\r\n]/g, "")
    .trim() || "Noorado-Letter.pdf";

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFileName}"`
  );

  res.send(buffer);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let finished = false;

    req.on("data", (chunk) => {
      if (finished) return;

      total += chunk.length;

      if (total > MAX_BODY_BYTES) {
        finished = true;

        const error = new Error(
          "PDF request is too large."
        );
        error.statusCode = 413;

        reject(error);

        try {
          req.destroy();
        } catch {
          // Ignore destroy errors.
        }

        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      if (finished) return;

      finished = true;

      if (total === 0) {
        const error = new Error(
          "Empty PDF request."
        );
        error.statusCode = 400;
        reject(error);
        return;
      }

      const raw = Buffer.concat(chunks).toString("utf8");

      try {
        resolve(JSON.parse(raw));
      } catch {
        const error = new Error(
          "Invalid JSON payload."
        );
        error.statusCode = 400;
        reject(error);
      }
    });

    req.on("error", (error) => {
      if (finished) return;

      finished = true;
      reject(error);
    });
  });
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

    const margins = getPreviewMargins(html);
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

    await page.emulateMedia({
      media: "print",
    });

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

          if (
            typeof image.decode ===
            "function"
          ) {
            try {
              await image.decode();
            } catch {
              // Image may already be available.
            }
          }
        })
      );
    });

    await page.evaluate(() => {
      document.documentElement.style.background =
        "#ffffff";

      document.body.style.background =
        "#ffffff";
    });

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
    });

    return pdf;
  } finally {
    await context.close();
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204);

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );

    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      error: "Method not allowed.",
    });
    return;
  }

  try {
    const payload = await readJsonBody(req);

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

    const fileName =
      typeof payload?.fileName ===
        "string" &&
      payload.fileName.trim()
        ? payload.fileName.trim()
        : "Noorado-Letter.pdf";

    sendPdf(res, pdf, fileName);
  } catch (error) {
    console.error(
      "Noorado PDF generation failed:",
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