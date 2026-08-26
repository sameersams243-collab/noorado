import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import "../../styles/portfoliopage/InventoryManagementPage.css";

function InventoryManagementPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="project-page inventory-management-page">

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
                Business Software
              </span>

              <h1>Inventory Management System</h1>

              <p>
                A structured inventory management solution designed to help
                businesses track materials, manage stock, and improve
                day-to-day operations.
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
                A smarter way to manage inventory and business materials.
              </h2>
            </div>

            <div>

              <p>
                This project focuses on creating a simple and structured
                system for managing inventory and tracking materials.
              </p>

              <p>
                Businesses can organize stock information, monitor
                material movement, and quickly understand what is
                available, used, or required.
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
                Managing inventory manually can become difficult.
              </h2>

              <p>
                Businesses handling multiple materials and stock items
                need an easy way to identify what is available and
                understand where materials are being used.
              </p>

              <p>
                Manual tracking can make it difficult to maintain
                accurate records and quickly find important information.
              </p>

            </div>


            <div className="solution-card">

              <span className="project-label">
                OUR SOLUTION
              </span>

              <h2>
                A structured inventory system built around the workflow.
              </h2>

              <p>
                We designed a centralized system that organizes
                inventory information and makes material tracking
                easier.
              </p>

              <p>
                The system provides a clearer view of stock, material
                status, and business requirements while reducing
                unnecessary manual work.
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
                Everything needed for better inventory control.
              </h2>

            </div>


            <div className="features-grid">

              <div className="feature-card">
                <h3>Stock Tracking</h3>

                <p>
                  Keep track of available materials and inventory
                  quantities in one organized system.
                </p>
              </div>


              <div className="feature-card">
                <h3>Material Management</h3>

                <p>
                  Organize materials with structured information
                  for easier identification and tracking.
                </p>
              </div>


              <div className="feature-card">
                <h3>Status Tracking</h3>

                <p>
                  Quickly understand the current status of materials
                  throughout the business workflow.
                </p>
              </div>


              <div className="feature-card">
                <h3>Centralized Data</h3>

                <p>
                  Keep important inventory information organized
                  and accessible from one place.
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

export default InventoryManagementPage;
