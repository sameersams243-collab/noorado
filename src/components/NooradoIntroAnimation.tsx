import "./NooradoIntroAnimation.css";

const introServices = [
  { label: "Websites", mark: "01" },
  { label: "Business Tools", mark: "02" },
  { label: "Software", mark: "03" },
  { label: "Automation", mark: "04" },
];

function NooradoIntroAnimation() {
  return (
    <div className="noorado-intro" aria-label="Noorado digital solutions">
      <div className="noorado-intro-orbit noorado-intro-orbit-one" />
      <div className="noorado-intro-orbit noorado-intro-orbit-two" />

      <div className="noorado-intro-panel">
        <div className="noorado-intro-panel-topline">
          <span className="noorado-intro-status">NOORADO / 01</span>
          <span className="noorado-intro-status-dot" aria-hidden="true" />
        </div>

        <div className="noorado-intro-brand">
          <span className="noorado-intro-brand-mark" aria-hidden="true">
            N
          </span>
          <div>
            <strong>NOORADO</strong>
            <span>Digital Solutions</span>
          </div>
        </div>

        <div className="noorado-intro-divider" />

        <div className="noorado-intro-message">
          <span>BUILD / SIMPLIFY / GROW</span>
          <h2>Digital solutions<br />for real work.</h2>
        </div>

        <div className="noorado-intro-services">
          {introServices.map((service) => (
            <div className="noorado-intro-service" key={service.label}>
              <span className="noorado-intro-service-mark">{service.mark}</span>
              <span>{service.label}</span>
            </div>
          ))}
        </div>

        <div className="noorado-intro-footer">
          <span>NOORADO.STUDIO</span>
          <span className="noorado-intro-footer-line" aria-hidden="true" />
          <span>EST. 2024</span>
        </div>
      </div>
    </div>
  );
}

export default NooradoIntroAnimation;
