import { motion } from "framer-motion";
import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  number: string;
  label: string;
};

function StatCard({ icon, number, label }: StatCardProps) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.08,
        rotate: 1,
      }}
    >
      {icon}
      <h3>{number}</h3>
      <p>{label}</p>
    </motion.div>
  );
}

export default StatCard;