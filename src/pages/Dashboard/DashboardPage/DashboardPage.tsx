import { Link, useNavigate } from "react-router-dom";
import "./DashboardPage.css";

type NooradoUser = {
  name: string;
  email: string;
};

function getStoredUser(): NooradoUser | null {
  const savedUser = localStorage.getItem("noorado_user");

  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(savedUser);

    if (
      typeof parsedUser !== "object" ||
      parsedUser === null ||
      !("name" in parsedUser) ||
      !("email" in parsedUser) ||
      typeof parsedUser.name !== "string" ||
      typeof parsedUser.email !== "string"
    ) {
      return null;
    }

    return {
      name: parsedUser.name,
      email: parsedUser.email,
    };
  } catch {
    return null;
  }
}

function DashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  return (
    <main className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          Noorado
        </div>

        <nav className="dashboard-nav">

          <Link
            to="/dashboard"
            className="dashboard-nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/portfolio"
            className="dashboard-nav-item"
          >
            <span>◈</span>
            My Projects
          </Link>

          <Link
            to="/portfolio/business-tools"
            className="dashboard-nav-item"
          >
            <span>▣</span>
            Business Tools
          </Link>

          <Link
            to="/portfolio/excel-automation"
            className="dashboard-nav-item"
          >
            <span>▤</span>
            Excel Automation
          </Link>

        </nav>

        <div className="dashboard-sidebar-bottom">

          <Link
            to="#"
            className="dashboard-nav-item"
          >
            <span>⚙</span>
            Settings
          </Link>

          <button
            type="button"
            className="dashboard-nav-item logout"
            onClick={() => {
              localStorage.removeItem("noorado_logged_in");
              navigate("/signin", { replace: true });
            }}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* Main Content */}
      <section className="dashboard-main">

        {/* Top Bar */}
        <header className="dashboard-header">

          <div>
            <span className="dashboard-label">
              NOORADO DASHBOARD
            </span>

            <h1>
              Welcome back
            </h1>

            <p>
              Manage your projects and digital tools from one place.
            </p>
          </div>

          <div className="dashboard-profile">

            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || "N"}
            </div>

            <div>
              <strong>
                {user?.name || "Noorado User"}
              </strong>

              <span>
                {user?.email || "Account"}
              </span>
            </div>

          </div>

        </header>


        {/* Overview Cards */}
        <section className="dashboard-overview">

          <div className="dashboard-stat-card">
            <span>
              PROJECTS
            </span>

            <strong>
              04
            </strong>

            <p>
              Active portfolio projects
            </p>
          </div>


          <div className="dashboard-stat-card">
            <span>
              BUSINESS TOOLS
            </span>

            <strong>
              08
            </strong>

            <p>
              Practical tools available
            </p>
          </div>


          <div className="dashboard-stat-card">
            <span>
              AUTOMATIONS
            </span>

            <strong>
              12
            </strong>

            <p>
              Processes simplified
            </p>
          </div>

        </section>


        {/* Projects */}
        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <div>
              <span>
                YOUR WORK
              </span>

              <h2>
                Recent Projects
              </h2>
            </div>

            <Link to="/portfolio">
              View All
            </Link>

          </div>


          <div className="dashboard-project-grid">

            <Link
              to="/portfolio/corporate-website"
              className="dashboard-project-card"
            >
              <span className="project-card-category">
                BUSINESS WEBSITE
              </span>

              <h3>
                Corporate Business Website
              </h3>

              <p>
                Modern responsive website for business growth.
              </p>

              <span className="project-card-arrow">
                →
              </span>
            </Link>


            <Link
              to="/portfolio/inventory-management"
              className="dashboard-project-card"
            >
              <span className="project-card-category">
                BUSINESS SOFTWARE
              </span>

              <h3>
                Inventory Management System
              </h3>

              <p>
                Complete inventory software with dashboard.
              </p>

              <span className="project-card-arrow">
                →
              </span>
            </Link>


            <Link
              to="/portfolio/excel-automation"
              className="dashboard-project-card"
            >
              <span className="project-card-category">
                EXCEL AUTOMATION
              </span>

              <h3>
                Excel Automation
              </h3>

              <p>
                Smart Excel dashboards and automated workflows.
              </p>

              <span className="project-card-arrow">
                →
              </span>
            </Link>


            <Link
              to="/portfolio/business-tools"
              className="dashboard-project-card"
            >
              <span className="project-card-category">
                DIGITAL TOOLS
              </span>

              <h3>
                Business Tools
              </h3>

              <p>
                Practical tools for everyday business operations.
              </p>

              <span className="project-card-arrow">
                →
              </span>
            </Link>

          </div>

        </section>


        {/* Quick Actions */}
        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <div>
              <span>
                QUICK ACCESS
              </span>

              <h2>
                Business Solutions
              </h2>
            </div>

          </div>


          <div className="dashboard-actions">

            <Link
              to="/portfolio/business-tools"
              className="dashboard-action"
            >
              <strong>
                Business Tools
              </strong>

              <span>
                Simplify everyday tasks →
              </span>
            </Link>


            <Link
              to="/portfolio/excel-automation"
              className="dashboard-action"
            >
              <strong>
                Excel Automation
              </strong>

              <span>
                Automate your spreadsheets →
              </span>
            </Link>


            <Link
              to="/portfolio/inventory-management"
              className="dashboard-action"
            >
              <strong>
                Inventory System
              </strong>

              <span>
                Manage business inventory →
              </span>
            </Link>

          </div>

        </section>

      </section>

    </main>
  );
}

export default DashboardPage;