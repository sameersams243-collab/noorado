import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";
import "./GSTInvoiceGeneratorPage.css";

type Item = {
  id: number;
  name: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
};

type GstType = "cgst-sgst" | "igst";
type InvoiceTemplate = "long" | "short";

const GST_RATES = [0, 5, 12, 18, 28];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const createEmptyItem = (id: number): Item => ({
  id,
  name: "",
  hsnSac: "",
  quantity: 1,
  rate: 0,
  discount: 0,
  gstRate: 18,
});

function GSTInvoiceGeneratorPage() {
  // ==================================================
  // SELLER DETAILS
  // ==================================================

  const [sellerName, setSellerName] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [sellerGSTIN, setSellerGSTIN] = useState("");
  const [sellerState, setSellerState] = useState("");
  const [sellerPincode, setSellerPincode] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoType, setLogoType] = useState<"PNG" | "JPEG">("PNG");

  const handleLogoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setLogo(reader.result as string);
      setLogoType(file.type === "image/png" ? "PNG" : "JPEG");
    };

    reader.readAsDataURL(file);
  };

  // ==================================================
  // CUSTOMER DETAILS
  // ==================================================

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerPincode, setCustomerPincode] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // ==================================================
  // INVOICE DETAILS
  // ==================================================

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  // ==================================================
  // GST TYPE
  // ==================================================

  const [gstType, setGstType] =
    useState<GstType>("cgst-sgst");

  // ==================================================
  // INVOICE TEMPLATE
  // ==================================================

  const [invoiceTemplate, setInvoiceTemplate] =
    useState<InvoiceTemplate>("long");

  // Controls template popup
  const [showTemplateSelector, setShowTemplateSelector] =
    useState(false);

  // ==================================================
  // ITEMS
  // ==================================================

  const [items, setItems] = useState<Item[]>([
    createEmptyItem(1),
  ]);

  // ==================================================
  // ADD ITEM
  // ==================================================

  const addItem = () => {
    setItems((current) => [
      ...current,
      createEmptyItem(Date.now()),
    ]);
  };

  // ==================================================
  // REMOVE ITEM
  // ==================================================

  const removeItem = (id: number) => {
    setItems((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter((item) => item.id !== id);
    });
  };

  // ==================================================
  // UPDATE ITEM
  // ==================================================

  const updateItem = (
    id: number,
    field: keyof Item,
    value: string | number
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ==================================================
  // FORMAT CURRENCY
  // ==================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  // ==================================================
  // ITEM CALCULATION
  // ==================================================

  const calculateItem = (item: Item) => {
    const subtotal =
      item.quantity * item.rate;

    const discountAmount =
      subtotal * (item.discount / 100);

    const taxableAmount = Math.max(
      0,
      subtotal - discountAmount
    );

    const gstAmount =
      taxableAmount * (item.gstRate / 100);

    const total =
      taxableAmount + gstAmount;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      gstAmount,
      total,
    };
  };

  // ==================================================
  // TOTAL CALCULATION
  // ==================================================

  const totals = items.reduce(
    (total, item) => {
      const calculation =
        calculateItem(item);

      return {
        subtotal:
          total.subtotal +
          calculation.subtotal,

        discount:
          total.discount +
          calculation.discountAmount,

        taxable:
          total.taxable +
          calculation.taxableAmount,

        gst:
          total.gst +
          calculation.gstAmount,

        total:
          total.total +
          calculation.total,
      };
    },
    {
      subtotal: 0,
      discount: 0,
      taxable: 0,
      gst: 0,
      total: 0,
    }
  );

  const cgst =
    gstType === "cgst-sgst"
      ? totals.gst / 2
      : 0;

  const sgst =
    gstType === "cgst-sgst"
      ? totals.gst / 2
      : 0;

  const igst =
    gstType === "igst"
      ? totals.gst
      : 0;

  // ==================================================
  // PDF TEXT HELPER
  // ==================================================

  const addWrappedText = (
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 5
  ) => {
    const lines =
      doc.splitTextToSize(
        text,
        maxWidth
      );

    doc.text(lines, x, y);

    return (
      y +
      lines.length * lineHeight
    );
  };

  const addInvoiceLogo = (
    doc: jsPDF,
    imageData: string,
    imageType: "PNG" | "JPEG",
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number
  ) => {
    try {
      const imageProperties = doc.getImageProperties(imageData);
      const ratio = Math.min(
        maxWidth / imageProperties.width,
        maxHeight / imageProperties.height
      );
      const finalWidth = imageProperties.width * ratio;
      const finalHeight = imageProperties.height * ratio;
      const finalX = x + (maxWidth - finalWidth) / 2;
      const finalY = y + (maxHeight - finalHeight) / 2;

      doc.addImage(
        imageData,
        imageType,
        finalX,
        finalY,
        finalWidth,
        finalHeight
      );
    } catch (error) {
      console.error("Failed to add invoice logo:", error);
    }
  };

  // ==================================================
  // GENERATE LONG PDF
  // ==================================================

  const generateLongInvoicePDF = (
    doc: jsPDF
  ) => {
    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const invoiceNo =
      invoiceNumber || "INV-001";

    const date =
      invoiceDate ||
      new Date()
        .toISOString()
        .split("T")[0];

    const formatPDFCurrency =
      (value: number) =>
        `Rs. ${value.toFixed(2)}`;

    if (logo) {
      // ==================================================
      // LOGO AREA - A4
      // ==================================================
      addInvoiceLogo(
        doc,
        logo,
        logoType,
        14,
        9,
        32,
        20
      );
    }

    // ------------------------------------------------
    // TITLE
    // ------------------------------------------------

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(22);

    doc.text(
      "TAX INVOICE",
      pageWidth / 2,
      20,
      {
        align: "center",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      "GST Invoice",
      pageWidth / 2,
      27,
      {
        align: "center",
      }
    );

    // ------------------------------------------------
    // SELLER DETAILS
    // ------------------------------------------------

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(13);

    doc.text(
      sellerName ||
        "Seller Company",
      14,
      50
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    const sellerLines = [
      sellerAddress,
      sellerState
        ? `State: ${sellerState}`
        : "",
      sellerPincode
        ? `PIN: ${sellerPincode}`
        : "",
      sellerGSTIN
        ? `GSTIN: ${sellerGSTIN}`
        : "",
      sellerPhone
        ? `Phone: ${sellerPhone}`
        : "",
      sellerEmail
        ? `Email: ${sellerEmail}`
        : "",
    ].filter(Boolean);

    sellerLines.forEach(
      (line, index) => {
        const wrapped =
          doc.splitTextToSize(
            line,
            100
          );

        doc.text(
          wrapped,
          14,
          57 + index * 5
        );
      }
    );

    // ------------------------------------------------
    // INVOICE DETAILS
    // ------------------------------------------------

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "Invoice Details",
      130,
      42
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      `Invoice No: ${invoiceNo}`,
      130,
      49
    );

    doc.text(
      `Invoice Date: ${date}`,
      130,
      54
    );

    if (dueDate) {
      doc.text(
        `Due Date: ${dueDate}`,
        130,
        59
      );
    }

    if (placeOfSupply) {
      doc.text(
        `Place of Supply: ${placeOfSupply}`,
        130,
        64
      );
    }

    // ------------------------------------------------
    // BILL TO
    // ------------------------------------------------

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "Bill To",
      14,
      92
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    let customerY = 99;

    const customerLines = [
      customerName ||
        "Customer",

      customerAddress,

      customerState
        ? `State: ${customerState}`
        : "",

      customerPincode
        ? `PIN: ${customerPincode}`
        : "",

      customerGSTIN
        ? `GSTIN: ${customerGSTIN}`
        : "",

      customerPhone
        ? `Phone: ${customerPhone}`
        : "",

      customerEmail
        ? `Email: ${customerEmail}`
        : "",
    ].filter(Boolean);

    customerLines.forEach(
      (line) => {
        customerY =
          addWrappedText(
            doc,
            line,
            14,
            customerY,
            100
          );
      }
    );

    // ------------------------------------------------
    // ITEMS TABLE
    // ------------------------------------------------

    const tableRows =
      items.map(
        (item, index) => {
          const calculation =
            calculateItem(item);

          return [
            index + 1,
            item.name || "-",
            item.hsnSac || "-",
            item.quantity.toFixed(2),
            item.rate.toFixed(2),
            `${item.discount.toFixed(
              2
            )}%`,
            `${item.gstRate}%`,
            calculation.taxableAmount.toFixed(
              2
            ),
            calculation.gstAmount.toFixed(
              2
            ),
            calculation.total.toFixed(
              2
            ),
          ];
        }
      );

    autoTable(doc, {
      startY: Math.max(
        customerY + 10,
        135
      ),

      head: [
        [
          "#",
          "Product / Service",
          "HSN/SAC",
          "Qty",
          "Rate",
          "Disc.",
          "GST",
          "Taxable",
          "GST Amt.",
          "Total",
        ],
      ],

      body: tableRows,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        lineColor: [
          210,
          210,
          210,
        ],
        lineWidth: 0.2,
        textColor: [
          30,
          30,
          30,
        ],
        overflow:
          "linebreak",
        valign:
          "middle",
      },

      headStyles: {
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
        valign: "middle",
        fillColor: [
          20,
          184,
          166,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        cellPadding: 3,
      },

      bodyStyles: {
        minCellHeight: 10,
      },

      columnStyles: {
        0: {
          cellWidth: 8,
          halign: "center",
        },

        1: {
          cellWidth: 37,
        },

        2: {
          cellWidth: 19,
        },

        3: {
          cellWidth: 10,
          halign: "right",
        },

        4: {
          cellWidth: 17,
          halign: "right",
        },

        5: {
          cellWidth: 12,
          halign: "center",
        },

        6: {
          cellWidth: 12,
          halign: "center",
        },

        7: {
          cellWidth: 22,
          halign: "right",
        },

        8: {
          cellWidth: 23,
          halign: "right",
        },

        9: {
          cellWidth: 22,
          halign: "right",
        },
      },

      margin: {
        left: 14,
        right: 14,
      },

      tableWidth: 182,

      didParseCell: (
        data
      ) => {
        if (
          data.section ===
          "head"
        ) {
          data.cell.styles.halign =
            "center";
        }
      },
    });

    // ------------------------------------------------
    // SUMMARY
    // ------------------------------------------------

    const finalY =
      (
        doc as jsPDF & {
          lastAutoTable?: {
            finalY: number;
          };
        }
      ).lastAutoTable
        ?.finalY || 150;

    let summaryY =
      finalY + 14;

    if (summaryY > 235) {
      doc.addPage();

      summaryY = 20;
    }

    const summaryX = 118;
    const valueX = 196;

    const drawSummaryRow =
      (
        label: string,
        value: string,
        y: number
      ) => {
        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(10);

        doc.text(
          label,
          summaryX,
          y
        );

        doc.text(
          value,
          valueX,
          y,
          {
            align: "right",
          }
        );
      };

    drawSummaryRow(
      "Subtotal",
      formatPDFCurrency(
        totals.subtotal
      ),
      summaryY
    );

    drawSummaryRow(
      "Discount",
      `- ${formatPDFCurrency(
        totals.discount
      )}`,
      summaryY + 7
    );

    drawSummaryRow(
      "Taxable Amount",
      formatPDFCurrency(
        totals.taxable
      ),
      summaryY + 14
    );

    if (
      gstType ===
      "cgst-sgst"
    ) {
      drawSummaryRow(
        "CGST",
        formatPDFCurrency(
          cgst
        ),
        summaryY + 21
      );

      drawSummaryRow(
        "SGST",
        formatPDFCurrency(
          sgst
        ),
        summaryY + 28
      );
    } else {
      drawSummaryRow(
        "IGST",
        formatPDFCurrency(
          igst
        ),
        summaryY + 21
      );
    }

    drawSummaryRow(
      "Total GST",
      formatPDFCurrency(
        totals.gst
      ),
      summaryY +
        (gstType ===
        "cgst-sgst"
          ? 35
          : 28)
    );

    const grandTotalY =
      summaryY +
      (gstType ===
      "cgst-sgst"
        ? 47
        : 40);

    doc.setDrawColor(
      40,
      40,
      40
    );

    doc.setLineWidth(
      0.4
    );

    doc.line(
      summaryX,
      grandTotalY - 6,
      valueX,
      grandTotalY - 6
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(13);

    doc.text(
      "Grand Total",
      summaryX,
      grandTotalY
    );

    doc.text(
      formatPDFCurrency(
        totals.total
      ),
      valueX,
      grandTotalY,
      {
        align: "right",
      }
    );

    // ------------------------------------------------
    // PAYMENT TERMS
    // ------------------------------------------------

    if (paymentTerms) {
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(9);

      doc.text(
        "Payment Terms",
        14,
        grandTotalY + 25
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        doc.splitTextToSize(
          paymentTerms,
          100
        ),
        14,
        grandTotalY + 32
      );
    }

    // ------------------------------------------------
    // FOOTER
    // ------------------------------------------------

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
      100,
      100,
      100
    );

    doc.text(
      "Generated using Noorado GST Invoice Generator",
      pageWidth / 2,
      pageHeight - 10,
      {
        align: "center",
      }
    );

    // ------------------------------------------------
    // SAVE
    // ------------------------------------------------

    const safeFileName =
      invoiceNo.replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      );

    doc.save(
      `${safeFileName}-long.pdf`
    );
  };

  // ==================================================
  // GENERATE SHORT PDF
  // ==================================================

  const generateShortInvoicePDF = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const invoiceNo = invoiceNumber || "INV-001";
    const date = invoiceDate || new Date().toISOString().split("T")[0];
    const money = (value: number) => `Rs. ${value.toFixed(2)}`;

    if (logo) {
      addInvoiceLogo(
        doc,
        logo,
        logoType,
        10,
        8,
        30,
        18
      );
    }

    // ------------------------------------------------
    // HEADER
    // ------------------------------------------------
    const sellerTextX = logo ? 45 : margin;
    const sellerTextWidth = logo ? 87 : 72;

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("TAX INVOICE", sellerTextX, 16);

    doc.setFontSize(10);
    doc.text(sellerName || "Seller Company", sellerTextX, 23);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    let sellerY = 28;
    const sellerInfo = [
      sellerAddress,
      sellerGSTIN ? `GSTIN: ${sellerGSTIN}` : "",
      sellerPhone ? `Phone: ${sellerPhone}` : "",
    ].filter(Boolean);

    sellerInfo.forEach((line) => {
      const lines = doc.splitTextToSize(line, sellerTextWidth);
      doc.text(lines, sellerTextX, sellerY);
      sellerY += lines.length * 3.5;
    });

    // Invoice information block on the right.
    const infoLabelX = pageWidth - 58;
    const infoValueX = pageWidth - margin;
    let infoY = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("Invoice No.", infoLabelX, infoY);
    doc.text("Date", infoLabelX, infoY + 6);
    if (dueDate) doc.text("Due Date", infoLabelX, infoY + 12);

    doc.setFont("helvetica", "normal");
    doc.text(invoiceNo, infoValueX, infoY, { align: "right" });
    doc.text(date, infoValueX, infoY + 6, { align: "right" });
    if (dueDate) doc.text(dueDate, infoValueX, infoY + 12, { align: "right" });

    // ------------------------------------------------
    // CUSTOMER
    // ------------------------------------------------
    const customerTop = Math.max(sellerY + 5, dueDate ? 46 : 40);

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.25);
    doc.line(margin, customerTop - 4, pageWidth - margin, customerTop - 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("BILL TO", margin, customerTop + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(customerName || "Customer", margin, customerTop + 8);

    let customerY = customerTop + 12;
    if (customerAddress) {
      const lines = doc.splitTextToSize(customerAddress, 88);
      doc.text(lines, margin, customerY);
      customerY += lines.length * 3.5;
    }

    const customerExtra = [
      customerGSTIN ? `GSTIN: ${customerGSTIN}` : "",
      customerPhone ? `Phone: ${customerPhone}` : "",
      customerState ? `State: ${customerState}` : "",
    ].filter(Boolean);

    customerExtra.forEach((line) => {
      doc.text(line, margin, customerY);
      customerY += 4;
    });

    // ------------------------------------------------
    // ITEMS TABLE - A5 SAFE WIDTH
    // ------------------------------------------------
    const tableStartY = customerY + 5;
    const tableRows = items.map((item, index) => {
      const calculation = calculateItem(item);
      return [
        index + 1,
        item.name || "-",
        item.hsnSac || "-",
        item.quantity.toFixed(2),
        item.rate.toFixed(2),
        `${item.gstRate}%`,
        calculation.taxableAmount.toFixed(2),
        calculation.total.toFixed(2),
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      head: [["#", "Product / Service", "HSN", "Qty", "Rate", "GST", "Taxable", "Total"]],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 6.2,
        cellPadding: 1.8,
        lineColor: [205, 205, 205],
        lineWidth: 0.2,
        textColor: [30, 30, 30],
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 6.2,
        halign: "center",
        valign: "middle",
        fillColor: [20, 184, 166],
        textColor: [255, 255, 255],
        cellPadding: 1.8,
      },
      columnStyles: {
        0: { cellWidth: 6, halign: "center" },
        1: { cellWidth: 36 },
        2: { cellWidth: 12 },
        3: { cellWidth: 9, halign: "right" },
        4: { cellWidth: 16, halign: "right" },
        5: { cellWidth: 10, halign: "center" },
        6: { cellWidth: 17, halign: "right" },
        7: { cellWidth: 16, halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section === "head") data.cell.styles.halign = "center";
      },
    });

    // ------------------------------------------------
    // TOTALS
    // ------------------------------------------------
    const finalY =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ||
      tableStartY + 20;

    let summaryY = finalY + 8;
    const summaryLabelX = pageWidth - 58;
    const summaryValueX = pageWidth - margin;

    const row = (label: string, value: string, y: number, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 8.5 : 7.2);
      doc.text(label, summaryLabelX, y);
      doc.text(value, summaryValueX, y, { align: "right" });
    };

    row("Subtotal", money(totals.subtotal), summaryY);
    row("Discount", `- ${money(totals.discount)}`, summaryY + 5);
    row("Taxable", money(totals.taxable), summaryY + 10);

    let gstY = summaryY + 15;
    if (gstType === "cgst-sgst") {
      row("CGST", money(cgst), gstY);
      row("SGST", money(sgst), gstY + 5);
      row("Total GST", money(totals.gst), gstY + 10, true);
      summaryY = gstY + 10;
    } else {
      row("IGST", money(igst), gstY);
      row("Total GST", money(totals.gst), gstY + 5, true);
      summaryY = gstY + 5;
    }

    const grandTotalY = summaryY + 9;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.35);
    doc.line(summaryLabelX, grandTotalY - 4, summaryValueX, grandTotalY - 4);
    row("Grand Total", money(totals.total), grandTotalY, true);

    // ------------------------------------------------
    // PAYMENT TERMS + FOOTER
    // ------------------------------------------------
    if (paymentTerms) {
      const termsY = Math.min(grandTotalY + 12, pageHeight - 28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("Payment Terms", margin, termsY);
      doc.setFont("helvetica", "normal");
      const terms = doc.splitTextToSize(paymentTerms, contentWidth * 0.58);
      doc.text(terms, margin, termsY + 5);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Generated using Noorado GST Invoice Generator",
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );

    const safeFileName = invoiceNo.replace(/[^a-zA-Z0-9-_]/g, "_");
    doc.save(`${safeFileName}-short-A5.pdf`);
  };

  // ==================================================
  // GENERATE SELECTED PDF
  // ==================================================

  const generateInvoicePDF = (template: InvoiceTemplate) => {
    setInvoiceTemplate(template);

    let doc: jsPDF;

    if (template === "short") {
      doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a5",
      });

      generateShortInvoicePDF(doc);
    } else {
      doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      generateLongInvoicePDF(doc);
    }

    setShowTemplateSelector(false);
  };

  const validateInvoice = () => {
    const errors: string[] = [];

    // Seller validation
    if (!sellerName.trim()) {
      errors.push("Seller business name is required.");
    }

    if (!sellerAddress.trim()) {
      errors.push("Seller business address is required.");
    }

    if (!sellerGSTIN.trim()) {
      errors.push("Seller GSTIN is required.");
    }

    if (!sellerState) {
      errors.push("Seller state is required.");
    }

    if (!sellerPincode.trim()) {
      errors.push("Seller PIN code is required.");
    } else if (sellerPincode.length !== 6) {
      errors.push("Seller PIN code must be 6 digits.");
    }

    // Customer validation
    if (!customerName.trim()) {
      errors.push("Customer name is required.");
    }

    if (!customerAddress.trim()) {
      errors.push("Customer address is required.");
    }

    if (!customerState) {
      errors.push("Customer state is required.");
    }

    // Invoice validation
    if (!invoiceNumber.trim()) {
      errors.push("Invoice number is required.");
    }

    if (!invoiceDate) {
      errors.push("Invoice date is required.");
    }

    if (!placeOfSupply.trim()) {
      errors.push("Place of supply is required.");
    }

    // Items validation
    if (items.length === 0) {
      errors.push("At least one product or service is required.");
    }

    items.forEach((item, index) => {
      if (!item.name.trim()) {
        errors.push(`Item ${index + 1}: Product / Service is required.`);
      }

      if (!item.hsnSac.trim()) {
        errors.push(`Item ${index + 1}: HSN / SAC is required.`);
      }

      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0.`);
      }

      if (item.rate <= 0) {
        errors.push(`Item ${index + 1}: Rate must be greater than 0.`);
      }
    });

    return errors;
  };

  // ==================================================
  // GENERATE BUTTON
  // ==================================================

  const handleGenerateInvoice = () => {
    const errors = validateInvoice();

    if (errors.length > 0) {
      window.alert(errors.join("\n"));
      return;
    }

    setShowTemplateSelector(true);
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="gst-invoice-page">

      {/* ============================================
          HERO
      ============================================ */}

      <section className="gst-invoice-hero">
        <div className="gst-invoice-container">

         <Link
  to="/tools"
  className="gst-invoice-back-link"
>
  <span className="gst-invoice-back-arrow">←</span>
  <span>Back to Tools</span>
</Link>

          <h1>
            GST Invoice Generator
          </h1>

          <p>
            Create a professional GST invoice
            with your business, customer and
            product details.
          </p>

        </div>
      </section>

      {/* ============================================
          MAIN
      ============================================ */}

      <section className="gst-invoice-section">
        <div className="gst-invoice-container">

          {/* ======================================
              SELLER
          ====================================== */}

          <section className="gst-invoice-card">

            <div className="gst-invoice-card-header">
              <span>01</span>

              <div>
                <small>
                  SELLER DETAILS
                </small>

                <h2>
                  Company / Business Information
                </h2>
              </div>
            </div>

            <div className="gst-invoice-grid">

              <div className="gst-invoice-form-group">
                <label>
                  Company / Business Name
                </label>

                <input
                  value={sellerName}
                  onChange={(e) =>
                    setSellerName(
                      e.target.value
                    )
                  }
                  placeholder="Enter company name"
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>
                  GSTIN
                </label>

                <input
                  value={sellerGSTIN}
                  onChange={(e) =>
                    setSellerGSTIN(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter GSTIN"
                  maxLength={15}
                />
              </div>

              <div className="gst-invoice-form-group gst-invoice-full">
                <label>
                  Business Address
                </label>

                <textarea
                  value={sellerAddress}
                  onChange={(e) =>
                    setSellerAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter complete business address"
                  rows={3}
                />
              </div>

              <div className="gst-invoice-form-group">
  <label>State</label>

  <select
    value={sellerState}
    onChange={(e) =>
      setSellerState(e.target.value)
    }
  >
    <option value="">
      Select State
    </option>

    {INDIAN_STATES.map((state) => (
      <option
        key={state}
        value={state}
      >
        {state}
      </option>
    ))}
  </select>
</div>


              <div className="gst-invoice-form-group">
                <label>PIN Code</label>

                <input
                  value={sellerPincode}
                  onChange={(e) =>
                    setSellerPincode(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="PIN Code"
                  maxLength={6}
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>Phone</label>

                <input
                  value={sellerPhone}
                  onChange={(e) =>
                    setSellerPhone(
                      e.target.value
                    )
                  }
                  placeholder="Phone number"
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={sellerEmail}
                  onChange={(e) =>
                    setSellerEmail(
                      e.target.value
                    )
                  }
                  placeholder="Email address"
                />
              </div>

            </div>
          </section>

          {/* ======================================
              CUSTOMER
          ====================================== */}

          <section className="gst-invoice-card">

            <div className="gst-invoice-card-header">
              <span>02</span>

              <div>
                <small>
                  BILL TO
                </small>

                <h2>
                  Customer Information
                </h2>
              </div>
            </div>

            <div className="gst-invoice-grid">

              <div className="gst-invoice-form-group">
                <label>
                  Customer / Company Name
                </label>

                <input
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(
                      e.target.value
                    )
                  }
                  placeholder="Enter customer name"
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>GSTIN</label>

                <input
                  value={customerGSTIN}
                  onChange={(e) =>
                    setCustomerGSTIN(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter customer GSTIN"
                  maxLength={15}
                />
              </div>

              <div className="gst-invoice-form-group gst-invoice-full">
                <label>Address</label>

                <textarea
                  value={customerAddress}
                  onChange={(e) =>
                    setCustomerAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter customer address"
                  rows={3}
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>State</label>

                <select
                  value={customerState}
                  onChange={(e) =>
                    setCustomerState(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select State
                  </option>

                  {INDIAN_STATES.map((state) => (
                    <option
                      key={state}
                      value={state}
                    >
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gst-invoice-form-group">
                <label>PIN Code</label>

                <input
                  value={customerPincode}
                  onChange={(e) =>
                    setCustomerPincode(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="PIN Code"
                  maxLength={6}
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>Phone</label>

                <input
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(
                      e.target.value
                    )
                  }
                  placeholder="Phone number"
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) =>
                    setCustomerEmail(
                      e.target.value
                    )
                  }
                  placeholder="Email address"
                />
              </div>

            </div>
          </section>

          {/* ======================================
              INVOICE DETAILS
          ====================================== */}

          <section className="gst-invoice-card">

            <div className="gst-invoice-card-header">
              <span>03</span>

              <div>
                <small>
                  INVOICE DETAILS
                </small>

                <h2>
                  Invoice Information
                </h2>
              </div>
            </div>

            <div className="gst-invoice-grid">

              <div className="gst-invoice-form-group">
                <label>
                  Invoice Number
                </label>

                <input
                  value={invoiceNumber}
                  onChange={(e) =>
                    setInvoiceNumber(
                      e.target.value
                    )
                  }
                  placeholder="INV-001"
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>
                  Invoice Date
                </label>

                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) =>
                    setInvoiceDate(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>
                  Place of Supply
                </label>

                <input
                  value={placeOfSupply}
                  onChange={(e) =>
                    setPlaceOfSupply(
                      e.target.value
                    )
                  }
                  placeholder="State / Place"
                />
              </div>

              <div className="gst-invoice-form-group">
                <label>
                  GST Calculation
                </label>

                <select
                  value={gstType}
                  onChange={(e) =>
                    setGstType(
                      e.target.value as GstType
                    )
                  }
                >
                  <option value="cgst-sgst">
                    CGST + SGST
                  </option>

                  <option value="igst">
                    IGST
                  </option>
                </select>
              </div>

              <div className="gst-invoice-form-group gst-invoice-full">
                <label>
                  Payment Terms
                </label>

                <textarea
                  value={paymentTerms}
                  onChange={(e) =>
                    setPaymentTerms(
                      e.target.value
                    )
                  }
                  placeholder="Enter payment terms"
                  rows={3}
                />
              </div>

            </div>
          </section>

          {/* ======================================
              ITEMS
          ====================================== */}

          <section className="gst-invoice-card">

            <div className="gst-invoice-card-header">
              <span>04</span>

              <div>
                <small>ITEMS</small>

                <h2>
                  Products / Services
                </h2>
              </div>
            </div>

            <div className="gst-invoice-items">

              {items.map(
                (item, index) => {
                  const calculation =
                    calculateItem(item);

                  return (
                    <div
                      className="gst-invoice-item"
                      key={item.id}
                    >

                      <div className="gst-invoice-item-title">

                        <strong>
                          Item {index + 1}
                        </strong>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                          >
                            Remove
                          </button>
                        )}

                      </div>

                      <div className="gst-invoice-grid">

                        <div className="gst-invoice-form-group">
                          <label>
                            Product / Service
                          </label>

                          <input
                            value={item.name}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Product or service"
                          />
                        </div>

                        <div className="gst-invoice-form-group">
                          <label>
                            HSN / SAC
                          </label>

                          <input
                            value={item.hsnSac}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "hsnSac",
                                e.target.value
                              )
                            }
                            placeholder="HSN / SAC code"
                          />
                        </div>

                        <div className="gst-invoice-form-group">
                          <label>
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                Math.max(
                                  0,
                                  Number(
                                    e.target.value
                                  )
                                )
                              )
                            }
                          />
                        </div>

                        <div className="gst-invoice-form-group">
                          <label>
                            Rate
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "rate",
                                Math.max(
                                  0,
                                  Number(
                                    e.target.value
                                  )
                                )
                              )
                            }
                          />
                        </div>

                        <div className="gst-invoice-form-group">
                          <label>
                            Discount %
                          </label>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "discount",
                                Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(
                                      e.target.value
                                    )
                                  )
                                )
                              )
                            }
                          />
                        </div>

                        <div className="gst-invoice-form-group">
                          <label>
                            GST Rate
                          </label>

                          <select
                            value={item.gstRate}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "gstRate",
                                Number(
                                  e.target.value
                                )
                              )
                            }
                          >
                            {GST_RATES.map(
                              (rate) => (
                                <option
                                  key={rate}
                                  value={rate}
                                >
                                  {rate}%
                                </option>
                              )
                            )}
                          </select>
                        </div>

                      </div>

                      <div className="gst-invoice-item-summary">

                        <span>
                          Taxable Amount

                          <strong>
                            {formatCurrency(
                              calculation.taxableAmount
                            )}
                          </strong>
                        </span>

                        <span>
                          GST

                          <strong>
                            {formatCurrency(
                              calculation.gstAmount
                            )}
                          </strong>
                        </span>

                        <span>
                          Item Total

                          <strong>
                            {formatCurrency(
                              calculation.total
                            )}
                          </strong>
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <button
              type="button"
              className="gst-invoice-add-item"
              onClick={addItem}
            >
              + Add Product / Service
            </button>

          </section>

          <section className="gst-invoice-card">

            <div className="gst-invoice-card-header">
              <span>05</span>

              <div>
                <small>INVOICE LOGO</small>

                <h2>
                  Add Business Logo
                </h2>
              </div>
            </div>

            <div className="gst-invoice-logo-upload">

              <label
                htmlFor="invoice-logo"
                className="gst-invoice-logo-upload-button"
              >
                + Choose Logo
              </label>

              <input
                id="invoice-logo"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoUpload}
                hidden
              />

              {logo ? (
                <div className="gst-invoice-logo-preview">

                  <img
                    src={logo}
                    alt="Business logo preview"
                  />

                  <button
                    type="button"
                    onClick={() => setLogo(null)}
                  >
                    Remove Logo
                  </button>

                </div>
              ) : (
                <p>
                  Optional. Upload your business logo
                  to display it on the invoice.
                </p>
              )}

            </div>

          </section>

          {/* ======================================
              SUMMARY
          ====================================== */}

          <section className="gst-invoice-summary-card">

            <span>
              CALCULATION SUMMARY
            </span>

            <h2>
              Invoice Total
            </h2>

            <div className="gst-invoice-summary-list">

              <div>
                <span>Subtotal</span>

                <strong>
                  {formatCurrency(
                    totals.subtotal
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Total Discount
                </span>

                <strong>
                  -{" "}
                  {formatCurrency(
                    totals.discount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Taxable Amount
                </span>

                <strong>
                  {formatCurrency(
                    totals.taxable
                  )}
                </strong>
              </div>

              {gstType ===
              "cgst-sgst" ? (
                <>
                  <div>
                    <span>
                      CGST
                    </span>

                    <strong>
                      {formatCurrency(
                        cgst
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      SGST
                    </span>

                    <strong>
                      {formatCurrency(
                        sgst
                      )}
                    </strong>
                  </div>
                </>
              ) : (
                <div>
                  <span>
                    IGST
                  </span>

                  <strong>
                    {formatCurrency(
                      igst
                    )}
                  </strong>
                </div>
              )}

              <div>
                <span>
                  Total GST
                </span>

                <strong>
                  {formatCurrency(
                    totals.gst
                  )}
                </strong>
              </div>

            </div>

            <div className="gst-invoice-grand-total">

              <span>
                Grand Total
              </span>

              <strong>
                {formatCurrency(
                  totals.total
                )}
              </strong>

            </div>

            <div className="gst-invoice-actions">

              <button
                type="button"
                onClick={
                  handleGenerateInvoice
                }
              >
                Generate Invoice
              </button>

            </div>

          </section>

        </div>
      </section>

      {/* ============================================
          TEMPLATE SELECTOR MODAL
      ============================================ */}

      {showTemplateSelector && (
        <div className="gst-invoice-template-overlay">

          <div className="gst-invoice-template-modal">

            <button
              type="button"
              className="gst-invoice-template-close"
              onClick={() =>
                setShowTemplateSelector(false)
              }
              aria-label="Close"
            >
              ×
            </button>

            <span className="gst-invoice-template-label">
              PDF TEMPLATE
            </span>

            <h2>
              Choose Invoice Template
            </h2>

            <p>
              Select the invoice layout you
              want to generate.
            </p>

            <div className="gst-invoice-template-options">

              {/* LONG TEMPLATE */}

              <button
                type="button"
                className={
                  invoiceTemplate === "long"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  generateInvoicePDF(
                    "long"
                  )
                }
              >
                <div className="gst-invoice-template-preview long-preview">
                  <div className="preview-title">
                    TAX INVOICE
                  </div>

                  <div className="preview-lines">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="preview-table">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <strong>
                  Long Template
                </strong>

                <span>
                  Detailed GST invoice with
                  complete business and
                  customer information.
                </span>

                <em>
                  Select Long
                </em>
              </button>

              {/* SHORT TEMPLATE */}

              <button
                type="button"
                className={
                  invoiceTemplate === "short"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  generateInvoicePDF(
                    "short"
                  )
                }
              >
                <div className="gst-invoice-template-preview short-preview">
                  <div className="preview-title">
                    TAX INVOICE
                  </div>

                  <div className="preview-lines">
                    <span />
                    <span />
                  </div>

                  <div className="preview-table">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <strong>
                  Short Template
                </strong>

                <span>
                  Compact invoice for quick
                  billing with essential
                  information.
                </span>

                <em>
                  Select Short
                </em>
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default GSTInvoiceGeneratorPage;