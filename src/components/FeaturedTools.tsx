import { Link } from "react-router-dom";
import "./FeaturedTools.css";

type FeaturedTool = {
  category: string;
  title: string;
  description: string;
  path: string;
  button: string;
  comingSoon?: boolean;
};

const FEATURED_TOOLS: FeaturedTool[] = [
  {
    category: "CALCULATORS",
    title: "GST Calculator",
    description: "Calculate discount, taxable amount, GST and final price.",
    path: "/tools/gst-discount-calculator",
    button: "Use Tool →",
  },
  {
    category: "BUSINESS",
    title: "GST Invoice Generator",
    description: "Create a professional GST invoice and download it as PDF.",
    path: "/tools/gst-invoice-generator",
    button: "Create Invoice →",
  },
  {
    category: "CALCULATORS",
    title: "EMI Calculator",
    description: "Calculate monthly EMI, interest and total loan payment.",
    path: "/tools/emi-calculator",
    button: "Use Tool →",
  },
];

function FeaturedTools() {
  return (
    <section className="featured-tools">
      <div className="featured-tools-container">
        <div className="featured-tools-header">
          <span>NOORADO TOOLS</span>
          <h2>Free tools for everyday work</h2>
          <p>
            Simple, practical tools to calculate,
            create and manage your everyday business tasks.
          </p>
        </div>

        <div className="featured-tools-grid">
          {FEATURED_TOOLS.map((tool) => (
            <div
              className={`featured-tool-card ${
                tool.comingSoon ? "coming-soon" : ""
              }`}
              key={tool.title}
            >
              <span className="featured-tool-category">
                {tool.category}
              </span>

              <h3>{tool.title}</h3>
              <p>{tool.description}</p>

              {tool.comingSoon ? (
                <span className="featured-tool-coming">
                  Coming Soon
                </span>
              ) : (
                <Link to={tool.path} className="featured-tool-link">
                  {tool.button}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="featured-tools-footer">
          <Link to="/tools" className="featured-tools-view-all">
            View All Tools →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedTools;
