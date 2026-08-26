import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUpPage.css";

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

function SignUpPage() {
  const { boardRefs, kick } =
    useSwingPhysics(TAGS.length);

  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const isPasswordStrong =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

 
     const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setPasswordError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName) {
      setPasswordError("Please enter your full name.");
      return;
    }

    if (!normalizedEmail) {
      setPasswordError("Please enter your email address.");
      return;
    }

    if (!isPasswordStrong) {
      setPasswordError(
        "Please create a stronger password using all the requirements below."
      );
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    const savedUsers = localStorage.getItem("noorado_users");

    let users: Array<{
      name: string;
      email: string;
      password: string;
    }> = [];

    if (savedUsers) {
      try {
        const parsedUsers: unknown = JSON.parse(savedUsers);

        if (Array.isArray(parsedUsers)) {
          users = parsedUsers.filter(
            (
              user
            ): user is {
              name: string;
              email: string;
              password: string;
            } =>
              typeof user === "object" &&
              user !== null &&
              "name" in user &&
              "email" in user &&
              "password" in user &&
              typeof user.name === "string" &&
              typeof user.email === "string" &&
              typeof user.password === "string"
          );
        }
      } catch {
        users = [];
      }
    }

    const emailAlreadyExists = users.some(
      (user) =>
        user.email.trim().toLowerCase() === normalizedEmail
    );

    if (emailAlreadyExists) {
      setPasswordError(
        "An account with this email already exists."
      );
      return;
    }

    const newUser = {
      name: normalizedName,
      email: normalizedEmail,
      password,
    };

    users.push(newUser);

    localStorage.setItem(
      "noorado_users",
      JSON.stringify(users)
    );

    localStorage.setItem(
      "noorado_user",
      JSON.stringify(newUser)
    );

    localStorage.setItem(
      "noorado_logged_in",
      "true"
    );

    navigate("/dashboard");
  };

  return (
    <main className="signup-page">

      {/* LEFT BRAND SECTION */}

      <section className="signup-brand">

        <div className="signup-brand-content">

          <div className="signup-brand-logo">
            Noorado
          </div>

          <div className="signup-brand-line" />

          <h2>
            Digital solutions
            <br />
            for modern businesses.
          </h2>

          <p className="signup-brand-description">
            We build websites, business software,
            automation, and practical digital tools
            that help businesses work smarter.
          </p>

          {/* HANGING TAGS */}

          <div className="signup-tags">

            {TAGS.map((tag, i) => (

              <div
                className="signup-hanging-sign"
                key={tag.num}
              >

                <span
                  className="signup-sign-nail"
                  aria-hidden="true"
                />

                <span
                  className="signup-sign-string"
                  aria-hidden="true"
                />

                <div
                  className="signup-hanging-tag"
                  ref={(el) => {
                    boardRefs.current[i] = el;
                  }}
                  onMouseEnter={(e) =>
                    kick(i, e)
                  }
                  onMouseMove={(e) =>
                    kick(i, e)
                  }
                >

                  <span
                    className="signup-sheen"
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


      {/* SIGN UP SECTION */}

      <section className="signup-form-section">

        <div className="signup-container">

          <div className="signup-card">

            <div className="signup-header">

              <span className="signup-label">
                CREATE ACCOUNT
              </span>

              <h1>
                Join Noorado
              </h1>

              <p>
                Create your account to get started.
              </p>

            </div>


            <form
              className="signup-form"
              onSubmit={handleSubmit}
            >

              {/* FULL NAME */}

              <div className="signup-form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="signup-form-group">

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


              {/* PASSWORD */}

              <div className="signup-form-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="signup-password-input-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (

                      /* EYE */

                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >

                        <path
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                      </svg>

                    ) : (

                      /* EYE SLASH */

                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >

                        <path
                          d="M3 3l18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 6.2C11.05 6.07 11.52 6 12 6c6 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3.2 3.55"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M6.4 8.1C4.05 9.45 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                      </svg>

                    )}

                  </button>

                </div>


                {/* PASSWORD REQUIREMENTS */}

                <div className="password-requirements">

                  <p
                    className={
                      password.length >= 8
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ At least 8 characters
                  </p>

                  <p
                    className={
                      /[A-Z]/.test(password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One uppercase letter
                  </p>

                  <p
                    className={
                      /[a-z]/.test(password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One lowercase letter
                  </p>

                  <p
                    className={
                      /[0-9]/.test(password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One number
                  </p>

                  <p
                    className={
                      /[^A-Za-z0-9]/.test(password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One special character
                  </p>

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="signup-form-group">

                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div className="signup-password-input-wrapper">

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >

                    {showConfirmPassword ? (

                      /* EYE */

                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >

                        <path
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                      </svg>

                    ) : (

                      /* EYE SLASH */

                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >

                        <path
                          d="M3 3l18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 6.2C11.05 6.07 11.52 6 12 6c6 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3.2 3.55"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M6.4 8.1C4.05 9.45 2.5 12 2.5 12s3.5 6 9.5 6c6 0 9.5-6 9.5-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                      </svg>

                    )}

                  </button>

                </div>


                {/* MATCH STATUS */}

                {confirmPassword.length > 0 && (
                  <p
                    className={
                      passwordsMatch
                        ? "password-match valid"
                        : "password-match"
                    }
                  >
                    {passwordsMatch
                      ? "✓ Passwords match"
                      : "✕ Passwords do not match"}
                  </p>
                )}

              </div>


              {/* ERROR */}

              {passwordError && (
                <p className="signup-password-error">
                  {passwordError}
                </p>
              )}


              {/* CREATE ACCOUNT */}

              <button
                type="submit"
                className="signup-button"
              >
                Create Account
              </button>

            </form>


            <div className="signup-footer">

              <p>
                Already have an account?{" "}

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

export default SignUpPage;
