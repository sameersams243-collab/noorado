import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({
      name,
      email,
      message,
    });

    setSubmitted(true);

    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-container">

        {/* HEADER */}
        <div className="contact-heading">
          <span className="contact-label">
            GET IN TOUCH
          </span>

          <h2>
            Let's build something
            <br />
            useful together.
          </h2>

          <p>
            Have an idea, a business requirement, or a project
            in mind? Tell us what you need and we'll get back to you.
          </p>
        </div>


        {/* FORM */}
        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >
          <div className="contact-field">
            <label htmlFor="contact-name">
              Name
            </label>

            <input
              id="contact-name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>


          <div className="contact-field">
            <label htmlFor="contact-email">
              Email
            </label>

            <input
              id="contact-email"
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>


          <div className="contact-field">
            <label htmlFor="contact-message">
              Message
            </label>

            <textarea
              id="contact-message"
              placeholder="Tell us what you need..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>


          <button
            type="submit"
            className="contact-button"
          >
            Send Message →
          </button>


          {submitted && (
            <p className="contact-success">
              Thanks {name || "for reaching out"}! Your message
              has been received.
            </p>
          )}

        </form>

      </div>
    </section>
  );
}

export default Contact;