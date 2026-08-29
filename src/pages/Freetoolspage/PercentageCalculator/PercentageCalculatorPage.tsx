import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import ToolRecommendation from "../../ToolsRecommendation/ToolRecommendation";
import "./PercentageCalculatorPage.css";

type CalcMode = "percent-of" | "what-percent" | "increase" | "decrease";

const formatIndianNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatPercent = (value: number) =>
  `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;

function PercentageCalculatorPage() {
  const [activeMode, setActiveMode] = useState<CalcMode>("percent-of");

  // Mode A: What is X% of Y?
  const [percentA, setPercentA] = useState("");
  const [valueA, setValueA] = useState("");

  // Mode B: X is what percent of Y?
  const [partB, setPartB] = useState("");
  const [totalB, setTotalB] = useState("");

  // Mode C: Percentage Increase (Original -> New)
  const [origC, setOrigC] = useState("");
  const [newC, setNewC] = useState("");

  // Mode D: Percentage Decrease (Original -> New)
  const [origD, setOrigD] = useState("");
  const [newD, setNewD] = useState("");

  // Calculations for Mode A: What is X% of Y?
  const calcA = useMemo(() => {
    const p = percentA === "" ? null : Number(percentA);
    const v = valueA === "" ? null : Number(valueA);

    if (p === null || v === null || !Number.isFinite(p) || !Number.isFinite(v)) {
      return { result: 0, isValid: false, hasInput: percentA !== "" || valueA !== "" };
    }

    const result = (p / 100) * v;
    return {
      result,
      isValid: true,
      hasInput: true,
      percentage: p,
      number: v,
    };
  }, [percentA, valueA]);

  // Calculations for Mode B: X is what % of Y?
  const calcB = useMemo(() => {
    const part = partB === "" ? null : Number(partB);
    const total = totalB === "" ? null : Number(totalB);
    const hasInput = partB !== "" || totalB !== "";

    if (part === null || total === null || !Number.isFinite(part) || !Number.isFinite(total)) {
      return { percentage: 0, isValid: false, hasInput, error: "" };
    }

    if (total === 0) {
      return {
        percentage: 0,
        isValid: false,
        hasInput: true,
        error: "Second number (total) cannot be zero.",
      };
    }

    const percentage = (part / total) * 100;
    return {
      percentage,
      isValid: true,
      hasInput: true,
      part,
      total,
      error: "",
    };
  }, [partB, totalB]);

  // Calculations for Mode C: Percentage Increase
  const calcC = useMemo(() => {
    const orig = origC === "" ? null : Number(origC);
    const next = newC === "" ? null : Number(newC);
    const hasInput = origC !== "" || newC !== "";

    if (orig === null || next === null || !Number.isFinite(orig) || !Number.isFinite(next)) {
      return {
        difference: 0,
        percentageIncrease: 0,
        isValid: false,
        hasInput,
        error: "",
      };
    }

    if (orig === 0) {
      return {
        difference: next - orig,
        percentageIncrease: 0,
        isValid: false,
        hasInput: true,
        error: "Original value cannot be zero for percentage increase.",
      };
    }

    const difference = next - orig;
    const percentageIncrease = (difference / Math.abs(orig)) * 100;

    return {
      difference,
      percentageIncrease,
      isValid: true,
      hasInput: true,
      orig,
      next,
      error: "",
    };
  }, [origC, newC]);

  // Calculations for Mode D: Percentage Decrease
  const calcD = useMemo(() => {
    const orig = origD === "" ? null : Number(origD);
    const next = newD === "" ? null : Number(newD);
    const hasInput = origD !== "" || newD !== "";

    if (orig === null || next === null || !Number.isFinite(orig) || !Number.isFinite(next)) {
      return {
        difference: 0,
        percentageDecrease: 0,
        isValid: false,
        hasInput,
        error: "",
      };
    }

    if (orig === 0) {
      return {
        difference: orig - next,
        percentageDecrease: 0,
        isValid: false,
        hasInput: true,
        error: "Original value cannot be zero for percentage decrease.",
      };
    }

    const difference = orig - next;
    const percentageDecrease = (difference / Math.abs(orig)) * 100;

    return {
      difference,
      percentageDecrease,
      isValid: true,
      hasInput: true,
      orig,
      next,
      error: "",
    };
  }, [origD, newD]);

  // Reset Handler
  const handleResetCurrent = () => {
    switch (activeMode) {
      case "percent-of":
        setPercentA("");
        setValueA("");
        break;
      case "what-percent":
        setPartB("");
        setTotalB("");
        break;
      case "increase":
        setOrigC("");
        setNewC("");
        break;
      case "decrease":
        setOrigD("");
        setNewD("");
        break;
    }
  };

  const handleResetAll = () => {
    setPercentA("");
    setValueA("");
    setPartB("");
    setTotalB("");
    setOrigC("");
    setNewC("");
    setOrigD("");
    setNewD("");
  };

  return (
    <>
      <Navbar />

      <main className="pct-page">
        {/* ========================================
            HERO SECTION
        ======================================== */}
        <section className="pct-hero">
          <div className="pct-container">
            <Link to="/tools" className="pct-back-link">
              ← Back to Tools
            </Link>

            <span className="pct-label">NOORADO CALCULATOR</span>

            <h1>Percentage Calculator</h1>

            <p>
              Quickly calculate percentages, increases and decreases.
            </p>
          </div>
        </section>

        {/* ========================================
            CALCULATOR SECTION
        ======================================== */}
        <section className="pct-section">
          <div className="pct-container">
            <div className="pct-layout">
              {/* ========================================
                  INPUT CARD
              ======================================== */}
              <div className="pct-card" aria-labelledby="pct-card-heading">
                <div className="pct-card-header">
                  <span>PERCENTAGE CALCULATOR</span>
                  <h2 id="pct-card-heading">Calculate percentages</h2>
                </div>

                {/* MODE SELECTOR TABS */}
                <div className="pct-tabs" role="tablist" aria-label="Percentage Calculation Modes">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "percent-of"}
                    className={`pct-tab-btn ${activeMode === "percent-of" ? "active" : ""}`}
                    onClick={() => setActiveMode("percent-of")}
                  >
                    What is X% of Y?
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "what-percent"}
                    className={`pct-tab-btn ${activeMode === "what-percent" ? "active" : ""}`}
                    onClick={() => setActiveMode("what-percent")}
                  >
                    X is what % of Y?
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "increase"}
                    className={`pct-tab-btn ${activeMode === "increase" ? "active" : ""}`}
                    onClick={() => setActiveMode("increase")}
                  >
                    % Increase
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "decrease"}
                    className={`pct-tab-btn ${activeMode === "decrease" ? "active" : ""}`}
                    onClick={() => setActiveMode("decrease")}
                  >
                    % Decrease
                  </button>
                </div>

                {/* TAB 1: WHAT IS X% OF Y? */}
                {activeMode === "percent-of" && (
                  <div className="pct-form-pane" role="tabpanel">
                    <p className="pct-pane-desc">
                      Calculate a specific percentage share of any number or amount.
                    </p>

                    <div className="pct-form-group">
                      <label htmlFor="input-percent-a">Percentage (%)</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-percent-a"
                          type="number"
                          step="any"
                          placeholder="e.g. 20"
                          value={percentA}
                          onChange={(e) => setPercentA(e.target.value)}
                        />
                        <span>%</span>
                      </div>
                    </div>

                    <div className="pct-form-group">
                      <label htmlFor="input-value-a">Number / Total Value</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-value-a"
                          type="number"
                          step="any"
                          placeholder="e.g. 500"
                          value={valueA}
                          onChange={(e) => setValueA(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: X IS WHAT PERCENT OF Y? */}
                {activeMode === "what-percent" && (
                  <div className="pct-form-pane" role="tabpanel">
                    <p className="pct-pane-desc">
                      Find what percentage one number represents out of another.
                    </p>

                    <div className="pct-form-group">
                      <label htmlFor="input-part-b">First Number (Part / X)</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-part-b"
                          type="number"
                          step="any"
                          placeholder="e.g. 100"
                          value={partB}
                          onChange={(e) => setPartB(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pct-form-group">
                      <label htmlFor="input-total-b">Second Number (Total / Y)</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-total-b"
                          type="number"
                          step="any"
                          placeholder="e.g. 500"
                          value={totalB}
                          onChange={(e) => setTotalB(e.target.value)}
                        />
                      </div>
                    </div>

                    {calcB.error && <p className="pct-error-message">{calcB.error}</p>}
                  </div>
                )}

                {/* TAB 3: PERCENTAGE INCREASE */}
                {activeMode === "increase" && (
                  <div className="pct-form-pane" role="tabpanel">
                    <p className="pct-pane-desc">
                      Calculate the growth or increase percentage from an original value to a new value.
                    </p>

                    <div className="pct-form-group">
                      <label htmlFor="input-orig-c">Original Value</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-orig-c"
                          type="number"
                          step="any"
                          placeholder="e.g. 500"
                          value={origC}
                          onChange={(e) => setOrigC(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pct-form-group">
                      <label htmlFor="input-new-c">New Value</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-new-c"
                          type="number"
                          step="any"
                          placeholder="e.g. 600"
                          value={newC}
                          onChange={(e) => setNewC(e.target.value)}
                        />
                      </div>
                    </div>

                    {calcC.error && <p className="pct-error-message">{calcC.error}</p>}
                  </div>
                )}

                {/* TAB 4: PERCENTAGE DECREASE */}
                {activeMode === "decrease" && (
                  <div className="pct-form-pane" role="tabpanel">
                    <p className="pct-pane-desc">
                      Calculate the reduction or decrease percentage from an original value to a new value.
                    </p>

                    <div className="pct-form-group">
                      <label htmlFor="input-orig-d">Original Value</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-orig-d"
                          type="number"
                          step="any"
                          placeholder="e.g. 500"
                          value={origD}
                          onChange={(e) => setOrigD(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pct-form-group">
                      <label htmlFor="input-new-d">New Value</label>
                      <div className="pct-input-wrapper">
                        <input
                          id="input-new-d"
                          type="number"
                          step="any"
                          placeholder="e.g. 400"
                          value={newD}
                          onChange={(e) => setNewD(e.target.value)}
                        />
                      </div>
                    </div>

                    {calcD.error && <p className="pct-error-message">{calcD.error}</p>}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="pct-actions">
                  <button
                    type="button"
                    className="pct-reset-btn"
                    onClick={handleResetCurrent}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="pct-reset-all-btn"
                    onClick={handleResetAll}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* ========================================
                  RESULTS CARD
              ======================================== */}
              <div className="pct-results-column">
                <div className="pct-results" aria-live="polite" aria-label="Calculation Result">
                  {/* RESULT FOR MODE A */}
                  {activeMode === "percent-of" && (
                    <>
                      <div className="pct-primary-result">
                        <span>RESULT</span>
                        <strong>{formatIndianNumber(calcA.result)}</strong>
                        <p>
                          {calcA.isValid
                            ? `${calcA.percentage}% of ${formatIndianNumber(calcA.number!)} is ${formatIndianNumber(calcA.result)}`
                            : "Enter a percentage and number to calculate."}
                        </p>
                      </div>

                      <div className="pct-result-grid">
                        <div>
                          <span>Percentage</span>
                          <strong>{percentA ? `${percentA}%` : "0.00%"}</strong>
                        </div>
                        <div>
                          <span>Original Value</span>
                          <strong>{valueA ? formatIndianNumber(Number(valueA)) : "0.00"}</strong>
                        </div>
                        <div>
                          <span>Calculated Share</span>
                          <strong>{formatIndianNumber(calcA.result)}</strong>
                        </div>
                      </div>

                      <div className="pct-formula-box">
                        <span>FORMULA USED</span>
                        <code>Result = ({percentA || "X"} ÷ 100) × {valueA || "Y"}</code>
                      </div>
                    </>
                  )}

                  {/* RESULT FOR MODE B */}
                  {activeMode === "what-percent" && (
                    <>
                      <div className="pct-primary-result">
                        <span>PERCENTAGE</span>
                        <strong>{formatPercent(calcB.percentage)}</strong>
                        <p>
                          {calcB.isValid
                            ? `${formatIndianNumber(calcB.part!)} is ${formatPercent(calcB.percentage)} of ${formatIndianNumber(calcB.total!)}`
                            : calcB.error || "Enter both numbers to find the percentage."}
                        </p>
                      </div>

                      <div className="pct-result-grid">
                        <div>
                          <span>First Number</span>
                          <strong>{partB ? formatIndianNumber(Number(partB)) : "0.00"}</strong>
                        </div>
                        <div>
                          <span>Total (Base)</span>
                          <strong>{totalB ? formatIndianNumber(Number(totalB)) : "0.00"}</strong>
                        </div>
                        <div>
                          <span>Percentage Share</span>
                          <strong>{formatPercent(calcB.percentage)}</strong>
                        </div>
                      </div>

                      <div className="pct-formula-box">
                        <span>FORMULA USED</span>
                        <code>Percentage = ({partB || "X"} ÷ {totalB || "Y"}) × 100</code>
                      </div>
                    </>
                  )}

                  {/* RESULT FOR MODE C */}
                  {activeMode === "increase" && (
                    <>
                      <div className="pct-primary-result">
                        <span>PERCENTAGE INCREASE</span>
                        <strong>{calcC.isValid ? `+${formatPercent(calcC.percentageIncrease)}` : "0.00%"}</strong>
                        <p>
                          {calcC.isValid
                            ? `Increased by ${formatPercent(calcC.percentageIncrease)} (Difference: +${formatIndianNumber(calcC.difference)})`
                            : calcC.error || "Enter original and new values to calculate increase."}
                        </p>
                      </div>

                      <div className="pct-result-grid">
                        <div>
                          <span>Original Value</span>
                          <strong>{origC ? formatIndianNumber(Number(origC)) : "0.00"}</strong>
                        </div>
                        <div>
                          <span>New Value</span>
                          <strong>{newC ? formatIndianNumber(Number(newC)) : "0.00"}</strong>
                        </div>
                        <div>
                          <span>Difference</span>
                          <strong>{formatIndianNumber(calcC.difference)}</strong>
                        </div>
                      </div>

                      <div className="pct-formula-box">
                        <span>FORMULA USED</span>
                        <code>Increase % = (({newC || "New"} - {origC || "Original"}) ÷ {origC || "Original"}) × 100</code>
                      </div>
                    </>
                  )}

                  {/* RESULT FOR MODE D */}
                  {activeMode === "decrease" && (
                    <>
                      <div className="pct-primary-result">
                        <span>PERCENTAGE DECREASE</span>
                        <strong>{calcD.isValid ? `-${formatPercent(calcD.percentageDecrease)}` : "0.00%"}</strong>
                        <p>
                          {calcD.isValid
                            ? `Decreased by ${formatPercent(calcD.percentageDecrease)} (Difference: -${formatIndianNumber(calcD.difference)})`
                            : calcD.error || "Enter original and new values to calculate decrease."}
                        </p>
                      </div>

                      <div className="pct-result-grid">
                        <div>
                          <span>Original Value</span>
                          <strong>{origD ? formatIndianNumber(Number(origD)) : "0.00"}</strong>
                        </div>
                        <div>
                          <span>New Value</span>
                          <strong>{newD ? formatIndianNumber(Number(newD)) : "0.00"}</strong>
                        </div>
                        <div>
                          <span>Difference</span>
                          <strong>{formatIndianNumber(calcD.difference)}</strong>
                        </div>
                      </div>

                      <div className="pct-formula-box">
                        <span>FORMULA USED</span>
                        <code>Decrease % = (({origD || "Original"} - {newD || "New"}) ÷ {origD || "Original"}) × 100</code>
                      </div>
                    </>
                  )}
                </div>

                {/* QUICK EXPLANATION CARD */}
                <div className="pct-summary-card">
                  <h3>Quick Examples</h3>
                  <ul>
                    <li>
                      <strong>20% of ₹500:</strong> (20 ÷ 100) × 500 = <strong>₹100.00</strong>
                    </li>
                    <li>
                      <strong>100 is what % of 500:</strong> (100 ÷ 500) × 100 = <strong>20.00%</strong>
                    </li>
                    <li>
                      <strong>₹500 to ₹600 Increase:</strong> ((600 - 500) ÷ 500) × 100 = <strong>+20.00%</strong>
                    </li>
                    <li>
                      <strong>₹500 to ₹400 Decrease:</strong> ((500 - 400) ÷ 500) × 100 = <strong>-20.00%</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ========================================
                EDUCATIONAL / INFO SECTION
            ======================================== */}
            <div className="pct-info">
              <span>LEARN MORE</span>

              <h2>What is a Percentage?</h2>
              <p>
                A percentage is a number or ratio expressed as a fraction of 100.
                It is denoted using the percent sign (<strong>%</strong>). Percentages
                are widely used to calculate discounts, profit margins, sales tax, GST,
                loan interest, investment returns, and everyday metrics.
              </p>

              <h2>How to Calculate Percentages?</h2>
              <p>
                The fundamental percentage formula is:
              </p>
              <div className="pct-formula">
                Percentage = (Part ÷ Whole) × 100
              </div>

              <h2>Percentage Increase and Decrease</h2>
              <p>
                To measure how much a value has grown or dropped relative to its initial state:
              </p>
              <div className="pct-formula">
                Percentage Change = ((New Value - Original Value) ÷ |Original Value|) × 100
              </div>
              <p>
                A positive percentage change represents a <strong>percentage increase</strong>,
                while a negative percentage change represents a <strong>percentage decrease</strong>.
              </p>
            </div>

            {/* ========================================
                TOOL RECOMMENDATION
            ======================================== */}
            <div className="pct-recommendation-wrap">
              <ToolRecommendation
                title="Need to calculate GST or discounts?"
                description="Use our free GST Calculator to compute tax, discounts, and final payable amounts accurately."
                buttonText="Open GST Calculator →"
                path="/tools/gst-discount-calculator"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default PercentageCalculatorPage;

