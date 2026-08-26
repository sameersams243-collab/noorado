import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import "../../styles/portfolioPage/CorporateWebsitePage.css";

function CorporateWebsitePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="project-page corporate-website-page">
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
                Business Website
              </span>

              <h1>Corporate Business Website</h1>

              <p>
                A modern, responsive website designed to help a business
                establish a strong digital presence and grow online.
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
                A professional digital presence built for business growth.
              </h2>
            </div>

            <div>
              <p>
                This project focuses on creating a modern corporate website
                that presents the business clearly and professionally.
              </p>

              <p>
                The website provides simple navigation, responsive design,
                clear service information, and a strong digital experience
                across different devices.
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
                Creating a website that feels professional and easy to use.
              </h2>

              <p>
                Businesses need a strong online presence that clearly
                communicates their services while remaining simple for
                visitors to navigate.
              </p>

              <p>
                The goal was to create a clean, modern experience that works
                smoothly across different screen sizes.
              </p>
            </div>


            <div className="solution-card">
              <span className="project-label">
                OUR SOLUTION
              </span>

              <h2>
                A modern digital experience built around the business.
              </h2>

              <p>
                We designed a responsive website with clear navigation,
                structured content, modern visuals, and a user-friendly layout.
              </p>

              <p>
                The result is a professional website that presents the
                business clearly and gives customers an easier way to explore
                its services.
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
                Designed to deliver a better digital experience.
              </h2>
            </div>


            <div className="features-grid">

              <div className="feature-card">
                <h3>Responsive Design</h3>

                <p>
                  A seamless experience across desktop, tablet,
                  and mobile devices.
                </p>
              </div>


              <div className="feature-card">
                <h3>Easy Navigation</h3>

                <p>
                  Clear and simple navigation helps visitors
                  find information quickly.
                </p>
              </div>


              <div className="feature-card">
                <h3>Modern Interface</h3>

                <p>
                  A clean visual design that creates a professional
                  business presence.
                </p>
              </div>


              <div className="feature-card">
                <h3>Business Focused</h3>

                <p>
                  Structured content that clearly communicates
                  services and value.
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

export default CorporateWebsitePage;