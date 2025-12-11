import React, { useState, useEffect } from "react";
import { newsLaterSubmit } from "../services/commonService";

const NewsLater = () => {
  const [formData, setFormdata] = useState({
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const resp = await newsLaterSubmit(formData);

      alert(resp?.message || "Subscribed successfully.");
      setFormdata({ email: "" });
    } catch (err) {
      console.log("err in news later submit", err.response);
      alert(
        err.response?.data?.message ||
        "error in filling form, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-modern">
      <div className="container">
        <div className="newsletter-center-card">

          <h2 className="newsletter-title">
            Subscribe Our <span>Newsletter</span>
          </h2>

          <p className="newsletter-subtext">
            Subscribe and get exclusive travel offers, updates & deals.
          </p>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Enter your email"
              onChange={handleChange}
              className="newsletter-field"
            />

            <button
              type="submit"
              className="newsletter-btn"
              disabled={loading}
            >
              {loading ? "Sending..." : "Subscribe"}
            </button>
          </form>

        </div>
      </div>
    </div>

  );
};

export default NewsLater;
