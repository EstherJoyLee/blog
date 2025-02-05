"use client";

import React, { useState } from "react";
import emailjs from "emailjs-com";

const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emailData = {
      to_name: "PinkRabbit",
      ...formData,
    };

    alert(JSON.stringify(process.env));

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID, // EmailJS 대시보드에서 확인한 Service ID
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, // EmailJs 대시보드에서 확인한 Template ID
        emailData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY // EmailJS 대시보드에서 확인한 Public Key
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          alert("이메일이 성공적으로 전송되었습니다.");
          setFormData({
            from_name: "",
            email: "",
            message: "",
          });
          setIsLoading(false);
        },
        (error) => {
          console.log("FAILED...", error);
          alert("이메일 전송에 실패했습니다.");
          setIsLoading(false);
        }
      );
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="from_name"
            value={formData.from_name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email"
            required
          />
        </div>
        <div>
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your message"
          />
        </div>
        <button type="submit">Send</button>
      </form>
    </>
  );
};

export default ContactForm;
