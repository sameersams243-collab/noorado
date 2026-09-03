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
            Software and technology
            <br />
            built for real business.
          </h1>

          <p>
            Noorado is a software company building practical websites,
            business software, SaaS products, and online tools that help
            businesses simplify operations and work more efficiently.
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
              WHAT WE BUILD
            </span>

            <h2>
              Practical software.
              <br />
              Useful results.
            </h2>

            <p>
              We build software and digital products around real business
              needs, with a focus on simplicity, usability, reliability,
              and efficiency.
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
                Professional websites designed for businesses that want
                a strong online presence, clear information, and a modern
                customer experience.
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
                Practical software solutions that help businesses manage
                operations, automate repetitive work, and improve
                day-to-day efficiency.
              </p>
            </article>


            <article
              id="saas-products"
              className="service-card"
            >
              <span className="service-number">03</span>

              <h3>
                SaaS Products
              </h3>

              <p>
                Scalable software products designed to simplify business
                workflows and provide useful technology through modern
                online platforms.
              </p>
            </article>


            <article
              id="business-apps"
              className="service-card"
            >
              <span className="service-number">04</span>

              <h3>
                Business App Development
              </h3>

              <p>
                Connected business applications built around specific
                workflows, teams, and operational requirements.
              </p>
            </article>


            <article
              id="custom-digital-solutions"
              className="service-card"
            >
              <span className="service-number">05</span>

              <h3>
                Custom Software Solutions
              </h3>

              <p>
                Custom-built software and digital solutions designed
                around unique business needs, workflows, and operational
                challenges.
              </p>
            </article>


            <article
              id="online-business-tools"
              className="service-card"
            >
              <span className="service-number">06</span>

              <h3>
                Online Business Tools
              </h3>

              <p>
                Useful web-based tools that make common business tasks
                faster, simpler, and easier to manage.
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
            into practical software or technology.
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