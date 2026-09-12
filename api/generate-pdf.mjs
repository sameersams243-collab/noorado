import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

const MAX_BODY_BYTES = 12 * 1024 * 1024;
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
 *
 * Important:
 * The React preview already defines the A4 page geometry,
 * margins, padding, spacing and page-break behavior.
 *
 * This stylesheet must NOT override those layout values.
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
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /*
       * Match the working local PDF renderer.
       * The application preview owns the content layout,
       * while @page owns the physical PDF margins.
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
       * Keep closing/signature together.
       */
      .offer-generator-letter-closing,
      .offer-generator-signature,
      .offer-generator-signature-space,
      .offer-generator-signature-image {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /*
       * Keep table rows/cells and images intact where possible.
       */
      table,
      tr,
      td,
      th,
      img {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      *,
      *::before,
      *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .offer-generator-preview-table-actions,
      .offer-generator-table-column-resize-handle,
      .offer-generator-table-row-resize-handle,
      .offer-generator-preview-format-toolbar,
      .offer-generator-rich-toolbar {
        display: none !important;
      }

      [contenteditable] {
        outline: none !important;
        cursor: default !important;
      }

      .offer-generator-preview-inline-editor,
      .offer-generator-preview-block-editor,
      .offer-generator-preview-table-cell-editor,
      .offer-generator-preview-table-title-editor {
        cursor: default !important;
      }
    </style>
  `;
}

/*
 * IMPORTANT:
 * Do not cache the browser between requests.
 *
 * Vercel may reuse a serverless function instance after the previous
 * Chromium process has already been closed. Reusing that stale browser
 * can cause:
 *
 * browser.newContext:
 * Target page, context or browser has been closed
 *
 * Therefore a fresh Chromium browser is launched for every PDF request
 * and closed after that request is finished.
 */
async function getBrowser() {
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
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);

  res.status(status);

  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
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

  const safeFileName =
    fileName
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

      const raw =
        Buffer.concat(chunks).toString("utf8");

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
  /*
   * Fresh browser for this request only.
   */
  const browser = await getBrowser();

  try {
    const context = await browser.newContext({
  viewport: {
    width: 794,
    height: 1123,
  },
  deviceScaleFactor: 1,
});

    try {
      const page = await context.newPage();
      await page.emulateMedia({
  media: "print",
});

      const margins = getPreviewMargins(html);
const printCss = buildPdfPrintCss(margins);

      /*
       * Inject the PDF-only rules into the existing document.
       *
       * The React-generated HTML already contains:
       * - A4 page dimensions
       * - preview margins
       * - preview spacing
       * - typography
       * - table sizing
       * - page structure
       *
       * We keep all of that intact.
       */
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

      const pageInfo = await page.evaluate(() => {
  const page = document.querySelector(".offer-generator-a4-page");
  const logo = document.querySelector(".offer-generator-letter-logo");

  if (!page || !logo) {
    return {
      pageFound: !!page,
      logoFound: !!logo,
    };
  }

  const pageRect = page.getBoundingClientRect();
  const logoRect = logo.getBoundingClientRect();

  return {
    pageFound: true,
    logoFound: true,
    page: {
      top: pageRect.top,
      left: pageRect.left,
      width: pageRect.width,
      height: pageRect.height,
    },
    logo: {
      top: logoRect.top,
      left: logoRect.left,
      width: logoRect.width,
      height: logoRect.height,
      right: logoRect.right,
      bottom: logoRect.bottom,
    },
  };
});

console.log("PDF PAGE/LOGO GEOMETRY:", pageInfo);

      /*
       * Wait for fonts and images used by the preview.
       */
      await page.evaluate(async () => {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        const images = Array.from(
          document.images || []
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
              typeof image.decode === "function"
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

      /*
       * Keep the PDF background white without changing the
       * preview's actual content geometry.
       */
      await page.evaluate(() => {
        document.documentElement.style.background =
          "#ffffff";

        document.body.style.background =
          "#ffffff";
      });

      /*
       * IMPORTANT:
       *
       * The preview document owns the actual A4 layout.
       * The PDF itself uses zero external page margins so
       * Chromium does not add another layer of spacing.
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
      /*
       * Always close the BrowserContext.
       */
      await context.close().catch(() => {});
    }
  } finally {
    /*
     * Always close Chromium after this request.
     *
     * This prevents stale browser reuse and fixes:
     *
     * "Target page, context or browser has been closed"
     */
    await browser.close().catch(() => {});
  }
}

export default async function handler(req, res) {
  /*
   * Handle CORS preflight.
   */
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

  /*
   * Only POST is supported.
   */
  if (req.method !== "POST") {
    sendJson(res, 405, {
      error: "Method not allowed.",
    });

    return;
  }

  try {
    /*
     * Read the JSON request body.
     */
    const payload = await readJsonBody(req);

    const html =
      typeof payload?.html === "string"
        ? payload.html
        : "";

    /*
     * Validate HTML payload.
     */
    if (!html.trim()) {
      sendJson(res, 400, {
        error:
          "The HTML document is missing.",
      });

      return;
    }

    /*
     * Generate PDF using Chromium.
     */
    const pdf = await createPdf(html);

    /*
     * Resolve the requested filename.
     */
    const fileName =
      typeof payload?.fileName === "string" &&
      payload.fileName.trim()
        ? payload.fileName.trim()
        : "Noorado-Letter.pdf";

    /*
     * Return the PDF.
     */
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