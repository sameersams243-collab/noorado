import {
  Globe,
  Settings,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
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
          Build Smarter.
          <br />
          Work Better.
          <br />
          Grow Faster.
        </h1>

        <p>
          Noorado is a software company building SaaS products, business
          software, websites, and digital tools that help businesses simplify
          operations and work more efficiently.
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
              <Settings />
            </span>
            Business Software
          </li>

          <li>
            <span className="feature-icon">
              <Sparkles />
            </span>
            SaaS Products
          </li>

          <li>
            <span className="feature-icon">
              <BriefcaseBusiness />
            </span>
            Digital Tools
          </li>
        </ul>

        <div className="hero-buttons">
          <Link
            to="/tools"
            className="hero-btn"
            aria-label="Go to Tools"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Right Image */}
      <div className="hero-right">
        <div className="hero-image">
          <img
            src={heroimage}
            alt="Noorado software company and business technology solutions"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;