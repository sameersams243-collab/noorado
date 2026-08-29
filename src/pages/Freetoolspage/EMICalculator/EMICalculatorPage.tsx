import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import "./EMICalculatorPage.css";

type Payment = {
  month: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  closingBalance: number;
};

type YearSummary = {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  closingBalance: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatIndianNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const parseIndianNumber = (value: string) => {
  const normalized = value.replace(/[^\d.]/g, "");

  if (!normalized) return 0;

  const parts = normalized.split(".");
  const whole = parts[0] || "0";
  const fraction = parts.slice(1).join("").slice(0, 2);

  const numericValue = Number(
    fraction ? `${whole}.${fraction}` : whole
  );

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const isPositiveFinite = (value: number) =>
  Number.isFinite(value) && value > 0;

function EMICalculatorPage() {
  /*
   * INPUT STATE
   *
   * Strings are intentionally used here.
   * This allows the user to completely delete
   * 0 from the input field.
   */
  const [loanInput, setLoanInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [tenureInput, setTenureInput] = useState("");

  const [isLoanInputFocused, setIsLoanInputFocused] =
    useState(false);

  const [isScheduleOpen, setIsScheduleOpen] =
    useState(false);

  /*
   * Convert input strings to numbers only when needed.
   */
  const loanAmount = parseIndianNumber(loanInput);

  const interestRate =
    interestInput === ""
      ? 0
      : Number(interestInput);

  const loanTenure =
    tenureInput === ""
      ? 0
      : Number(tenureInput);

  /*
   * VALIDATION
   */
  const hasAnyInput =
    loanInput !== "" ||
    interestInput !== "" ||
    tenureInput !== "";

  const validationMessage =
    !hasAnyInput
      ? ""
      : !isPositiveFinite(loanAmount)
        ? "Enter a valid positive loan amount."
        : !Number.isFinite(interestRate) ||
            interestRate < 0
          ? "Interest rate must be 0% or greater."
          : !Number.isFinite(loanTenure) ||
              loanTenure < 1 ||
              !Number.isInteger(loanTenure)
            ? "Years to pay must be a positive whole number."
            : "";

  const isValid =
    isPositiveFinite(loanAmount) &&
    Number.isFinite(interestRate) &&
    interestRate >= 0 &&
    Number.isFinite(loanTenure) &&
    loanTenure >= 1 &&
    Number.isInteger(loanTenure);

  /*
   * SLIDER LIMITS
   */
  const amountSliderMax = Math.max(
    10000000,
    loanAmount,
    1
  );

  const rateSliderMax = Math.max(
    30,
    interestRate,
    1
  );

  const tenureSliderMax = Math.max(
    30,
    loanTenure,
    1
  );

  /*
   * EMI CALCULATION
   */
  const calculation = useMemo(() => {
    if (!isValid) return null;

    const months = loanTenure * 12;

    const monthlyRate =
      interestRate / 12 / 100;

    let emi = 0;

    if (monthlyRate === 0) {
      emi = loanAmount / months;
    } else {
      const factor =
        (1 + monthlyRate) ** months;

      emi =
        (loanAmount *
          monthlyRate *
          factor) /
        (factor - 1);
    }

    const totalPayment = emi * months;

    const totalInterest =
      totalPayment - loanAmount;

    return {
      months,
      emi,
      totalPayment,
      totalInterest,
    };
  }, [
    isValid,
    interestRate,
    loanAmount,
    loanTenure,
  ]);

  /*
   * MONTHLY SCHEDULE
   */
  const schedule = useMemo<Payment[]>(() => {
    if (!calculation) return [];

    const monthlyRate =
      interestRate / 12 / 100;

    let balance = loanAmount;

    return Array.from(
      { length: calculation.months },
      (_, index) => {
        const openingBalance = balance;

        const interest =
          openingBalance * monthlyRate;

        const principal =
          index === calculation.months - 1
            ? openingBalance
            : Math.min(
                calculation.emi - interest,
                openingBalance
              );

        const emi =
          principal + interest;

        balance = Math.max(
          0,
          openingBalance - principal
        );

        return {
          month: index + 1,
          openingBalance,
          emi,
          principal,
          interest,
          closingBalance: balance,
        };
      }
    );
  }, [
    calculation,
    interestRate,
    loanAmount,
  ]);

  /*
   * YEARLY SUMMARY
   */
  const yearlySummary =
    useMemo<YearSummary[]>(() => {
      const summaries: YearSummary[] = [];

      for (
        let start = 0;
        start < schedule.length;
        start += 12
      ) {
        const payments =
          schedule.slice(start, start + 12);

        if (!payments.length) continue;

        summaries.push({
          year: summaries.length + 1,

          openingBalance:
            payments[0].openingBalance,

          principalPaid:
            payments.reduce(
              (total, payment) =>
                total + payment.principal,
              0
            ),

          interestPaid:
            payments.reduce(
              (total, payment) =>
                total + payment.interest,
              0
            ),

          totalPayment:
            payments.reduce(
              (total, payment) =>
                total + payment.emi,
              0
            ),

          closingBalance:
            payments[
              payments.length - 1
            ].closingBalance,
        });
      }

      return summaries;
    }, [schedule]);

  /*
   * BREAKDOWN
   */
  const principalPercent =
    calculation &&
    calculation.totalPayment > 0
      ? (loanAmount /
          calculation.totalPayment) *
        100
      : 0;

  const interestPercent =
    calculation &&
    calculation.totalPayment > 0
      ? (calculation.totalInterest /
          calculation.totalPayment) *
        100
      : 0;

  /*
   * RESET
   *
   * Everything becomes visually empty.
   * Results therefore become ₹0.00.
   */
  const reset = () => {
    setLoanInput("");
    setInterestInput("");
    setTenureInput("");

    setIsLoanInputFocused(false);
    setIsScheduleOpen(false);
  };

  /*
   * LOAN AMOUNT
   */
  const handleLoanAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue =
      event.target.value.replace(
        /[^\d.]/g,
        ""
      );

    const parts = rawValue.split(".");

    const cleanValue =
      parts.length > 1
        ? `${parts[0]}.${parts
            .slice(1)
            .join("")
            .slice(0, 2)}`
        : rawValue;

    setLoanInput(cleanValue);
  };

  const handleLoanFocus = () => {
    setLoanInput(
      loanAmount > 0
        ? String(loanAmount)
        : ""
    );

    setIsLoanInputFocused(true);
  };

  const handleLoanBlur = () => {
    setIsLoanInputFocused(false);
  };

  return (
    <>
      <Navbar />

      <main className="emi-page">

        <section className="emi-hero">
          <div className="emi-container">

            <Link
              to="/tools"
              className="emi-back-link"
            >
              Back to Tools
            </Link>

            <span className="emi-label">
              NOORADO CALCULATOR
            </span>

            <h1>EMI Calculator</h1>

            <p>
              Calculate your monthly loan EMI,
              interest and total payment.
            </p>

          </div>
        </section>

        <section className="emi-section">
          <div className="emi-container">

            <div className="emi-layout">

              {/* LOAN DETAILS */}

              <section
                className="emi-input-card"
                aria-labelledby="emi-input-heading"
              >

                <div className="emi-card-heading">

                  <span>LOAN DETAILS</span>

                  <h2 id="emi-input-heading">
                    Plan your repayment
                  </h2>

                </div>

                {/* LOAN AMOUNT */}

                <div className="emi-field">

                  <label htmlFor="loan-amount">
                    Loan Amount
                  </label>

                  <div className="emi-number-input">

                    <span>₹</span>

                    <input
                      id="loan-amount"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      value={
                        isLoanInputFocused
                          ? loanInput
                          : loanAmount > 0
                            ? formatIndianNumber(
                                loanAmount
                              )
                            : ""
                      }
                      onFocus={handleLoanFocus}
                      onBlur={handleLoanBlur}
                      onChange={
                        handleLoanAmountChange
                      }
                    />

                  </div>

                  <input
                    className="emi-slider"
                    aria-label="Loan amount"
                    type="range"
                    min="1"
                    max={amountSliderMax}
                    step="1"
                    value={
                      loanAmount > 0
                        ? Math.min(
                            loanAmount,
                            amountSliderMax
                          )
                        : 1
                    }
                    onChange={(event) => {
                      const value =
                        Number(
                          event.target.value
                        );

                      setLoanInput(
                        String(value)
                      );
                    }}
                  />

                  <div className="emi-range-labels">
                    <span>₹1.00</span>
                    <span>
                      {formatCurrency(
                        amountSliderMax
                      )}
                    </span>
                  </div>

                </div>

                {/* INTEREST RATE */}

                <div className="emi-field">

                  <label htmlFor="interest-rate">
                    Annual Interest Rate
                  </label>

                  <div className="emi-number-input">

                    <input
                      id="interest-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={interestInput}
                      onChange={(event) =>
                        setInterestInput(
                          event.target.value
                        )
                      }
                    />

                    <span>%</span>

                  </div>

                  <input
                    className="emi-slider"
                    aria-label="Annual interest rate"
                    type="range"
                    min="0"
                    max={rateSliderMax}
                    step="0.01"
                    value={
                      interestRate >= 0
                        ? interestRate
                        : 0
                    }
                    onChange={(event) =>
                      setInterestInput(
                        event.target.value
                      )
                    }
                  />

                  <div className="emi-range-labels">
                    <span>0%</span>
                    <span>
                      {rateSliderMax}%
                    </span>
                  </div>

                </div>

                {/* YEARS */}

                <div className="emi-field">

                  <label htmlFor="loan-tenure">
                    Years to Pay
                  </label>

                  <div className="emi-number-input">

                    <input
                      id="loan-tenure"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      value={tenureInput}
                      onChange={(event) =>
                        setTenureInput(
                          event.target.value
                        )
                      }
                    />

                    <span>years</span>

                  </div>

                  <input
                    className="emi-slider"
                    aria-label="Years to pay"
                    type="range"
                    min="1"
                    max={tenureSliderMax}
                    step="1"
                    value={
                      loanTenure >= 1
                        ? loanTenure
                        : 1
                    }
                    onChange={(event) =>
                      setTenureInput(
                        event.target.value
                      )
                    }
                  />

                  <div className="emi-range-labels">
                    <span>1 year</span>
                    <span>
                      {tenureSliderMax} years
                    </span>
                  </div>

                </div>

                {validationMessage && (
                  <p
                    className="emi-error"
                    role="alert"
                  >
                    {validationMessage}
                  </p>
                )}

                <button
                  type="button"
                  className="emi-reset"
                  onClick={reset}
                >
                  Reset
                </button>

              </section>

              {/* RESULTS */}

              <section
                className="emi-results"
                aria-live="polite"
                aria-label="EMI results"
              >

                <div className="emi-primary-result">

                  <span>
                    MONTHLY PAYMENT
                  </span>

                  <strong>
                    {formatCurrency(
                      calculation?.emi ?? 0
                    )}
                  </strong>

                  <p>
                    {calculation
                      ? `for ${calculation.months} monthly payments`
                      : "Enter valid loan details to calculate your EMI."}
                  </p>

                </div>

                <div className="emi-result-grid">

                  <div>
                    <span>Total Interest</span>
                    <strong>
                      {formatCurrency(
                        calculation?.totalInterest ?? 0
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Total Payment</span>
                    <strong>
                      {formatCurrency(
                        calculation?.totalPayment ?? 0
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Principal Amount</span>
                    <strong>
                      {formatCurrency(
                        isValid
                          ? loanAmount
                          : 0
                      )}
                    </strong>
                  </div>

                </div>

                <div
                  className="emi-breakdown"
                  aria-label="Principal and interest breakdown"
                >

                  <div
                    className="emi-donut"
                    style={{
                      background:
                        `conic-gradient(#ffffff 0 ${principalPercent}%, #7b7b7b ${principalPercent}% 100%)`,
                    }}
                  >
                    <div>
                      <strong>
                        {Math.round(
                          principalPercent
                        )}%
                      </strong>

                      <span>Principal</span>
                    </div>
                  </div>

                  <div className="emi-breakdown-items">

                    <div>
                      <span className="emi-key emi-principal-key" />

                      <p>
                        Principal

                        <strong>
                          {formatCurrency(
                            isValid
                              ? loanAmount
                              : 0
                          )}
                        </strong>

                        <small>
                          {principalPercent.toFixed(1)}%
                        </small>
                      </p>
                    </div>

                    <div>
                      <span className="emi-key emi-interest-key" />

                      <p>
                        Interest

                        <strong>
                          {formatCurrency(
                            calculation?.totalInterest ?? 0
                          )}
                        </strong>

                        <small>
                          {interestPercent.toFixed(1)}%
                        </small>
                      </p>
                    </div>

                  </div>

                </div>

              </section>

            </div>

            {/* AMORTIZATION */}

            <section className="emi-schedule-section">

              <button
                type="button"
                className="emi-schedule-toggle"
                onClick={() =>
                  setIsScheduleOpen(
                    (open) => !open
                  )
                }
                aria-expanded={
                  isScheduleOpen
                }
              >
                {isScheduleOpen
                  ? "Hide Amortization Schedule"
                  : "View Amortization Schedule"}

                <span>
                  {isScheduleOpen
                    ? "−"
                    : "+"}
                </span>
              </button>

              {isScheduleOpen && (
                <div
                  id="amortization-schedule"
                  className="emi-schedule-content"
                >

                  <h2>Yearly Summary</h2>

                  <div className="emi-table-wrap">

                    <table>

                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Opening Balance</th>
                          <th>Principal Paid</th>
                          <th>Interest Paid</th>
                          <th>Total Payment</th>
                          <th>Closing Balance</th>
                        </tr>
                      </thead>

                      <tbody>
                        {yearlySummary.map(
                          (year) => (
                            <tr key={year.year}>
                              <td>{year.year}</td>
                              <td>{formatCurrency(year.openingBalance)}</td>
                              <td>{formatCurrency(year.principalPaid)}</td>
                              <td>{formatCurrency(year.interestPaid)}</td>
                              <td>{formatCurrency(year.totalPayment)}</td>
                              <td>{formatCurrency(year.closingBalance)}</td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>

                  </div>

                  <h2>
                    Monthly Repayment Schedule
                  </h2>

                  <div className="emi-table-wrap emi-monthly-table">

                    <table>

                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Opening Balance</th>
                          <th>EMI</th>
                          <th>Principal</th>
                          <th>Interest</th>
                          <th>Closing Balance</th>
                        </tr>
                      </thead>

                      <tbody>
                        {schedule.map(
                          (payment) => (
                            <tr
                              key={payment.month}
                            >
                              <td>{payment.month}</td>
                              <td>{formatCurrency(payment.openingBalance)}</td>
                              <td>{formatCurrency(payment.emi)}</td>
                              <td>{formatCurrency(payment.principal)}</td>
                              <td>{formatCurrency(payment.interest)}</td>
                              <td>{formatCurrency(payment.closingBalance)}</td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>

                  </div>

                </div>
              )}

            </section>

            {/* INFORMATION */}

            <article className="emi-info">

              <span>ABOUT THIS TOOL</span>

              <h2>What is EMI?</h2>

              <p>
                EMI, or Equated Monthly
                Instalment, is the fixed
                periodic payment made
                towards repaying a loan.
                Each payment includes both
                principal and interest.
              </p>

              <h2>
                How is EMI calculated?
              </h2>

              <p className="emi-formula">
                EMI = P × r × (1 + r)
                <sup>n</sup> / ((1 + r)
                <sup>n</sup> − 1)
              </p>

              <p>
                Here, P is the loan amount,
                r is the monthly interest
                rate, and n is the total
                number of monthly instalments.
              </p>

            </article>

          </div>
        </section>
      </main>
    </>
  );
}

export default EMICalculatorPage;