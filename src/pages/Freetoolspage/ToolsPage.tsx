import Navbar from "../../components/Navbar";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./ToolsPage.css";

type Tool = {
  title: string;
  description: string;
  category: string;
  path: string;
  available: boolean;
};

const TOOLS: Tool[] = [
  {
    title: "GST Calculator",
    description:
      "Calculate discount, GST and final payable amount quickly.",
    category: "Calculators",
    path: "/tools/gst-discount-calculator",
    available: true,
  },

  {
    title: "GST Invoice Generator",
    description:
      "Create a professional GST invoice and download it as a PDF.",
    category: "Business",
    path: "/tools/gst-invoice-generator",
    available: true,
  },

  {
    title: "EMI Calculator",
    description:
      "Calculate your monthly loan EMI, interest and total payment.",
    category: "Calculators",
    path: "/tools/emi-calculator",
    available: true,
  },

  {
    title: "Percentage Calculator",
    description:
      "Quickly calculate percentages, increases and decreases.",
    category: "Calculators",
    path: "/tools/percentage-calculator",
    available: true,
  },

  {
    title: "Age Calculator",
    description:
      "Calculate your exact age from your date of birth.",
    category: "Everyday",
    path: "/tools/age-calculator",
    available: true,
  },

  {
    title: "Profit & Loss Calculator",
    description:
      "Calculate profit, loss and percentage from your selling price.",
    category: "Business",
    path: "/tools/profit-loss-calculator",
    available: true,
  },

  {
    title: "PDF to Excel",
    description:
      "Convert PDF tables into editable Excel files.",
    category: "PDF Tools",
    path: "/tools/pdf-to-excel",
    available: false,
  },

  {
    title: "PDF to Word",
    description:
      "Convert PDF documents into editable Word files.",
    category: "PDF Tools",
    path: "/tools/pdf-to-word",
    available: false,
  },

  {
    title: "JPG to PDF",
    description:
      "Convert images into PDF documents quickly.",
    category: "PDF Tools",
    path: "/tools/jpg-to-pdf",
    available: false,
  },
];

const CATEGORIES = [
  "All",
  "Calculators",
  "Business",
  "PDF Tools",
  "Everyday",
];

function ToolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || tool.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <main className="tools-page">

      {/* HERO */}

      <section className="tools-hero">

        <div className="tools-container">

          <span className="tools-label">
            NOORADO TOOLS
          </span>

          <h1>
            Useful tools for
            <br />
            everyday work.
          </h1>

          <p>
            Simple, practical and free tools designed
            to help you calculate, convert and get
            everyday tasks done faster.
          </p>

        </div>

      </section>


      {/* TOOLS */}

      <section className="tools-section">

        <div className="tools-container">

          {/* SEARCH */}

          <div className="tools-search">

            <input
              type="search"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tools"
            />

          </div>


          {/* CATEGORIES */}

          <div className="tools-categories">

            {CATEGORIES.map((item) => (

              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "active"
                    : ""
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>

            ))}

          </div>


          {/* TOOL GRID */}

          <div className="tools-grid">

            {filteredTools.map((tool) => (

              <div
                className={
                  tool.available
                    ? "tool-card"
                    : "tool-card coming-soon"
                }
                key={tool.path}
              >

                <div className="tool-card-top">
                  <span className="tool-category">
                    {tool.category}
                  </span>

                  {tool.available && (
                    <span className="tool-available">
                      Available
                    </span>
                  )}
                </div>

                <h2>
                  {tool.title}
                </h2>

                <p>
                  {tool.description}
                </p>

                {tool.available ? (

                  <Link
                    to={tool.path}
                    className="tool-button"
                  >
                    Use Tool →
                  </Link>

                ) : (

                  <span className="tool-coming-soon">
                    Coming Soon
                  </span>

                )}

              </div>

            ))}

          </div>


          {/* NO RESULTS */}

          {filteredTools.length === 0 && (

            <div className="tools-empty">

              <h2>
                No tools found
              </h2>

              <p>
                Try another search or category.
              </p>

            </div>

          )}

        </div>

      </section>

      </main>
    </>
  );
}

export default ToolsPage;
