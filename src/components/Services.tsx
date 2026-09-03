import { Link } from "react-router-dom";
import "./Services.css";

function Services() {
  return (
    <section id="services" className="services">
      <div className="studio-intro">
        <span className="studio-label">
          <span className="label-noorado">Noorado</span>{" "}
          <span className="label-studio">Studio</span>
        </span>

        <h2>
          The Future Is Being Built
        </h2>

        <p>
          Noorado is a software company building new products,
          business software, SaaS solutions, and technology
          for the future.
        </p>

        <Link
          to="/studio"
          className="studio-button"
        >
          Explore Noorado Studio →
        </Link>
      </div>
    </section>
  );
}

export default Services;