import { Link } from "react-router-dom";
import "./ServicesPage.css";

function Services() {
  return (
    <main className="services-page">

      {/* ========================================
          TOP BACK NAVIGATION
      ======================================== */}
      <div className="services-top-nav">
        <div className="services-container">
          <Link to="/" className="services-back-button">
            ← Back to Home
          </Link>
        </div>
      </div>


      {/* ========================================
          HERO
      ======================================== */}
      <section className="services-hero">
        <div className="services-container">
          <span className="services-label">
            WHAT WE DO
          </span>

          <h1>
            Digital solutions
            <br />
            built for real business.
          </h1>

          <p>
            Noorado creates practical websites, software,
            business tools, and digital solutions that make
            everyday work simpler, faster, and more efficient.
          </p>
        </div>
      </section>


      {/* ========================================
          SERVICES
      ======================================== */}
      <section className="services-section">
        <div className="services-container">

          <div className="services-heading">
            <span className="services-section-label">
              OUR SERVICES
            </span>

            <h2>
              Simple solutions.
              <br />
              Useful results.
            </h2>

            <p>
              We build practical digital solutions around
              real business needs, with a focus on simplicity,
              usability, and efficiency.
            </p>
          </div>


          <div className="services-grid">

            <article
              id="business-websites"
              className="service-card"
            >
              <span className="service-number">01</span>

              <h3>
                Business Websites
              </h3>

              <p>
                Professional websites designed for businesses that
                want a strong online presence, clear information,
                and a modern customer experience.
              </p>
            </article>


            <article
              id="business-software"
              className="service-card"
            >
              <span className="service-number">02</span>

              <h3>
                Business Software
              </h3>

              <p>
                Practical software solutions that help businesses
                manage operations, reduce repetitive work, and
                improve day-to-day efficiency.
              </p>
            </article>


            <article
              id="app-builder"
              className="service-card"
            >
              <span className="service-number">03</span>

              <h3>
                App Builder
              </h3>

              <p>
                A flexible platform for creating connected
                business applications tailored to specific
                workflows, teams, and business requirements.
              </p>
            </article>


            <article
              id="custom-digital-solutions"
              className="service-card"
            >
              <span className="service-number">04</span>

              <h3>
                Custom Digital Solutions
              </h3>

              <p>
                Custom-built digital solutions designed around
                unique business needs, workflows, and operational
                challenges.
              </p>
            </article>

          </div>
        </div>
      </section>


      {/* ========================================
          CTA
      ======================================== */}
      <section className="services-cta">
        <div className="services-container">

          <span className="services-cta-label">
            HAVE AN IDEA?
          </span>

          <h2>
            Let's build something
            <br />
            useful together.
          </h2>

          <p>
            Tell us what you need and let's turn your idea
            into a practical digital solution.
          </p>

          <Link
            to="/contact"
            className="services-cta-button"
          >
            Talk to Noorado →
          </Link>

        </div>
      </section>

    </main>
  );
}

export default Services;