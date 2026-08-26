import { Link } from "react-router-dom";
import "./ServicesPage.css";

function Services() {
  return (
    <main className="services-page">
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
            Noorado creates practical websites, business tools
            and automation solutions that make everyday work
            simpler, faster and more efficient.
          </p>
        </div>
      </section>

      <section className="services-section">
        <div className="services-container">
          <div className="services-heading section-title">
            <span>OUR SERVICES</span>

            <h2>
              Simple solutions.
              <br />
              Useful results.
            </h2>
          </div>

          <div className="services-grid">
            <article className="service-card">
              <span className="service-number">01</span>
              <h3>Corporate Websites</h3>
              <p>
                Professional and responsive websites designed
                to present your business clearly and build
                trust with your customers.
              </p>
              <Link to="/portfolio/corporate-website" className="service-link">
                View Project →
              </Link>
            </article>

            <article className="service-card">
              <span className="service-number">02</span>
              <h3>Excel Automation</h3>
              <p>
                Turn repetitive Excel work into faster,
                organised and easier-to-manage workflows
                with practical automation.
              </p>
              <Link to="/portfolio/excel-automation" className="service-link">
                View Project →
              </Link>
            </article>

            <article className="service-card">
              <span className="service-number">03</span>
              <h3>Inventory Management</h3>
              <p>
                Custom inventory solutions to help businesses
                manage products, stock movement and daily
                operations more efficiently.
              </p>
              <Link to="/portfolio/inventory-management" className="service-link">
                View Project →
              </Link>
            </article>

            <article className="service-card">
              <span className="service-number">04</span>
              <h3>Business Tools</h3>
              <p>
                Useful digital tools designed around real
                business needs, from calculations to
                document and workflow solutions.
              </p>
              <Link to="/portfolio/business-tools" className="service-link">
                View Project →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="services-cta">
        <div className="services-container">
          <span>HAVE AN IDEA?</span>

          <h2>
            Let's build something
            <br />
            useful together.
          </h2>

          <p>
            Tell us what you need and we'll help turn
            your idea into a practical digital solution.
          </p>

          <Link to="/contact" className="services-cta-button">
            Talk to Noorado →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Services;