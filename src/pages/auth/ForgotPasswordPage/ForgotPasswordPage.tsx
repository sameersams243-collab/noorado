import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import "./ForgotPasswordPage.css";

const TAGS = [
  { num: "01", label: "WEB DEVELOPMENT" },
  { num: "02", label: "BUSINESS SOFTWARE" },
  { num: "03", label: "EXCEL AUTOMATION" },
  { num: "04", label: "DIGITAL TOOLS" },
];

const STIFFNESS = 90;
const DAMPING = 6;

function useSwingPhysics(count: number) {
  const boardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const state = useRef(
    Array.from({ length: count }, () => ({
      angle: 0,
      velocity: 0,
      raf: 0,
      lastX: 0,
      lastT: 0,
    }))
  );

  const step = (i: number) => {
    const s = state.current[i];
    const el = boardRefs.current[i];

    if (!el) return;

    const dt = 1 / 60;

    const torque =
      -STIFFNESS * s.angle -
      DAMPING * s.velocity;

    s.velocity += torque * dt;
    s.angle += s.velocity * dt;

    el.style.transform = `rotate(${s.angle}deg)`;

    if (
      Math.abs(s.angle) > 0.05 ||
      Math.abs(s.velocity) > 0.05
    ) {
      s.raf = requestAnimationFrame(() => step(i));
    } else {
      s.angle = 0;
      s.velocity = 0;
      el.style.transform = "rotate(0deg)";
    }
  };

  const kick = (
    i: number,
    e: MouseEvent<HTMLDivElement>
  ) => {
    const s = state.current[i];

    const rect =
      boardRefs.current[i]?.getBoundingClientRect();

    if (!rect) return;

    const now = performance.now();
    const x = e.clientX;

    const dt = Math.max(now - s.lastT, 1);

    const vx = s.lastT
      ? ((x - s.lastX) / dt) * 16
      : 0;

    s.lastX = x;
    s.lastT = now;

    const offset =
      (x - (rect.left + rect.width / 2)) /
      (rect.width / 2);

    s.velocity += vx * 1.4 + offset * 6;

    cancelAnimationFrame(s.raf);

    s.raf = requestAnimationFrame(
      () => step(i)
    );
  };

  useEffect(() => {
    const animations = state.current;

    return () => {
      animations.forEach((s) =>
        cancelAnimationFrame(s.raf)
      );
    };
  }, []);

  return { boardRefs, kick };
}

function ForgotPasswordPage() {
  const { boardRefs, kick } =
    useSwingPhysics(TAGS.length);

  return (
    <main className="forgot-page">

      {/* LEFT BRAND SECTION */}

      <section className="forgot-brand">

        <div className="forgot-brand-content">

          <div className="forgot-brand-logo">
            Noorado
          </div>

          <div className="forgot-brand-line" />

          <h2>
            Digital solutions
            <br />
            for modern businesses.
          </h2>

          <p className="forgot-brand-description">
            We build websites, business software,
            automation, and practical digital tools
            that help businesses work smarter.
          </p>


          {/* HANGING TAGS */}

          <div className="forgot-tags">

            {TAGS.map((tag, i) => (

              <div
                className="forgot-hanging-sign"
                key={tag.num}
              >

                <span
                  className="forgot-sign-nail"
                  aria-hidden="true"
                />

                <span
                  className="forgot-sign-string"
                  aria-hidden="true"
                />

                <div
                  className="forgot-hanging-tag"
                  ref={(el) => {
                    boardRefs.current[i] = el;
                  }}
                  onMouseEnter={(e) => kick(i, e)}
                  onMouseMove={(e) => kick(i, e)}
                >

                  <span
                    className="forgot-sheen"
                    aria-hidden="true"
                  />

                  <strong>
                    {tag.label}
                  </strong>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* FORGOT PASSWORD SECTION */}

      <section className="forgot-form-section">

        <div className="forgot-container">

          <div className="forgot-card">

            <div className="forgot-header">

              <span className="forgot-label">
                ACCOUNT RECOVERY
              </span>

              <h1>
                Forgot Password?
              </h1>

              <p>
                Enter your email address and we'll
                help you reset your password.
              </p>

            </div>


            <form className="forgot-form">

              <div className="forgot-form-group">

                <label htmlFor="forgot-email">
                  Email Address
                </label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                />

              </div>


              <button
                type="submit"
                className="forgot-button"
              >
                Send Reset Link
              </button>

            </form>


            <div className="forgot-footer">

              <p>
                Remember your password?{" "}

                <Link to="/signin">
                  Sign In
                </Link>
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default ForgotPasswordPage;
