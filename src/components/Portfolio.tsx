function Portfolio() {
  return (
    <section className="portfolio">

      <div className="portfolio-header">
        
        
        <h1>Our Portfolio</h1>
        <p>
          Discover our latest projects in websites, software,
          Excel automation, and digital business solutions.
        </p>
      </div>

      <div className="portfolio-filter">
        <button className="active">All</button>
        <button>Websites</button>
        <button>Software</button>
        <button>Excel</button>
        <button>Mobile Apps</button>
      </div>

      <div className="portfolio-grid">

        <div className="portfolio-card">
          <div className="portfolio-image"></div>

          <h3>Corporate Business Website</h3>

          <p>
            Modern responsive website built for business growth.
          </p>

          <button>View Project</button>
        </div>

        <div className="portfolio-card">
          <div className="portfolio-image"></div>

          <h3>Inventory Management System</h3>

          <p>
            Complete inventory software with dashboard and reports.
          </p>

          <button>View Project</button>
        </div>

        <div className="portfolio-card">
          <div className="portfolio-image"></div>

          <h3>Excel Automation</h3>

          <p>
            Smart Excel templates with advanced formulas and automation.
          </p>

          <button>View Project</button>
        </div>

      </div>

    </section>
  );
}

export default Portfolio;