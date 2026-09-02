import { Link } from "react-router-dom";
import "./InvoiceGuide.css";

function InvoiceGuide() {
  return (
    <section className="invoice-guide">
      <div className="invoice-guide-container">

        <div className="invoice-guide-heading">
          <span className="invoice-guide-label">
            HOW IT WORKS
          </span>

          <h2>
            Generate Your GST Invoice
            <br />
            in 3 Simple Steps
          </h2>

          <p>
            Create a professional GST invoice quickly and easily
            using Noorado's GST Invoice Generator.
          </p>
        </div>


        <div className="invoice-guide-steps">

          <div className="invoice-guide-step">
            <span className="invoice-guide-number">
              01
            </span>

            <h3>
              Enter Your Details
            </h3>

            <p>
              Add your business information, customer details,
              invoice number, date, and billing information.
            </p>
          </div>


          <div className="invoice-guide-step">
            <span className="invoice-guide-number">
              02
            </span>

            <h3>
              Add Products or Services
            </h3>

            <p>
              Enter your items, quantities, prices, GST rate,
              and other invoice details.
            </p>
          </div>


          <div className="invoice-guide-step">
            <span className="invoice-guide-number">
              03
            </span>

            <h3>
              Generate &amp; Download
            </h3>

            <p>
              Review your invoice, generate it, and download
              a professional copy to share with your customer.
            </p>
          </div>

        </div>


        <div className="invoice-guide-action">
          <Link
            to="/tools/gst-invoice-generator"
            className="invoice-guide-button"
          >
            Generate GST Invoice →
          </Link>
        </div>

      </div>
    </section>
  );
}

export default InvoiceGuide;