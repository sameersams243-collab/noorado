import ServiceCard from "./ServiceCard";

const services = [
  {
    title: "Business Websites",
    description: "Professional websites for startups and businesses."
  },
  {
    title: "Excel Templates",
    description: "Ready-made templates with formulas."
  },
  {
    title: "Business Tools",
    description: "Online calculators and productivity tools."
  },
  {
    title: "Custom Software",
    description: "HR, Inventory and Business Management Systems."
  }
];

function Services() {
  return (
   <section id="services" className="services">
      <h2>Our Services</h2>

     <div className="services-grid">
  {services.map((service, index) => (
    <ServiceCard
      key={index}
      title={service.title}
      description={service.description}
    />
  ))}
</div>
    </section>
  );
}

export default Services;