import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        Noorado
      </div>

      <ul className="nav-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/tools"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Tools
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/portfolio"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Portfolio
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;