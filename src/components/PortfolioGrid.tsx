import React from "react";
import { Link } from "react-router-dom";

import website1 from "../assets/images/corporate-website.svg";
import inventory1 from "../assets/images/inventory-management.svg";
import excel1 from "../assets/images/excel-automation.svg";
import tools1 from "../assets/images/business-tools.svg";

const PortfolioGrid: React.FC = () => {
  const projects = [
    {
      title: "Corporate Business Website",
      category: "Business Website",
      description: "Modern responsive website for business growth.",
      image: website1,
      link: "/portfolio/corporate-website",
    },
    {
      title: "Inventory Management System",
      category: "Business Software",
      description: "Complete inventory software with dashboard.",
      image: inventory1,
      link: "/portfolio/inventory-management",
    },
    {
      title: "Excel Automation",
      category: "Excel Template",
      description: "Smart Excel dashboard with automation.",
      image: excel1,
      link: "/portfolio/excel-automation",
    },
    {
      title: "Business Tools",
      category: "Business Tools",
      description: "Online business tools for daily operations.",
      image: tools1,
      link: "/portfolio/business-tools",
    },
  ];

  return (
    <section className="portfolio">
      <div className="portfolio-grid">

        {projects.map((project) => (
          <div className="portfolio-card" key={project.link}>

            <div className="portfolio-image">
              <img
                src={project.image}
                alt={project.title}
              />
            </div>

            <div className="portfolio-content">

              <span>{project.category}</span>

              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <Link
                to={project.link}
                className="portfolio-btn"
              >
                View Project
              </Link>

            </div>

          </div>
        ))}

      </div>
    </section>
  );
};

export default PortfolioGrid;