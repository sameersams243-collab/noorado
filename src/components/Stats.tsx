import StatCard from "./StatCard";
import { FaRocket, FaFileAlt, FaLaptop, FaStar } from "react-icons/fa";

function Stats() {
  return (
    <section id="stats" className="stats">
      <h2>Our Impact</h2>

      <div className="stats-grid">
        <StatCard
          icon={<FaRocket />}
          number="500+"
          label="Businesses Served"
        />

        <StatCard
          icon={<FaFileAlt />}
          number="50+"
          label="Excel Templates"
        />

        <StatCard
          icon={<FaLaptop />}
          number="20+"
          label="Business Tools"
        />

        <StatCard
          icon={<FaStar />}
          number="100%"
          label="Client Satisfaction"
        />
      </div>
    </section>
  );
}

export default Stats;