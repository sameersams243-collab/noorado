import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import ToolRecommendation from "../../ToolsRecommendation/ToolRecommendation";
import "./ProfitLossCalculatorPage.css";

type CalcStatus = "profit" | "loss" | "neutral" | "idle";

const formatIndianNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatCurrency = (value: number) =>
  `₹${formatIndianNumber(value)}`;

const formatPercent = (value: number) =>
  `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;

const parseInputNumber = (value: string): number => {
  const sanitized = value.replace(/[^\d.]/g, "");
  if (!sanitized) return 0;
  const parts = sanitized.split(".");
  const whole = parts[0] || "0";
  const fraction = parts.slice(1).join("").slice(0, 2);
  const num = Number(fraction ? `${whole}.${fraction}` : whole);
  return Number.isFinite(num) ? num : 0;
};

function ProfitLossCalculatorPage() {
  const [costInput, setCostInput] = useState("");
  const [sellInput, setSellInput] = useState("");

  const [isCostFocused, setIsCostFocused] = useState(false);
  const [isSellFocused, setIsSellFocused] = useState(false);

  const [costReplaceOnNext, setCostReplaceOnNext] =
    useState(false);
  const [sellReplaceOnNext, setSellReplaceOnNext] =
    useState(false);

  const [hasCalculated, setHasCalculated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const costPrice = parseInputNumber(costInput);
  const sellingPrice = parseInputNumber(sellInput);

  const result = useMemo(() => {
    if (!hasCalculated) {
      return {
        status: "idle" as CalcStatus,
        statusLabel: "READY TO CALCULATE",
        difference: 0,
        percentage: 0,
        costPrice: 0,
        sellingPrice: 0,
        isValid: false,
      };
    }

    if (costPrice <= 0) {
      return {
        status: "idle" as CalcStatus,
        statusLabel: "INVALID INPUT",
        difference: 0,
        percentage: 0,
        costPrice,
        sellingPrice,
        isValid: false,
      };
    }

    if (sellingPrice > costPrice) {
      const profit = sellingPrice - costPrice;
      const percentage = (profit / costPrice) * 100;
      return {
        status: "profit" as CalcStatus,
        statusLabel: "PROFIT",
        difference: profit,
        percentage,
        costPrice,
        sellingPrice,
        isValid: true,
      };
    }

    if (sellingPrice < costPrice) {
      const loss = costPrice - sellingPrice;
      const percentage = (loss / costPrice) * 100;
      return {
        status: "loss" as CalcStatus,
        statusLabel: "LOSS",
        difference: loss,
        percentage,
        costPrice,
        sellingPrice,
        isValid: true,
      };
    }

    // sellingPrice === costPrice
    return {
      status: "neutral" as CalcStatus,
      statusLabel: "NO PROFIT / NO LOSS",
      difference: 0,
      percentage: 0,
      costPrice,
      sellingPrice,
      isValid: true,
    };
  }, [hasCalculated, costPrice, sellingPrice]);

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      if (costReplaceOnNext && val !== "") {
        setCostInput(val);
        setCostReplaceOnNext(false);
        setErrorMessage("");
        return;
      }
      setCostInput(val);
      setErrorMessage("");
    }
  };

  const handleSellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      if (sellReplaceOnNext && val !== "") {
        setSellInput(val);
        setSellReplaceOnNext(false);
        setErrorMessage("");
        return;
      }
      setSellInput(val);
      setErrorMessage("");
    }
  };

  const handleCostFocus = (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    setIsCostFocused(true);
    if (costPrice > 0) {
      setCostReplaceOnNext(true);
      requestAnimationFrame(() => {
        event.target.select();
      });
    }
  };

  const handleSellFocus = (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    setIsSellFocused(true);
    if (sellingPrice > 0) {
      setSellReplaceOnNext(true);
      requestAnimationFrame(() => {
        event.target.select();
      });
    }
  };

  const handleCostBlur = () => {
    setIsCostFocused(false);
    setCostReplaceOnNext(false);
  };

  const handleSellBlur = () => {
    setIsSellFocused(false);
    setSellReplaceOnNext(false);
  };

  const handleCostKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      setCostReplaceOnNext(false);
    }
  };

  const handleSellKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      setSellReplaceOnNext(false);
    }
  };

  const handleCalculate = () => {
    if (costInput.trim() === "" || costPrice <= 0) {
      setErrorMessage("Cost Price must be greater than ₹0.");
      setHasCalculated(false);
      return;
    }

    if (sellingPrice < 0) {
      setErrorMessage("Selling Price cannot be negative.");
      setHasCalculated(false);
      return;
    }

    setErrorMessage("");
    setHasCalculated(true);
  };

  const handleReset = () => {
    setCostInput("");
    setSellInput("");
    setIsCostFocused(false);
    setIsSellFocused(false);
    setHasCalculated(false);
    setErrorMessage("");
  };

  const isDisplayingResults = hasCalculated && result.isValid && !errorMessage;

  return (
    <>
      <Navbar />

      <main className="pl-page">
        {/* ========================================
            HERO SECTION
        ======================================== */}
        <section className="pl-hero">
          <div className="pl-container">
            <Link to="/tools" className="pl-back-link">
              ← Back to Tools
            </Link>

            <span className="pl-label">NOORADO CALCULATOR</span>

            <h1>Profit &amp; Loss Calculator</h1>

            <p>
              Calculate profit, loss and percentage from your selling price.
            </p>
          </div>
        </section>

        {/* ========================================
            CALCULATOR SECTION
        ======================================== */}
        <section className="pl-section">
          <div className="pl-container">
            <div className="pl-layout">
              {/* ========================================
                  INPUT CARD
              ======================================== */}
              <div className="pl-card" aria-labelledby="pl-card-heading">
                <div className="pl-card-header">
                  <span>BUSINESS</span>
                  <h2 id="pl-card-heading">Enter your details</h2>
                </div>

                {/* COST PRICE */}
                <div className="pl-form-group">
                  <label htmlFor="cost-price-input">Cost Price (CP)</label>
                  <div className="pl-input-wrapper">
                    <span>₹</span>
                    <input
                      id="cost-price-input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      value={
                        isCostFocused
                          ? costInput
                          : costPrice > 0
                          ? formatIndianNumber(costPrice)
                          : costInput
                      }
                      onFocus={handleCostFocus}
                      onBlur={handleCostBlur}
                      onKeyDown={handleCostKeyDown}
                      onChange={handleCostChange}
                      aria-describedby={errorMessage ? "pl-error-msg" : undefined}
                    />
                  </div>
                  <small className="pl-helper-text">
                    Total amount spent to purchase or produce the item.
                  </small>
                </div>

                {/* SELLING PRICE */}
                <div className="pl-form-group">
                  <label htmlFor="selling-price-input">Selling Price (SP)</label>
                  <div className="pl-input-wrapper">
                    <span>₹</span>
                    <input
                      id="selling-price-input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      value={
                        isSellFocused
                          ? sellInput
                          : sellingPrice > 0
                          ? formatIndianNumber(sellingPrice)
                          : sellInput
                      }
                      onFocus={handleSellFocus}
                      onBlur={handleSellBlur}
                      onKeyDown={handleSellKeyDown}
                      onChange={handleSellChange}
                    />
                  </div>
                  <small className="pl-helper-text">
                    Final revenue received from selling the item.
                  </small>
                </div>

                {errorMessage && (
                  <p id="pl-error-msg" className="pl-error-message" role="alert">
                    {errorMessage}
                  </p>
                )}

                <div className="pl-actions">
                  <button
                    type="button"
                    className="pl-calculate-btn"
                    onClick={handleCalculate}
                  >
                    Calculate
                  </button>

                  <button
                    type="button"
                    className="pl-reset-btn"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* ========================================
                  RESULTS CARD
              ======================================== */}
              <div className="pl-results-column">
                <div
                  className="pl-results"
                  aria-live="polite"
                  aria-label="Profit and Loss Calculation Result"
                >
                  <div className="pl-primary-result">
                    <div className="pl-status-header">
                      <span>CALCULATION RESULT</span>
                      {isDisplayingResults && (
                        <span className={`pl-status-badge ${result.status}`}>
                          {result.statusLabel}
                        </span>
                      )}
                    </div>

                    <strong className={`pl-result-number ${isDisplayingResults ? result.status : ""}`}>
                      {isDisplayingResults
                        ? result.status === "profit"
                          ? `+${formatCurrency(result.difference)}`
                          : result.status === "loss"
                          ? `-${formatCurrency(result.difference)}`
                          : formatCurrency(0)
                        : formatCurrency(0)}
                    </strong>

                    <p>
                      {isDisplayingResults
                        ? result.status === "profit"
                          ? `You made a profit of ${formatCurrency(result.difference)} (${formatPercent(result.percentage)} return on cost).`
                          : result.status === "loss"
                          ? `You incurred a loss of ${formatCurrency(result.difference)} (${formatPercent(result.percentage)} drop from cost).`
                          : "Selling price equals cost price. No profit and no loss."
                        : "Enter Cost Price and Selling Price to calculate profit or loss."}
                    </p>
                  </div>

                  <div className="pl-result-grid">
                    <div>
                      <span>Cost Price</span>
                      <strong>{isDisplayingResults ? formatCurrency(result.costPrice) : formatCurrency(0)}</strong>
                    </div>
                    <div>
                      <span>Selling Price</span>
                      <strong>{isDisplayingResults ? formatCurrency(result.sellingPrice) : formatCurrency(0)}</strong>
                    </div>
                    <div>
                      <span>
                        {isDisplayingResults && result.status === "loss"
                          ? "Loss Amount"
                          : "Profit Amount"}
                      </span>
                      <strong>{isDisplayingResults ? formatCurrency(result.difference) : formatCurrency(0)}</strong>
                    </div>
                    <div>
                      <span>
                        {isDisplayingResults && result.status === "loss"
                          ? "Loss Percentage"
                          : "Profit Percentage"}
                      </span>
                      <strong>{isDisplayingResults ? formatPercent(result.percentage) : "0.00%"}</strong>
                    </div>
                  </div>

                  {isDisplayingResults && (
                    <div className="pl-formula-box">
                      <span>FORMULA USED</span>
                      {result.status === "profit" && (
                        <code>Profit % = (({formatCurrency(result.sellingPrice)} - {formatCurrency(result.costPrice)}) ÷ {formatCurrency(result.costPrice)}) × 100 = {formatPercent(result.percentage)}</code>
                      )}
                      {result.status === "loss" && (
                        <code>Loss % = (({formatCurrency(result.costPrice)} - {formatCurrency(result.sellingPrice)}) ÷ {formatCurrency(result.costPrice)}) × 100 = {formatPercent(result.percentage)}</code>
                      )}
                      {result.status === "neutral" && (
                        <code>No Profit / No Loss: SP ({formatCurrency(result.sellingPrice)}) = CP ({formatCurrency(result.costPrice)})</code>
                      )}
                    </div>
                  )}
                </div>

                {/* SUMMARY EXAMPLES CARD */}
                <div className="pl-summary-card">
                  <h3>Quick Reference Examples</h3>
                  <ul>
                    <li>
                      <strong>Profit Example:</strong> CP = ₹1,000.00, SP = ₹1,200.00 → Profit = <strong>₹200.00 (20.00%)</strong>
                    </li>
                    <li>
                      <strong>Loss Example:</strong> CP = ₹1,000.00, SP = ₹800.00 → Loss = <strong>₹200.00 (20.00%)</strong>
                    </li>
                    <li>
                      <strong>Break-Even:</strong> CP = ₹1,000.00, SP = ₹1,000.00 → <strong>No Profit / No Loss (0.00%)</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ========================================
                ABOUT THIS TOOL SECTION
            ======================================== */}
            <div className="pl-info">
              <span>ABOUT THIS TOOL</span>

              <h2>What is Profit &amp; Loss?</h2>
              <p>
                Profit and Loss is the core financial measure of trade and business operations.
                A <strong>Profit</strong> occurs when the selling price of a product or service
                is greater than its cost price. Conversely, a <strong>Loss</strong> occurs when
                the selling price is lower than the cost price.
              </p>

              <h2>How is profit percentage calculated?</h2>
              <p>
                Profit percentage measures the return earned relative to the initial cost price:
              </p>
              <div className="pl-formula">
                Profit Percentage = (Profit ÷ Cost Price) × 100
              </div>

              <h2>How is loss percentage calculated?</h2>
              <p>
                Loss percentage measures the fraction of capital lost relative to the cost price:
              </p>
              <div className="pl-formula">
                Loss Percentage = (Loss ÷ Cost Price) × 100
              </div>
            </div>

            {/* ========================================
                TOOL RECOMMENDATION
            ======================================== */}
            <div className="pl-recommendation-wrap">
              <ToolRecommendation
                title="Need to generate a GST invoice for your sales?"
                description="Create a professional GST invoice with itemized tax breakdowns and download it as PDF instantly."
                buttonText="Create GST Invoice →"
                path="/tools/gst-invoice-generator"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ProfitLossCalculatorPage;

