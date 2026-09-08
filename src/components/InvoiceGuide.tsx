import { useState } from "react";
import { Link } from "react-router-dom";
import "./InvoiceGuide.css";

type FeaturedProduct = {
  id: "gst" | "hr";
  category: string;
  title: string;
  description: string;
  features: string[];
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
  buttonText: string;
  buttonPath: string;
};

const PRODUCTS: FeaturedProduct[] = [
  {
    id: "gst",
    category: "GST INVOICE GENERATOR",
    title: "Create Professional GST Invoices",
    description:
      "Create professional GST invoices quickly and easily with Noorado. Add your business and customer details, products, GST, discounts and billing information, then review and download the final invoice as a PDF.",
    features: [
      "Business & customer details",
      "Products, prices & quantities",
      "GST & discount calculation",
      "Professional PDF download",
    ],
    steps: [
      {
        number: "01",
        title: "Enter Your Details",
        description:
          "Add your business information, customer details, invoice number, date and billing information.",
      },
      {
        number: "02",
        title: "Add Products or Services",
        description:
          "Enter items, quantities, prices, GST rates, discounts and other invoice details.",
      },
      {
        number: "03",
        title: "Review & Download",
        description:
          "Review the completed invoice and download a professional PDF ready to share.",
      },
    ],
    buttonText: "Generate GST Invoice →",
    buttonPath: "/tools/gst-invoice-generator",
  },
  {
    id: "hr",
    category: "HR LETTER GENERATOR",
    title: "Create Professional HR Letters",
    description:
      "Create professional Offer, Appointment, Joining and Internship Letters with Noorado. Set up your company branding, add candidate details, customize the document and review the A4 preview before downloading the final PDF.",
    features: [
      "Offer, appointment & joining letters",
      "Company logo & signature",
      "Terms & Conditions",
      "A4 preview & PDF download",
    ],
    steps: [
      {
        number: "01",
        title: "Set Up Your Company",
        description:
          "Add company information, HR details, logo, signature, template, style, margins and Terms & Conditions.",
      },
      {
        number: "02",
        title: "Add Candidate Details",
        description:
          "Enter the candidate's name, designation, department, salary or CTC, joining date, location and employment type.",
      },
      {
        number: "03",
        title: "Review & Download",
        description:
          "Check the complete A4 letter, branding, candidate details, signature and Terms & Conditions before downloading the PDF.",
      },
    ],
    buttonText: "Generate HR Letter →",
    buttonPath: "/tools/offer-joining-letter-generator",
  },
];

function InvoiceGuide() {
  const [activeProduct, setActiveProduct] = useState<"gst" | "hr">("hr");

  const product =
    PRODUCTS.find((item) => item.id === activeProduct) ?? PRODUCTS[0];

  return (
    <section className="invoice-guide">
      <div className="invoice-guide-container">

        {/* HEADER */}
        <div className="invoice-guide-heading">
          <span className="invoice-guide-label">
            NOORADO TOOLS
          </span>

          <h2>
            Create Professional Documents
            <br />
            for Your Everyday Business
          </h2>

          <p>
            Simple, practical tools built by Noorado to help you create
            professional business documents faster.
          </p>
        </div>

        {/* PRODUCT SWITCHER */}
        <div
          className="invoice-guide-switcher"
          aria-label="Featured Noorado tools"
        >
          {PRODUCTS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`invoice-guide-switcher-button ${
                activeProduct === item.id ? "active" : ""
              }`}
              onClick={() => setActiveProduct(item.id)}
            >
              <span className="invoice-guide-switcher-category">
                {item.category}
              </span>

              <strong>
                {item.id === "gst"
                  ? "GST Invoice Generator"
                  : "HR Letter Generator"}
              </strong>
            </button>
          ))}
        </div>

        {/* FEATURED PRODUCT */}
        <div className="invoice-guide-featured">

          {/* LEFT */}
          <div className="invoice-guide-featured-content">

            <span className="invoice-guide-product-label">
              {product.category}
            </span>

            <h3>
              {product.title}
            </h3>

            <p className="invoice-guide-product-description">
              {product.description}
            </p>

            {/* FEATURES */}
            <div className="invoice-guide-features">
              {product.features.map((feature) => (
                <div
                  className="invoice-guide-feature"
                  key={feature}
                >
                  <span className="invoice-guide-feature-check">
                    ✓
                  </span>

                  <span>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="invoice-guide-product-action">
              <Link
                to={product.buttonPath}
                className="invoice-guide-button"
              >
                {product.buttonText}
              </Link>
            </div>
          </div>

          {/* RIGHT - DOCUMENT PREVIEW */}
          <div className="invoice-guide-preview-wrap">
            <div className="invoice-guide-preview-header">
              <span>LIVE DOCUMENT PREVIEW</span>

              <span className="invoice-guide-preview-status">
                READY
              </span>
            </div>

            {product.id === "hr" ? (
              <div className="invoice-guide-paper invoice-guide-paper-letter">

                <div className="invoice-guide-paper-company">
                  <strong>
                    NOORADO TECHNOLOGIES PVT. LTD.
                  </strong>

                  <span>
                    www.noorado.com
                  </span>
                </div>

                <div className="invoice-guide-paper-line" />

                <div className="invoice-guide-paper-date">
                  07 September 2026
                </div>

                <div className="invoice-guide-paper-name">
                  Rahul Verma
                </div>

                <div className="invoice-guide-paper-subject">
                  <strong>Subject:</strong>{" "}
                  Offer Letter
                </div>

                <div className="invoice-guide-paper-salutation">
                  Dear Rahul Verma,
                </div>

                <div className="invoice-guide-paper-text">
                  We are pleased to offer you an opportunity to join
                  our organization. We look forward to having you as
                  part of our team.
                </div>

                <div className="invoice-guide-paper-text small">
                  Your employment will be subject to the terms and
                  conditions specified in the letter.
                </div>

                <div className="invoice-guide-paper-terms">
                  <strong>
                    Terms &amp; Conditions
                  </strong>

                  <span>1. Employment terms apply.</span>
                  <span>2. Company policies must be followed.</span>
                  <span>3. Joining requirements must be completed.</span>
                </div>

                <div className="invoice-guide-paper-sign">
                  Sincerely,
                  <br />
                  <strong>
                    Priya Sharma
                  </strong>
                  <br />
                  Head of Human Resources
                </div>

              </div>
            ) : (
              <div className="invoice-guide-paper invoice-guide-paper-invoice">

                <div className="invoice-guide-paper-invoice-top">
                  <strong>
                    NOORADO
                  </strong>

                  <span>
                    GST INVOICE
                  </span>
                </div>

                <div className="invoice-guide-paper-line" />

                <div className="invoice-guide-invoice-meta">
                  <div>
                    <small>Invoice No.</small>
                    <strong>INV-000125</strong>
                  </div>

                  <div>
                    <small>Date</small>
                    <strong>07 Sep 2026</strong>
                  </div>
                </div>

                <div className="invoice-guide-invoice-box">
                  <small>BILL TO</small>
                  <strong>Customer Name</strong>
                  <span>Customer Address</span>
                </div>

                <div className="invoice-guide-invoice-table">
                  <div className="invoice-guide-invoice-row header">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Amount</span>
                  </div>

                  <div className="invoice-guide-invoice-row">
                    <span>Product / Service</span>
                    <span>2</span>
                    <span>₹2,000</span>
                  </div>

                  <div className="invoice-guide-invoice-row">
                    <span>Product / Service</span>
                    <span>1</span>
                    <span>₹1,000</span>
                  </div>
                </div>

                <div className="invoice-guide-invoice-total">
                  <span>Total</span>
                  <strong>₹3,540</strong>
                </div>

                <div className="invoice-guide-invoice-gst">
                  GST included in final amount
                </div>

              </div>
            )}
          </div>

        </div>

        {/* HOW IT WORKS */}
        <div className="invoice-guide-how">

          <div className="invoice-guide-how-heading">
            <span>
              HOW IT WORKS
            </span>

            <h3>
              Three simple steps to get your document ready.
            </h3>
          </div>

          <div className="invoice-guide-step-grid">
            {product.steps.map((step) => (
              <div
                className="invoice-guide-step"
                key={step.number}
              >
                <span className="invoice-guide-number">
                  {step.number}
                </span>

                <h4>
                  {step.title}
                </h4>

                <p>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

export default InvoiceGuide;