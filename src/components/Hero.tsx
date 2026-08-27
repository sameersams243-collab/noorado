import { Globe, FileSpreadsheet, Settings, Briefcase } from "lucide-react";
import heroimage from "../assets/cartoon-hero-image.webp";

function Hero() {
  return (
    <section
      id="hero"
      className="hero"
    >
      {/* Left Content */}
      <div className="hero-left">
        <h1>
          Build Smarter Businesses
          <br />
          With Digital Solutions
        </h1>

        <p>
          We help startups and businesses grow with professional websites,
          business management systems, Excel templates, and online business
          tools.
        </p>

        <ul className="hero-list">
          <li>
            <span className="feature-icon">
              <Globe />
            </span>
            Business Websites
          </li>

          <li>
            <span className="feature-icon">
              <FileSpreadsheet />
            </span>
            Excel Templates
          </li>

          <li>
            <span className="feature-icon">
              <Settings />
            </span>
            Business Software
          </li>

          <li>
            <span className="feature-icon">
              <Briefcase />
            </span>
            Online Business Tools
          </li>
        </ul>

        <div className="hero-buttons">
          <a
            href="/tools"
            className="hero-btn"
            aria-label="Go to Tools"
          >
            Get Started
          </a>

          <a
            href="#services"
            className="hero-btn secondary"
            aria-label="Go to Services section"
          >
            Our Services
          </a>
        </div>
      </div>

      {/* Right Image */}
      <div className="hero-right">
        <div className="hero-image">
          <img
            src={heroimage}
            alt="hero-illustration"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;