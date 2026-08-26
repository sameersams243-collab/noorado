import { useState } from "react";
import { Link } from "react-router-dom";
import ToolRecommendation from "../../ToolsRecommendation/ToolRecommendation";
import "./GSTDiscountCalculatorPage.css";

const GST_RATES = [0, 5, 12, 18, 28];

type GstType = "cgst-sgst" | "igst";

function GSTDiscountCalculatorPage() {
  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] =
    useState<GstType>("cgst-sgst");

  const numericAmount = Number(amount);

  // Empty discount is treated as 0%
  const numericDiscount =
    discount === "" ? 0 : Number(discount);

  const isValidAmount =
    amount !== "" &&
    Number.isFinite(numericAmount) &&
    numericAmount >= 0;

  const isValidDiscount =
    Number.isFinite(numericDiscount) &&
    numericDiscount >= 0 &&
    numericDiscount <= 100;

  let originalAmount = 0;
  let discountAmount = 0;
  let taxableAmount = 0;
  let gstAmount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let finalAmount = 0;

  if (isValidAmount && isValidDiscount) {
    originalAmount = numericAmount;

    discountAmount =
      originalAmount * (numericDiscount / 100);

    taxableAmount =
      originalAmount - discountAmount;

    gstAmount =
      taxableAmount * (gstRate / 100);

    finalAmount =
      taxableAmount + gstAmount;

    if (gstType === "cgst-sgst") {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    } else {
      igst = gstAmount;
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const handleClear = () => {
    setAmount("");
    setDiscount("");
    setGstRate(18);
    setGstType("cgst-sgst");
  };

  return (
    <main className="gst-discount-page">

      {/* HEADER */}

      <section className="gst-discount-hero">

        <div className="gst-discount-container">

          <Link
            to="/tools"
            className="gst-discount-back-link"
          >
            ← Back to Tools
          </Link>

          <span className="gst-discount-label">
            NOORADO CALCULATOR
          </span>

          <h1>
            GST Discount Calculator
          </h1>

          <p>
            Calculate discount, taxable amount, GST
            and final price quickly and accurately.
          </p>

        </div>

      </section>


      {/* CALCULATOR */}

      <section className="gst-discount-section">

        <div className="gst-discount-container">

          <div className="gst-discount-layout">

            {/* INPUT CARD */}

            <div className="gst-discount-card">

              <div className="gst-discount-card-header">

                <span>
                  CALCULATE DISCOUNT + GST
                </span>

                <h2>
                  Enter your details
                </h2>

              </div>


              {/* AMOUNT */}

              <div className="gst-discount-form-group">

                <label htmlFor="discount-amount">
                  Original Amount
                </label>

                <div className="gst-discount-input-wrapper">

                  <span>
                    ₹
                  </span>

                  <input
                    id="discount-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* DISCOUNT */}

              <div className="gst-discount-form-group">

                <label htmlFor="discount-rate">
                  Discount
                </label>

                <div className="gst-discount-input-wrapper">

                  <input
                    id="discount-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter discount"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(e.target.value)
                    }
                  />

                  <span>
                    %
                  </span>

                </div>

              </div>


              {/* GST RATE */}

              <div className="gst-discount-form-group">

                <label htmlFor="discount-gst-rate">
                  GST Rate
                </label>

                <select
                  id="discount-gst-rate"
                  value={gstRate}
                  onChange={(e) =>
                    setGstRate(
                      Number(e.target.value)
                    )
                  }
                >

                  {GST_RATES.map((rate) => (

                    <option
                      value={rate}
                      key={rate}
                    >
                      {rate}%
                    </option>

                  ))}

                </select>

              </div>


              {/* GST TYPE */}

              <div className="gst-discount-form-group">

                <label>
                  GST Type
                </label>

                <div className="gst-discount-mode-options">

                  <button
                    type="button"
                    className={
                      gstType === "cgst-sgst"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setGstType("cgst-sgst")
                    }
                  >
                    CGST + SGST
                  </button>

                  <button
                    type="button"
                    className={
                      gstType === "igst"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setGstType("igst")
                    }
                  >
                    IGST
                  </button>

                </div>

              </div>


              {/* CLEAR */}

              <button
                type="button"
                className="gst-discount-clear-button"
                onClick={handleClear}
              >
                Clear
              </button>

            </div>


            <div className="gst-discount-result-column">

            {/* RESULT CARD */}

            <div className="gst-discount-result-card">

              <span className="gst-discount-result-label">
                CALCULATION RESULT
              </span>

              <h2>
                Price Breakdown
              </h2>


              <div className="gst-discount-result-list">

                {/* ORIGINAL */}

                <div className="gst-discount-result-row">

                  <span>
                    Original Amount
                  </span>

                  <strong>
                    {formatCurrency(originalAmount)}
                  </strong>

                </div>


                {/* DISCOUNT */}

                <div className="gst-discount-result-row">

                  <span>
                    Discount ({numericDiscount}%)
                  </span>

                  <strong>
                    - {formatCurrency(discountAmount)}
                  </strong>

                </div>


                {/* TAXABLE */}

                <div className="gst-discount-result-row">

                  <span>
                    Taxable Amount
                  </span>

                  <strong>
                    {formatCurrency(taxableAmount)}
                  </strong>

                </div>


                {/* CGST + SGST */}

                {gstType === "cgst-sgst" && (
                  <>
                    <div className="gst-discount-result-row">

                      <span>
                        CGST ({gstRate / 2}%)
                      </span>

                      <strong>
                        {formatCurrency(cgst)}
                      </strong>

                    </div>

                    <div className="gst-discount-result-row">

                      <span>
                        SGST ({gstRate / 2}%)
                      </span>

                      <strong>
                        {formatCurrency(sgst)}
                      </strong>

                    </div>
                  </>
                )}


                {/* IGST */}

                {gstType === "igst" && (

                  <div className="gst-discount-result-row">

                    <span>
                      IGST ({gstRate}%)
                    </span>

                    <strong>
                      {formatCurrency(igst)}
                    </strong>

                  </div>

                )}


                {/* TOTAL GST */}

                <div className="gst-discount-result-row">

                  <span>
                    Total GST
                  </span>

                  <strong>
                    {formatCurrency(gstAmount)}
                  </strong>

                </div>

              </div>


              {/* FINAL AMOUNT */}

              <div className="gst-discount-total">

                <span>
                  Final Amount
                </span>

                <strong>
                  {formatCurrency(finalAmount)}
                </strong>

              </div>

            </div>

            {isValidAmount && isValidDiscount && (
              <ToolRecommendation
                title="Ready to make a GST invoice?"
                description="Use your calculated discount and GST to create a professional GST invoice."
                buttonText="Generate GST Invoice →"
              />
            )}

            </div>

          </div>


          {/* INFORMATION */}

          <article className="gst-discount-info">

            <span>
              ABOUT THIS TOOL
            </span>

            <h2>
              How does the GST Discount Calculator work?
            </h2>

            <p>
              Enter the original amount and discount
              percentage. The calculator first subtracts
              the discount from the original amount.
            </p>

            <p>
              GST is then calculated on the discounted
              taxable amount.
            </p>

            <p>
              Choose CGST + SGST for an intra-state
              transaction or IGST for an inter-state
              transaction.
            </p>

          </article>

        </div>

      </section>

    </main>
  );
}

export default GSTDiscountCalculatorPage;