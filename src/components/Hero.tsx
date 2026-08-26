
import { motion } from "framer-motion";
import heroimage from "../assets/cartoon-hero-image.webp";

function Hero() {
  return (
    <motion.section
      id="hero"
      className="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left Content */}
      <motion.div
        className="hero-left"
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
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
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.0 }}
          >
            ✅ Business Websites
          </motion.li>

          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.0 }}
          >
            ✅ Excel Templates
          </motion.li>

          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.0 }}
          >
            ✅ Business Software
          </motion.li>

          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.0 }}
          >
            ✅ Online Business Tools
          </motion.li>
        </ul>

        <div className="hero-buttons">
          <motion.a
  href="/tools"
  className="hero-btn"
  aria-label="Go to Tools"
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.95 }}
>
  Get Started
</motion.a>

          <motion.a
            href="#services"
            className="hero-btn secondary"
            aria-label="Go to Services section"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            Our Services
          </motion.a>
        </div>
      </motion.div>

      {/* Right Image */}
      <motion.div
        className="hero-right"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-image">
          <img src={heroimage} alt="hero-illustration" />
</div>
      </motion.div>
    </motion.section>
  );
}

export default Hero;