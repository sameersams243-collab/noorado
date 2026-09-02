import "./StudioPage.css";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  tagline: string;
  title: string;
  description: string;
  status: string;
  icon: React.ReactNode;
}

const projects: Project[] = [
  {
    id: "oxynext",
    tagline: "Portable Oxygen-Relaxation Pod",
    title: "Oxynext",
    description:
      "A revolutionary wellness device designed to provide portable oxygen enrichment and deep relaxation experiences. Perfect for on-the-go wellness enthusiasts seeking rejuvenation and enhanced oxygen therapy.",
    status: "In Development",
    icon: (
      <svg
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        className="studio-page-icon-svg"
      >
        {/* Capsule/Pod shape with rounded ends */}
        <path
          d="M 20 30 Q 20 20 30 20 L 50 20 Q 60 20 60 30 L 60 50 Q 60 60 50 60 L 30 60 Q 20 60 20 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner circle to suggest oxygen bubble */}
        <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {/* Center dot */}
        <circle cx="40" cy="40" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "drone-navigator",
    tagline: "Smart Drone Navigation System",
    title: "Drone Navigator",
    description:
      "An intelligent autonomous navigation platform for drones with advanced pathfinding and obstacle detection. Enables seamless autonomous missions in complex environments with real-time optimization.",
    status: "Prototype",
    icon: (
      <svg
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        className="studio-page-icon-svg"
      >
        {/* Path/Vector line suggesting flight path */}
        <path
          d="M 15 40 Q 30 25 40 15 T 65 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Arrow/pointer at end */}
        <path
          d="M 60 38 L 68 40 L 60 42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Start point */}
        <circle cx="15" cy="40" r="3" fill="currentColor" />
        {/* Waypoint marker */}
        <circle cx="40" cy="15" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    ),
  },
  {
    id: "app-builder",
    tagline: "Platform for Building Connected Business Applications",
    title: "Noorado App Builder",
    description:
      "A comprehensive no-code/low-code platform for creating enterprise-grade business applications. Enables teams to rapidly build, deploy, and scale connected applications without extensive coding.",
    status: "R&D",
    icon: (
      <svg
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        className="studio-page-icon-svg"
      >
        {/* Grid/Node pattern suggesting connected applications */}
        <circle cx="25" cy="25" r="3" fill="currentColor" />
        <circle cx="40" cy="25" r="3" fill="currentColor" />
        <circle cx="55" cy="25" r="3" fill="currentColor" />
        <circle cx="25" cy="40" r="3" fill="currentColor" />
        <circle cx="40" cy="40" r="3" fill="currentColor" />
        <circle cx="55" cy="40" r="3" fill="currentColor" />
        <circle cx="25" cy="55" r="3" fill="currentColor" />
        <circle cx="40" cy="55" r="3" fill="currentColor" />
        <circle cx="55" cy="55" r="3" fill="currentColor" />
        {/* Connecting lines */}
        <line
          x1="25"
          y1="25"
          x2="40"
          y2="25"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="40"
          y1="25"
          x2="55"
          y2="25"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="25"
          y1="25"
          x2="25"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="40"
          y1="25"
          x2="40"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="55"
          y1="25"
          x2="55"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="25"
          y1="40"
          x2="40"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="40"
          y1="40"
          x2="55"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    ),
  },
  {
    id: "quick-bath",
    tagline: "Instant Bath Solution",
    title: "Quick Bath",
    description:
      "An innovative bathing technology that delivers instant, personalized bath experiences. Combines temperature control, aromatherapy, and wellness features for the modern lifestyle.",
    status: "In Development",
    icon: (
      <svg
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        className="studio-page-icon-svg"
      >
        {/* Droplet/Wave shape */}
        <path
          d="M 40 15 Q 35 25 35 32 Q 35 42 40 47 Q 45 42 45 32 Q 45 25 40 15 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Wave lines below */}
        <path
          d="M 25 52 Q 30 55 40 55 Q 50 55 55 52"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 22 60 Q 27 63 40 63 Q 53 63 58 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    ),
  },
];

function StudioPage() {
  return (
    
    <div className="studio-page">
          <Link to="/" className="studio-page-back">
        ← Back to Home
      </Link>
       
       
        
      {/* Hero Section */}
      <section className="studio-page-hero">
        <div className="studio-page-hero-content">
            
          <div className="studio-page-eyebrow">NOORADO STUDIO // R&D LAB</div>
          <span className="studio-page-badge">
            <span className="studio-page-badge-noorado">Noorado</span>
            <span className="studio-page-badge-studio">Studio</span>
          </span>
          <h1 className="studio-page-heading">Four Ideas. One Lab.</h1>
          <p className="studio-page-subtitle">
            Explore our experimental projects pushing the boundaries of technology and
            wellness. Early-stage innovations designed to shape the future.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="studio-page-projects">
        <div className="studio-page-grid">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="studio-page-card"
              style={{ "--card-index": index } as React.CSSProperties}
            >
              <div className="studio-page-card-header">
                <span className="studio-page-project-tag">
                  PROJECT_{String(index + 1).padStart(2, "0")} // {project.id.toUpperCase()}
                </span>
                <div className="studio-page-icon-container">
                  {project.icon}
                </div>
              </div>

              <div className="studio-page-card-body">
                <h3 className="studio-page-card-title">{project.title}</h3>
                <p className="studio-page-card-tagline">{project.tagline}</p>
                <p className="studio-page-card-description">{project.description}</p>
              </div>

              <div className="studio-page-card-footer">
                <span className="studio-page-status-badge">{project.status}</span>
              </div>
            </article>
            
          ))}
        </div>
      </section>

      {/* Closing Section */}
      <section className="studio-page-closing">
        <p className="studio-page-closing-text">More from the lab, coming soon.</p>
      </section>
    </div>
  );
}



export default StudioPage;
