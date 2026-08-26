import { NavLink } from "react-router-dom";
import "./ContactPage.css";

function Contact() {
  return (
    <main className="contact-page">

      {/* NAVBAR */}
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

      {/* CONTACT CONTENT */}
      <div className="contact-container">

        <section className="contact-hero">
          <span className="contact-label">
            CONTACT NOORADO
          </span>

          <h1>
            Let's Build Something
            <br />
            <span>Together.</span>
          </h1>

          <p>
            We'd love to hear from you. Have an idea, need a website,
            or looking for a digital solution for your business?
            Tell us about it.
          </p>
        </section>

        <section className="contact-content">

          {/* EMAIL */}
          <div className="contact-email-card">

            <div className="contact-email-icon">
              ✉
            </div>

            <div className="contact-email-content">

              <span className="contact-card-label">
                EMAIL US
              </span>

              <h2>
                Let's start a conversation.
              </h2>

              <p>
                Send us your requirements, questions,
                or project ideas. We'll get back to you.
              </p>

              <a
                href="mailto:nooradohub@gmail.com"
                className="contact-email-link"
              >
                nooradohub@gmail.com →
              </a>

            </div>

          </div>


          {/* FORM */}
          <div className="contact-form-card">

            <div className="contact-form-heading">

              <span>
                START A CONVERSATION
              </span>

              <h2>
                Tell us about your project
              </h2>

              <p>
                Fill in the details below and we'll help you get started.
              </p>

            </div>

            <form
              className="contact-form"
              onSubmit={(e) => {

                e.preventDefault();

                const form = e.currentTarget;

                const name = (
                  form.elements.namedItem("name") as HTMLInputElement
                ).value;

                const email = (
                  form.elements.namedItem("email") as HTMLInputElement
                ).value;

                const subject = (
                  form.elements.namedItem("subject") as HTMLInputElement
                ).value;

                const message = (
                  form.elements.namedItem("message") as HTMLTextAreaElement
                ).value;

                const body = `Name: ${name}
Email: ${email}

Message:
${message}`;

                window.location.href =
                  `mailto:nooradohub@gmail.com?subject=${encodeURIComponent(
                    subject || "New enquiry from Noorado website"
                  )}&body=${encodeURIComponent(body)}`;
              }}
            >

              <div className="contact-form-row">

                <div className="contact-field">
                  <label htmlFor="name">
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

              </div>

              <div className="contact-field">

                <label htmlFor="subject">
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help?"
                />

              </div>

              <div className="contact-field">

                <label htmlFor="message">
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Tell us about your project..."
                  required
                />

              </div>

              <button
                type="submit"
                className="contact-submit"
              >
                Send Message →
              </button>

            </form>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Contact;