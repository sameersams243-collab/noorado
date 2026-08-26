import { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
const [message, setMessage] = useState("");

  return (
    <section id="contact" className="contact">
      <h2>Contact Us</h2>

     <form
  className="contact-form"
  onSubmit={(e) => {
  e.preventDefault();

  console.log({
    name,
    email,
    message,
  });

  alert(`Thanks ${name}! Your message has been received.`);
}}
>

       <input
  type="text"
  placeholder="Your Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          placeholder="Your Message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button type="submit">
          Send Message
        </button>

      </form>
    </section>
  );
}

export default Contact;