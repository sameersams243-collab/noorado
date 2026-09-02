import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h2>Noorado</h2>
          <p>
            Build Smarter Businesses with
            Digital Solutions.
          </p>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/services">Services</Link>
            </li>

            <li>
              <Link to="/about">About</Link>
            </li>

            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Solutions</h3>
          <ul>
            <li>
              <Link to="/services">Business Websites</Link>
            </li>

            <li>
              <Link to="/services">Business Software</Link>
            </li>

            <li>
              <Link to="/services">Custom Digital Solutions</Link>
            </li>

            <li>
              <Link to="/tools">Online Tools</Link>
            </li>
          </ul>
        </div>

      </div>

      <hr />

      <p className="copyright">
        © 2026 Noorado. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;  