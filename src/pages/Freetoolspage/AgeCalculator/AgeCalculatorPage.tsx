import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import ToolRecommendation from "../../ToolsRecommendation/ToolRecommendation";
import "./AgeCalculatorPage.css";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatDateDisplay = (date: Date): string => {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

function AgeCalculatorPage() {
  const [dob, setDob] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get dynamic today's date in local time
  const today = useMemo(() => new Date(), []);
  const todayFormatted = useMemo(() => {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [today]);

  // Exact calendar age calculation
  const ageResult = useMemo(() => {
    if (!dob) {
      return {
        years: 0,
        months: 0,
        days: 0,
        totalMonths: 0,
        totalWeeks: 0,
        totalDays: 0,
        totalHours: 0,
        nextBirthdayDays: 0,
        dobFormatted: "-",
        currentDateFormatted: formatDateDisplay(today),
        isValid: false,
      };
    }

    const [y, m, d] = dob.split("-").map(Number);
    if (!y || !m || !d) {
      return {
        years: 0,
        months: 0,
        days: 0,
        totalMonths: 0,
        totalWeeks: 0,
        totalDays: 0,
        totalHours: 0,
        nextBirthdayDays: 0,
        dobFormatted: "-",
        currentDateFormatted: formatDateDisplay(today),
        isValid: false,
      };
    }

    const birthDate = new Date(y, m - 1, d);
    const currentDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (birthDate > currentDate) {
      return {
        years: 0,
        months: 0,
        days: 0,
        totalMonths: 0,
        totalWeeks: 0,
        totalDays: 0,
        totalHours: 0,
        nextBirthdayDays: 0,
        dobFormatted: formatDateDisplay(birthDate),
        currentDateFormatted: formatDateDisplay(currentDate),
        isValid: false,
      };
    }

    // Exact calendar calculations
    let years = currentDate.getFullYear() - birthDate.getFullYear();
    let months = currentDate.getMonth() - birthDate.getMonth();
    let days = currentDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      // Get the number of days in the previous month of currentDate
      const prevMonthLastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      ).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total elapsed calendar days
    const diffMs = currentDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    // Next birthday countdown
    let nextBdayYear = currentDate.getFullYear();
    let nextBday = new Date(nextBdayYear, m - 1, d);
    if (nextBday < currentDate) {
      nextBdayYear += 1;
      nextBday = new Date(nextBdayYear, m - 1, d);
    }
    const nextBdayDiff = nextBday.getTime() - currentDate.getTime();
    const nextBirthdayDays = Math.ceil(nextBdayDiff / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      nextBirthdayDays,
      dobFormatted: formatDateDisplay(birthDate),
      currentDateFormatted: formatDateDisplay(currentDate),
      isValid: true,
    };
  }, [dob, today]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDob(value);
    setErrorMessage("");

    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      const chosen = new Date(y, m - 1, d);
      const current = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      if (chosen > current) {
        setErrorMessage("Date of birth cannot be in the future.");
        setHasCalculated(false);
        return;
      }
      setHasCalculated(true);
    } else {
      setHasCalculated(false);
    }
  };

  const handleCalculate = () => {
    if (!dob) {
      setErrorMessage("Please select your date of birth.");
      setHasCalculated(false);
      return;
    }

    const [y, m, d] = dob.split("-").map(Number);
    const chosen = new Date(y, m - 1, d);
    const current = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (chosen > current) {
      setErrorMessage("Date of birth cannot be in the future.");
      setHasCalculated(false);
      return;
    }

    setErrorMessage("");
    setHasCalculated(true);
  };

  const handleReset = () => {
    setDob("");
    setHasCalculated(false);
    setErrorMessage("");
  };

  const isDisplayingResults = hasCalculated && ageResult.isValid && !errorMessage;

  return (
    <>
      <Navbar />

      <main className="age-page">
        {/* ========================================
            HERO SECTION
        ======================================== */}
        <section className="age-hero">
          <div className="age-container">
            <Link to="/tools" className="age-back-link">
              ← Back to Tools
            </Link>

            <span className="age-label">NOORADO CALCULATOR</span>

            <h1>Age Calculator</h1>

            <p>
              Calculate your exact age from your date of birth.
            </p>
          </div>
        </section>

        {/* ========================================
            CALCULATOR SECTION
        ======================================== */}
        <section className="age-section">
          <div className="age-container">
            <div className="age-layout">
              {/* ========================================
                  INPUT CARD
              ======================================== */}
              <div className="age-card" aria-labelledby="age-card-heading">
                <div className="age-card-header">
                  <span>EVERYDAY</span>
                  <h2 id="age-card-heading">Plan your age details</h2>
                </div>

                <div className="age-form-group">
                  <label htmlFor="dob-input">Date of Birth</label>
                  <div className="age-input-wrapper">
                    <input
                      id="dob-input"
                      type="date"
                      max={todayFormatted}
                      value={dob}
                      onChange={handleDateChange}
                      aria-describedby={errorMessage ? "age-error-msg" : undefined}
                    />
                  </div>
                  <small className="age-helper-text">
                    Select the day, month, and year you were born.
                  </small>
                </div>

                {errorMessage && (
                  <p id="age-error-msg" className="age-error-message" role="alert">
                    {errorMessage}
                  </p>
                )}

                <div className="age-actions">
                  <button
                    type="button"
                    className="age-calculate-btn"
                    onClick={handleCalculate}
                  >
                    Calculate Age
                  </button>

                  <button
                    type="button"
                    className="age-reset-btn"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* ========================================
                  RESULTS CARD
              ======================================== */}
              <div className="age-results-column">
                <div
                  className="age-results"
                  aria-live="polite"
                  aria-label="Age Calculation Result"
                >
                  <div className="age-primary-result">
                    <span>YOUR AGE</span>
                    <div className="age-units-display">
                      <div className="age-unit-block">
                        <strong>{isDisplayingResults ? ageResult.years : 0}</strong>
                        <small>Years</small>
                      </div>
                      <div className="age-unit-block">
                        <strong>{isDisplayingResults ? ageResult.months : 0}</strong>
                        <small>Months</small>
                      </div>
                      <div className="age-unit-block">
                        <strong>{isDisplayingResults ? ageResult.days : 0}</strong>
                        <small>Days</small>
                      </div>
                    </div>
                    <p>
                      {isDisplayingResults
                        ? `${ageResult.years} Years, ${ageResult.months} Months, and ${ageResult.days} Days`
                        : "Enter your date of birth to calculate your exact age."}
                    </p>
                  </div>

                  <div className="age-result-grid">
                    <div>
                      <span>Date of Birth</span>
                      <strong>{isDisplayingResults ? ageResult.dobFormatted : "-"}</strong>
                    </div>
                    <div>
                      <span>Current Date</span>
                      <strong>{ageResult.currentDateFormatted}</strong>
                    </div>
                    <div>
                      <span>Total Months</span>
                      <strong>
                        {isDisplayingResults
                          ? new Intl.NumberFormat("en-IN").format(ageResult.totalMonths)
                          : "0"}
                      </strong>
                    </div>
                    <div>
                      <span>Total Weeks</span>
                      <strong>
                        {isDisplayingResults
                          ? `${new Intl.NumberFormat("en-IN").format(ageResult.totalWeeks)} weeks`
                          : "0 weeks"}
                      </strong>
                    </div>
                    <div>
                      <span>Total Days</span>
                      <strong>
                        {isDisplayingResults
                          ? new Intl.NumberFormat("en-IN").format(ageResult.totalDays)
                          : "0"}
                      </strong>
                    </div>
                    <div>
                      <span>Next Birthday In</span>
                      <strong>
                        {isDisplayingResults
                          ? `${ageResult.nextBirthdayDays} ${ageResult.nextBirthdayDays === 1 ? "day" : "days"}`
                          : "-"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* SUMMARY HIGHLIGHTS */}
                <div className="age-summary-card">
                  <h3>Age Summary Highlights</h3>
                  <ul>
                    <li>
                      <strong>Exact Calendar Age:</strong> Accurately accounts for leap years, 28/29/30/31-day months, and calendar transitions.
                    </li>
                    <li>
                      <strong>Total Days:</strong> Actual elapsed days elapsed from your birth date to today.
                    </li>
                    <li>
                      <strong>Completed Weeks:</strong> Total number of full 7-day weeks completed.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ========================================
                ABOUT THIS TOOL SECTION
            ======================================== */}
            <div className="age-info">
              <span>ABOUT THIS TOOL</span>

              <h2>What is an Age Calculator?</h2>
              <p>
                An age calculator determines a person's exact chronological age from their date
                of birth and the current date. It breaks down the duration into exact years,
                months, days, total elapsed weeks, and total days.
              </p>

              <h2>How is age calculated?</h2>
              <p>
                The calculator compares the birth date with today's dynamic calendar date and
                calculates the exact calendar difference in years, months, and days. It accounts
                for varying month lengths (including February 28/29 in leap years) rather than
                simplifying the year to an approximate 365-day division.
              </p>
            </div>

            {/* ========================================
                TOOL RECOMMENDATION
            ======================================== */}
            <div className="age-recommendation-wrap">
              <ToolRecommendation
                title="Need to calculate percentages or discounts?"
                description="Use our free Percentage Calculator to calculate percentage values, increases, and decreases."
                buttonText="Open Percentage Calculator →"
                path="/tools/percentage-calculator"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default AgeCalculatorPage;

