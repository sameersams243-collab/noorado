import { motion } from "framer-motion";
function WhyChooseUs() {
  return (
    <motion.section
      className="why"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      <h2>Why Choose Noorado?</h2>

      <div className="why-grid">

        <div className="why-card">
          <h3>⚡ Fast Delivery</h3>
          <p>Quick and reliable project delivery.</p>
        </div>

        <div className="why-card">
          <h3>💡 Smart Solutions</h3>
          <p>Business-focused software and automation.</p>
        </div>

        <div className="why-card">
          <h3>🔒 Secure Systems</h3>
          <p>Safe, scalable and modern applications.</p>
        </div>

        <div className="why-card">
          <h3>🤝 Customer Support</h3>
          <p>We're here whenever you need help.</p>
        </div>

      </div>
    </motion.section>
    
  );
}

export default WhyChooseUs;