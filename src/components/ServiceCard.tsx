import { motion } from "framer-motion";

type ServiceCardProps = {
  title: string;
  description: string;
};

function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <motion.div
      className="service-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{
        y: -10,
        scale: 1.03,
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}

export default ServiceCard;