import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import "../../styles/portfoliopage/ExcelAutomationPage.css";

function ExcelAutomationPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="project-page excel-automation-page">

        {/* Project Hero */}
        <section className="project-hero">
          <div className="project-back-wrapper">
            <button
              className="back-button"
              onClick={() => navigate("/portfolio")}
            >
              ← Back to Portfolio
            </button>
          </div>

          <div className="project-container">
            <div className="project-hero-content">
              <span className="project-category">
                Excel Automation
              </span>

              <h1>Smart Excel Automation</h1>

              <p>
                Powerful Excel solutions designed to reduce manual work,
                organize business data, and make everyday operations faster.
              </p>
            </div>

          </div>
        </section>


        {/* Project Overview */}
        <section className="project-overview">
          <div className="project-container project-overview-grid">

            <div>
              <span className="project-label">
                PROJECT OVERVIEW
              </span>

              <h2>
                Turning complex Excel work into simple business systems.
              </h2>
            </div>

            <div>

              <p>
                This project focuses on creating smart Excel templates
                that help businesses manage data more efficiently.
              </p>

              <p>
                Automated calculations, structured data, dashboards,
                formulas, and organized workflows reduce repetitive
                manual work and improve accuracy.
              </p>

            </div>

          </div>
        </section>


        {/* Challenge + Solution */}
        <section className="project-challenge">
          <div className="project-container challenge-grid">

            <div className="challenge-card">

              <span className="project-label">
                THE CHALLENGE
              </span>

              <h2>
                Too much manual work and complicated spreadsheets.
              </h2>

              <p>
                Businesses often depend on spreadsheets for daily
                operations, but manually entering and calculating
                information can consume valuable time.
              </p>

              <p>
                Large spreadsheets can also become difficult to manage,
                filter, update, and understand.
              </p>

            </div>


            <div className="solution-card">

              <span className="project-label">
                OUR SOLUTION
              </span>

              <h2>
                Automated Excel systems built for easier business operations.
              </h2>

              <p>
                We create structured Excel solutions using formulas,
                automation, dashboards, and organized data systems.
              </p>

              <p>
                The result is a cleaner workflow that reduces repetitive
                work and makes important business information easier to
                understand.
              </p>

            </div>

          </div>
        </section>


        {/* Key Features */}
        <section className="project-features">

          <div className="project-container">

            <div className="features-heading">

              <span className="project-label">
                KEY FEATURES
              </span>

              <h2>
                Built to make Excel work smarter.
              </h2>

            </div>


            <div className="features-grid">

              <div className="feature-card">
                <h3>Automated Calculations</h3>

                <p>
                  Reduce repetitive calculations with intelligent
                  formulas and automated workflows.
                </p>
              </div>


              <div className="feature-card">
                <h3>Smart Dashboards</h3>

                <p>
                  Turn raw business data into clear and useful
                  dashboards for faster decision-making.
                </p>
              </div>


              <div className="feature-card">
                <h3>Data Management</h3>

                <p>
                  Organize large amounts of information with
                  structured tables, filters, and easy tracking.
                </p>
              </div>


              <div className="feature-card">
                <h3>Business Templates</h3>

                <p>
                  Ready-to-use Excel templates designed around
                  practical business requirements.
                </p>
              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default ExcelAutomationPage;
