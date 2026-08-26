import { useState } from "react";
import { Link } from "react-router-dom";
import ToolRecommendation from "../../ToolsRecommendation/ToolRecommendation";
import "./GSTCalculatorPage.css";

const GST_RATES = [0, 5, 12, 18, 28];

type CalculationMode = "exclusive" | "inclusive";
type GstType = "cgst-sgst" | "igst";

function GSTCalculatorPage() {
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [mode, setMode] =
    useState<CalculationMode>("exclusive");
  const [gstType, setGstType] =
    useState<GstType>("cgst-sgst");

  const numericAmount = Number(amount);

  const isValidAmount =
    amount !== "" &&
    Number.isFinite(numericAmount) &&
    numericAmount >= 0;

  let baseAmount = 0;
  let gstAmount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let totalAmount = 0;

  if (isValidAmount) {
    if (mode === "exclusive") {
      baseAmount = numericAmount;
      gstAmount = baseAmount * (gstRate / 100);
      totalAmount = baseAmount + gstAmount;
    } else {
      totalAmount = numericAmount;
      baseAmount =
        totalAmount / (1 + gstRate / 100);
      gstAmount = totalAmount - baseAmount;
    }

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
    setGstRate(18);
    setMode("exclusive");
    setGstType("cgst-sgst");
  };

  return (
    <main className="gst-page">

      {/* HEADER */}

      <section className="gst-hero">

        <div className="gst-container">

          <Link
            to="/tools"
            className="gst-back-link"
          >
            ← Back to Tools
          </Link>

          <span className="gst-label">
            NOORADO CALCULATOR
          </span>

          <h1>
            GST Calculator
          </h1>

          <p>
            Calculate GST, CGST, SGST, IGST and the
            final amount quickly and accurately.
          </p>

        </div>

      </section>


      {/* CALCULATOR */}

      <section className="gst-section">

        <div className="gst-container">

          <div className="gst-layout">

            {/* INPUT CARD */}

            <div className="gst-card">

              <div className="gst-card-header">

                <span>
                  CALCULATE GST
                </span>

                <h2>
                  Enter your details
                </h2>

              </div>


              {/* AMOUNT */}

              <div className="gst-form-group">

                <label htmlFor="gst-amount">
                  Amount
                </label>

                <div className="gst-input-wrapper">

                  <span>
                    ₹
                  </span>

                  <input
                    id="gst-amount"
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


              {/* GST RATE */}

              <div className="gst-form-group">

                <label htmlFor="gst-rate">
                  GST Rate
                </label>

                <select
                  id="gst-rate"
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

              <div className="gst-form-group">

                <label>
                  GST Type
                </label>

                <div className="gst-mode-options">

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


              {/* MODE */}

              <div className="gst-form-group">

                <label>
                  Price Type
                </label>

                <div className="gst-mode-options">

                  <button
                    type="button"
                    className={
                      mode === "exclusive"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setMode("exclusive")
                    }
                  >
                    GST Exclusive
                  </button>

                  <button
                    type="button"
                    className={
                      mode === "inclusive"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setMode("inclusive")
                    }
                  >
                    GST Inclusive
                  </button>

                </div>

              </div>


              <button
                type="button"
                className="gst-clear-button"
                onClick={handleClear}
              >
                Clear
              </button>

            </div>


            <div className="gst-result-column">

            {/* RESULT CARD */}

            <div className="gst-result-card">

              <span className="gst-result-label">
                CALCULATION RESULT
              </span>

              <h2>
                GST Breakdown
              </h2>


              <div className="gst-result-list">

                {/* BASE AMOUNT */}

                <div className="gst-result-row">

                  <span>
                    Base Amount
                  </span>

                  <strong>
                    {formatCurrency(baseAmount)}
                  </strong>

                </div>


                {/* CGST + SGST */}

                {gstType === "cgst-sgst" && (
                  <>
                    <div className="gst-result-row">

                      <span>
                        CGST ({gstRate / 2}%)
                      </span>

                      <strong>
                        {formatCurrency(cgst)}
                      </strong>

                    </div>


                    <div className="gst-result-row">

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

                  <div className="gst-result-row">

                    <span>
                      IGST ({gstRate}%)
                    </span>

                    <strong>
                      {formatCurrency(igst)}
                    </strong>

                  </div>

                )}


                {/* TOTAL GST */}

                <div className="gst-result-row">

                  <span>
                    Total GST
                  </span>

                  <strong>
                    {formatCurrency(gstAmount)}
                  </strong>

                </div>

              </div>


              {/* FINAL TOTAL */}

              <div className="gst-total">

                <span>
                  Final Amount
                </span>

                <strong>
                  {formatCurrency(totalAmount)}
                </strong>

              </div>

            </div>

            {isValidAmount && <ToolRecommendation />}

            </div>

          </div>


          {/* INFORMATION */}

          <article className="gst-info">

            <span>
              ABOUT THIS TOOL
            </span>

            <h2>
              How does the GST Calculator work?
            </h2>

            <p>
              Enter the amount, choose the applicable
              GST rate and select whether the amount is
              GST exclusive or GST inclusive.
            </p>

            <p>
              Choose CGST + SGST for an intra-state
              transaction or IGST for an inter-state
              transaction.
            </p>

            <p>
              The calculator then displays the GST
              breakdown and final amount.
            </p>

          </article>

        </div>

      </section>

    </main>
  );
}

export default GSTCalculatorPage;