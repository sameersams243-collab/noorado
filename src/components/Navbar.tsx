import {
  useEffect,
  useRef,
  useState,
} from "react";
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navbarRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const toggleMenu = (menu: string) => {
    clearCloseTimer();

    setOpenMenu((current) =>
      current === menu ? null : menu
    );
  };

  const closeMenuWithDelay = () => {
    clearCloseTimer();

    closeTimerRef.current = window.setTimeout(() => {
      setOpenMenu(null);
      closeTimerRef.current = null;
    }, 300);
  };

  const keepMenuOpen = () => {
    clearCloseTimer();
  };

  const closeMenus = () => {
    clearCloseTimer();
    setOpenMenu(null);
  };

  const closeMobileMenu = () => {
    clearCloseTimer();
    setMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const goHome = () => {
    closeMobileMenu();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        navbarRef.current &&
        !navbarRef.current.contains(target)
      ) {
        setOpenMenu(null);
        setMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setMobileMenuOpen(false);
      setOpenMenu(null);
    };

    document.addEventListener(
      "pointerdown",
      handleOutsidePointer
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointer
      );

      window.removeEventListener(
        "scroll",
        handleScroll
      );

      clearCloseTimer();
    };
  }, []);

  return (
    <nav
      className="navbar"
      ref={navbarRef}
    >
      {/* Logo - unchanged */}
      <div className="logo">
        Noorado
      </div>

      {/* Desktop Navigation */}
      <ul className="nav-links">

        {/* HOME */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
            onClick={goHome}
          >
            Home
          </NavLink>
        </li>

        {/* TOOLS */}
        <li
          className="nav-dropdown"
          onMouseEnter={keepMenuOpen}
          onMouseLeave={closeMenuWithDelay}
        >
          <button
            type="button"
            className="nav-dropdown-trigger"
            onClick={() => toggleMenu("tools")}
            aria-expanded={openMenu === "tools"}
            aria-haspopup="true"
          >
            <span>Tools</span>

            <span
              className="nav-dropdown-arrow"
              aria-hidden="true"
            />
          </button>

          {openMenu === "tools" && (
            <div
              className="nav-dropdown-menu"
              onMouseEnter={keepMenuOpen}
              onMouseLeave={closeMenuWithDelay}
            >
              <Link
                to="/tools"
                onClick={closeMenus}
              >
                <strong>All Tools</strong>
              </Link>

              <Link
                to="/tools/gst-discount-calculator"
                onClick={closeMenus}
              >
                <strong>GST Calculator</strong>
              </Link>

              <Link
                to="/tools/emi-calculator"
                onClick={closeMenus}
              >
                <strong>EMI Calculator</strong>
              </Link>

              <Link
                to="/tools/percentage-calculator"
                onClick={closeMenus}
              >
                <strong>Percentage Calculator</strong>
              </Link>

              <Link
                to="/tools/profit-loss-calculator"
                onClick={closeMenus}
              >
                <strong>Profit &amp; Loss Calculator</strong>
              </Link>

              <Link
                to="/tools/gst-invoice-generator"
                onClick={closeMenus}
              >
                <strong>GST Invoice Generator</strong>
              </Link>

              <div className="nav-dropdown-disabled">
                <strong>PDF Tools</strong>
                <small>Coming Soon</small>
              </div>
            </div>
          )}
        </li>

        {/* SOLUTIONS */}
        <li
          className="nav-dropdown"
          onMouseEnter={keepMenuOpen}
          onMouseLeave={closeMenuWithDelay}
        >
          <button
            type="button"
            className="nav-dropdown-trigger"
            onClick={() => toggleMenu("solutions")}
            aria-expanded={openMenu === "solutions"}
            aria-haspopup="true"
          >
            <span>Solutions</span>

            <span
              className="nav-dropdown-arrow"
              aria-hidden="true"
            />
          </button>

          {openMenu === "solutions" && (
            <div
              className="nav-dropdown-menu"
              onMouseEnter={keepMenuOpen}
              onMouseLeave={closeMenuWithDelay}
            >
              <Link
                to="/services#business-websites"
                onClick={closeMenus}
              >
                <strong>Business Websites</strong>
              </Link>

              <Link
                to="/services#business-software"
                onClick={closeMenus}
              >
                <strong>Business Software</strong>
              </Link>

              <Link
                to="/services#app-builder"
                onClick={closeMenus}
              >
                <strong>App Builder</strong>
              </Link>

              <Link
                to="/services#custom-digital-solutions"
                onClick={closeMenus}
              >
                <strong>
                  Custom Digital Solutions
                </strong>
              </Link>
            </div>
          )}
        </li>

        {/* RESOURCES */}
        <li
          className="nav-dropdown"
          onMouseEnter={keepMenuOpen}
          onMouseLeave={closeMenuWithDelay}
        >
          <button
            type="button"
            className="nav-dropdown-trigger"
            onClick={() => toggleMenu("resources")}
            aria-expanded={openMenu === "resources"}
            aria-haspopup="true"
          >
            <span>Resources</span>

            <span
              className="nav-dropdown-arrow"
              aria-hidden="true"
            />
          </button>

          {openMenu === "resources" && (
            <div
              className="nav-dropdown-menu"
              onMouseEnter={keepMenuOpen}
              onMouseLeave={closeMenuWithDelay}
            >
              <Link
                to="/#announcements"
                onClick={closeMenus}
              >
                <strong>What's New</strong>
              </Link>

              <Link
                to="/studio"
                onClick={closeMenus}
              >
                <strong>Projects</strong>
              </Link>

              <Link
                to="/about"
                onClick={closeMenus}
              >
                <strong>About Noorado</strong>
              </Link>
            </div>
          )}
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => {
          clearCloseTimer();

          setMobileMenuOpen((current) => !current);
          setOpenMenu(null);
        }}
        aria-label={
          mobileMenuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          id="mobile-navigation"
        >
          {/* HOME */}
          <NavLink
            to="/"
            className="mobile-nav-link"
            onClick={goHome}
          >
            Home
          </NavLink>

          {/* TOOLS */}
          <div className="mobile-nav-group">
            <button
              type="button"
              className="mobile-nav-trigger"
              onClick={() =>
                toggleMenu("mobile-tools")
              }
              aria-expanded={
                openMenu === "mobile-tools"
              }
            >
              <span>Tools</span>
              <span>
                {openMenu === "mobile-tools"
                  ? "−"
                  : "+"}
              </span>
            </button>

            {openMenu === "mobile-tools" && (
              <div className="mobile-submenu">
                <Link
                  to="/tools"
                  onClick={closeMobileMenu}
                >
                  All Tools
                </Link>

                <Link
                  to="/tools/gst-discount-calculator"
                  onClick={closeMobileMenu}
                >
                  GST Calculator
                </Link>

                <Link
                  to="/tools/emi-calculator"
                  onClick={closeMobileMenu}
                >
                  EMI Calculator
                </Link>

                <Link
                  to="/tools/percentage-calculator"
                  onClick={closeMobileMenu}
                >
                  Percentage Calculator
                </Link>

                <Link
                  to="/tools/profit-loss-calculator"
                  onClick={closeMobileMenu}
                >
                  Profit &amp; Loss Calculator
                </Link>

                <Link
                  to="/tools/gst-invoice-generator"
                  onClick={closeMobileMenu}
                >
                  GST Invoice Generator
                </Link>

                <div className="mobile-submenu-disabled">
                  <span>PDF Tools</span>
                  <small>Coming Soon</small>
                </div>
              </div>
            )}
          </div>

          {/* SOLUTIONS */}
          <div className="mobile-nav-group">
            <button
              type="button"
              className="mobile-nav-trigger"
              onClick={() =>
                toggleMenu("mobile-solutions")
              }
              aria-expanded={
                openMenu === "mobile-solutions"
              }
            >
              <span>Solutions</span>
              <span>
                {openMenu === "mobile-solutions"
                  ? "−"
                  : "+"}
              </span>
            </button>

            {openMenu === "mobile-solutions" && (
              <div className="mobile-submenu">
                <Link
                  to="/services#business-websites"
                  onClick={closeMobileMenu}
                >
                  Business Websites
                </Link>

                <Link
                  to="/services#business-software"
                  onClick={closeMobileMenu}
                >
                  Business Software
                </Link>

                <Link
                  to="/services#app-builder"
                  onClick={closeMobileMenu}
                >
                  App Builder
                </Link>

                <Link
                  to="/services#custom-digital-solutions"
                  onClick={closeMobileMenu}
                >
                  Custom Digital Solutions
                </Link>
              </div>
            )}
          </div>

          {/* RESOURCES */}
          <div className="mobile-nav-group">
            <button
              type="button"
              className="mobile-nav-trigger"
              onClick={() =>
                toggleMenu("mobile-resources")
              }
              aria-expanded={
                openMenu === "mobile-resources"
              }
            >
              <span>Resources</span>
              <span>
                {openMenu === "mobile-resources"
                  ? "−"
                  : "+"}
              </span>
            </button>

            {openMenu === "mobile-resources" && (
              <div className="mobile-submenu">
                <Link
                  to="/#announcements"
                  onClick={closeMobileMenu}
                >
                  What's New
                </Link>

                <Link
                  to="/studio"
                  onClick={closeMobileMenu}
                >
                  Projects
                </Link>

                <Link
                  to="/about"
                  onClick={closeMobileMenu}
                >
                  About Noorado
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;