import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import "../../styles/portfoliopage/BusinessToolsPage.css";

function BusinessToolsPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="project-page business-tools-page">

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
                Business Tools
              </span>

              <h1>Business Tools</h1>

              <p>
                Practical digital tools designed to simplify everyday
                business tasks and help teams work faster and smarter.
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
                Simple digital tools for everyday business operations.
              </h2>
            </div>

            <div>

              <p>
                This project focuses on creating practical online tools
                that solve common business problems.
              </p>

              <p>
                Each tool is designed to be simple, accessible, and
                easy to use without unnecessary complexity.
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
                Small business tasks can consume valuable time.
              </h2>

              <p>
                Businesses regularly handle repetitive calculations,
                data checks, conversions, and other small operational
                tasks.
              </p>

              <p>
                Managing these tasks manually can make daily work
                slower and less efficient.
              </p>

            </div>


            <div className="solution-card">

              <span className="project-label">
                OUR SOLUTION
              </span>

              <h2>
                Useful tools that make everyday work easier.
              </h2>

              <p>
                We create focused digital tools that automate or
                simplify specific business tasks.
              </p>

              <p>
                The result is a collection of practical solutions that
                help businesses save time and complete routine work
                more efficiently.
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
                Practical tools built around real business needs.
              </h2>

            </div>


            <div className="features-grid">

              <div className="feature-card">
                <h3>Easy to Use</h3>

                <p>
                  Simple interfaces designed so users can complete
                  tasks without unnecessary steps.
                </p>
              </div>


              <div className="feature-card">
                <h3>Time Saving</h3>

                <p>
                  Reduce repetitive manual work and complete common
                  business tasks faster.
                </p>
              </div>


              <div className="feature-card">
                <h3>Practical Solutions</h3>

                <p>
                  Tools are designed around real operational problems
                  faced by businesses every day.
                </p>
              </div>


              <div className="feature-card">
                <h3>Accessible Anywhere</h3>

                <p>
                  Web-based tools that can be accessed whenever they
                  are needed.
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

export default BusinessToolsPage;
