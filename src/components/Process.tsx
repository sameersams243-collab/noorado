function Process() {
  const steps = [
    {
      number: "01",
      title: "Requirement Discussion",
      description:
        "We understand your business goals and gather all project requirements.",
    },
    {
      number: "02",
      title: "Planning & Design",
      description:
        "We create a structured plan and design the best solution for your business.",
    },
    {
      number: "03",
      title: "Development",
      description:
        "Our team develops your website, software, or business tools with modern technologies.",
    },
    {
      number: "04",
      title: "Testing",
      description:
        "Every project is thoroughly tested to ensure quality, performance, and reliability.",
    },
    {
      number: "05",
      title: "Launch & Support",
      description:
        "We deploy your project and provide continuous support whenever needed.",
    },
  ];

  return (
    <section className="process">
      <h2>How We Work</h2>

      <div className="process-grid">
        {steps.map((step) => (
          <div className="process-card" key={step.number}>
            <div className="process-number">{step.number}</div>

            <h3>{step.title}</h3>

            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Process;