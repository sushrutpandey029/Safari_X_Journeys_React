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
    <div className="newslater">
      <div className="container my-5">
        <div className="row  rounded-4 overflow-hidden ">
          {/* Left Image Section */}
          <div className="col-md-6 p-0">
            <img
              src="/images/banner.jpeg"
              alt="Travel"
              className="img-fluid h-100 w-100 object-cover"
            />
          </div>

          {/* Right Content Section */}
          <div className="col-md-6 d-flex newsletter-box flex-column justify-content-center align-items-start p-4">
            <h3 className="fw-bold mb-2">
              Your <span className="text-primary">Travel Journey</span> Starts
              Here
            </h3>
            <p className="mb-3">Sign Up And We'll Send The Best Deals To You</p>

            <form>
              <input
                name="email"
                type="email"
                value={formData.email}
                placeholder="Your Email"
                className="form-control me-2 rounded-pill"
                onChange={handleChange}
              />
              <button
                className="explore-btn"
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLater;
