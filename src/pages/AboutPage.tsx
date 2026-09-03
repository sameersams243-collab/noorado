import { Link } from "react-router-dom";
import "./AboutPage.css";

function About() {
  return (
    <main className="about-page">

      {/* TOP BACK BUTTON */}
      <div className="about-top-nav">
        <div className="about-container">
          <Link to="/" className="about-back-button">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="about-hero">
        <div className="about-container">
          <span className="about-label">
            ABOUT NOORADO
          </span>

          <h1>
            Building Practical Technology
            <br />
            for What's Next
          </h1>

          <p>
            Noorado is a software company building SaaS products, business software, websites, and digital tools that help businesses simplify operations and work more efficiently.
          </p>
        </div>
      </section>

      {/* WHAT WE BELIEVE */}
      <section className="about-section">
        <div className="about-container">
          <span className="about-section-label">
            WHAT WE BELIEVE
          </span>

          <h2>
            Technology should be practical.
          </h2>

          <p>
            Products should be useful, simple to understand,
            and designed to solve problems that actually matter.
            We focus on building technology with a clear purpose
            rather than adding complexity for its own sake.
          </p>
        </div>
      </section>

      {/* WHAT WE'RE BUILDING */}
      <section className="about-section about-building">
        <div className="about-container">
          <span className="about-section-label">
            WHAT WE'RE BUILDING
          </span>

          <h2>
            Products for the future.
          </h2>

          <div className="about-building-grid">

            <div>
              <h3>Software</h3>
              <p>
                Practical business software designed around
                real business needs and workflows.
              </p>
            </div>

            <div>
              <h3>SaaS Products</h3>
              <p>
                Scalable products designed to simplify
                everyday work.
              </p>
            </div>

            <div>
              <h3>Digital Tools</h3>
              <p>
                Useful online business tools that make common
                tasks faster, simpler, and easier.
              </p>
            </div>

            <div>
              <h3>Future Technology</h3>
              <p>
                Ambitious ideas explored through
                Noorado Studio.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* NOORADO STUDIO */}
      <section className="about-studio">
        <div className="about-container">

          <span className="about-studio-label">
            NOORADO STUDIO
          </span>

          <h2>
            The Future Is Being Built
          </h2>

          <p>
            Our studio is where we explore ambitious ideas,
            develop new products, and experiment with
            technology for what's next.
          </p>

          <Link
            to="/studio"
            className="about-studio-button"
          >
            Explore Noorado Studio →
          </Link>

        </div>
      </section>

      {/* OUR VISION */}
      <section className="about-section">
        <div className="about-container">

          <span className="about-section-label">
            OUR VISION
          </span>

          <h2>
            Build useful technology.
          </h2>

          <p>
            We want to build useful software and technology
            that helps people and businesses work smarter,
            operate better, and prepare for what's next.
          </p>

        </div>
      </section>

    </main>
  );
}

export default About;