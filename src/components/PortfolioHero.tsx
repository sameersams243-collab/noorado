import { motion } from "framer-motion";

function PortfolioHero() {
  return (
    <section className="portfolio-hero">
      <motion.div
        className="portfolio-hero-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration:0.8 }}
      >
      <h1 className="portfolio-glow-title">Our Portfolio</h1>
        <p>
          We build premium business websites, software solutions,
          Excel automation, and digital tools that help businesses grow.
        </p>
      </motion.div>
    </section>
  );
}

export default PortfolioHero;