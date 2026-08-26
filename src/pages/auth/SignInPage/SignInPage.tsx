import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignInPage.css";

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
    const torque = -STIFFNESS * s.angle - DAMPING * s.velocity;
    s.velocity += torque * dt;
    s.angle += s.velocity * dt;
    el.style.transform = `rotate(${s.angle}deg)`;

    if (Math.abs(s.angle) > 0.05 || Math.abs(s.velocity) > 0.05) {
      s.raf = requestAnimationFrame(() => step(i));
    } else {
      s.angle = 0;
      s.velocity = 0;
      el.style.transform = `rotate(0deg)`;
    }
  };

  const kick = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    const s = state.current[i];
    const rect = boardRefs.current[i]?.getBoundingClientRect();
    if (!rect) return;

    const now = performance.now();
    const x = e.clientX;
    const dt = Math.max(now - s.lastT, 1);
    const vx = s.lastT ? ((x - s.lastX) / dt) * 16 : 0;
    s.lastX = x;
    s.lastT = now;

    const offset = (x - (rect.left + rect.width / 2)) / (rect.width / 2);
    s.velocity += vx * 1.4 + offset * 6;

    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(() => step(i));
  };

  useEffect(() => {
    const animations = state.current;
    return () => animations.forEach((s) => cancelAnimationFrame(s.raf));
  }, []);

  return { boardRefs, kick };
}

function SignInPage() {
  const { boardRefs, kick } = useSwingPhysics(TAGS.length);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  return (
    <main className="signin-page">

      {/* Left Brand Section */}
      <section className="signin-brand">

        <div className="brand-content">

          <div className="brand-logo">
            Noorado
          </div>

          <div className="brand-line" />

          <h2>
            Digital solutions
            <br />
            for modern businesses.
          </h2>

          <p className="brand-description">
            We build websites, business software, automation,
            and practical digital tools that help businesses
            work smarter.
          </p>


          {/* Hanging sign boards */}
          <div className="brand-tags">

            {TAGS.map((tag, i) => (
              <div className="hanging-sign" key={tag.num}>
                <span className="sign-nail sign-nail-top" aria-hidden="true" />
                <span className="sign-string" aria-hidden="true" />
                <div
                  className="hanging-tag"
                  ref={(el) => {
                    boardRefs.current[i] = el;
                  }}
                  onMouseEnter={(e) => kick(i, e)}
                  onMouseMove={(e) => kick(i, e)}
                >
                  <span className="sheen" />
                  <strong>{tag.label}</strong>
                </div>
              </div>
            ))}

          </div>

        </div>

      </section>


      {/* Sign In Section */}
      <section className="signin-form-section">

        <div className="signin-container">

          <div className="signin-card">

            <div className="signin-header">

              <span className="signin-label">
                NOORADO ACCOUNT
              </span>

              <h1>
                Welcome Back
              </h1>

              <p>
                Sign in to continue to your Noorado account.
              </p>

            </div>


            <form
  className="signin-form"
  onSubmit={(e) => {
    e.preventDefault();

    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }

    const savedUser = localStorage.getItem("noorado_user");

    if (!savedUser) {
      setLoginError("No account found. Please create an account first.");
      return;
    }

    let user: unknown;

    try {
      user = JSON.parse(savedUser);
    } catch {
      setLoginError("Saved account data is invalid. Please create an account again.");
      return;
    }

    if (
      typeof user !== "object" ||
      user === null ||
      !("email" in user) ||
      !("password" in user) ||
      typeof user.email !== "string" ||
      typeof user.password !== "string"
    ) {
      setLoginError("Saved account data is invalid. Please create an account again.");
      return;
    }

    if (
      email.trim().toLowerCase() !==
        user.email.trim().toLowerCase() ||
      password !== user.password
    ) {
      setLoginError("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      "noorado_logged_in",
      "true"
    );

    navigate("/dashboard");
  }}
>

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

<div className="form-group">

  <label htmlFor="password">
    Password
  </label>

  <div className="password-input-wrapper">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword((previous) => !previous)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10.6 6.2C11.05 6.07 11.52 6 12 6c6 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3.2 3.55M6.4 8.1C4.05 9.45 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.52" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  </div>

</div>


              <div className="signin-options">

                <label className="remember-me">

                  <input type="checkbox" />

                  <span>
                    Remember me
                  </span>

                </label>


                <Link to="/forgot-password">
                  Forgot Password?
                </Link>

              </div>


              {loginError && (
                <p className="signin-error">
                  {loginError}
                </p>
              )}


              <button
  type="submit"
  className="signin-button"
>
  Sign In
</button>

            </form>


            <div className="signin-footer">

              <p>
                Don't have an account?{" "}

                <Link to="/signup">
                  Create Account
                </Link>
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


export default SignInPage;
