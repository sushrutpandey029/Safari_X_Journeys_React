import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { contactUs } from "../../services/commonService";
import HomeBanner from "../../home/HomeBanner";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phonenumber: "",
    message: "",
    email: "",
    place: "",
  });
  const [isActive, setIsActive] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsActive(true);
      const res = await contactUs(formData);
      console.log("API response:", res);

      if (res.success === true) {
        alert(`${res.message}.` || "Your message was sent successfully!");
        setFormData({
          firstname: "",
          lastname: "",
          phonenumber: "",
          message: "",
          email: "",
          place: "",
        });
      } else {
        alert(" Failed to send message: " + (res.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error.response);
      alert(
        error.response.data.message ||
          "Something went wrong while sending the message."
      );
    } finally {
      setIsActive(false);
    }
  };

  return (
    <div className="contact">
        
      <HomeBanner />

      <div className="container py-5">
        <div className="row">
          {/* Left Contact Info */}
          <div className="col-md-6 mb-4">
            <h2>
              Contact Us <span className="text-primary">Easily</span>
            </h2>
            <p className="text-muted">
              We are here to help you. Reach out with any questions or concerns.
            </p>
            <div className="mb-3">
              <i className="bi bi-telephone text-primary"></i>{" "}
              <strong>9821373111</strong>
              <p className="text-muted mb-0">Monday To Friday 09:00 - 20:00</p>
              <p className="text-muted">Sunday 09:00 - 17:00</p>
            </div>
            <div className="mb-3">
              <i className="bi bi-envelope text-primary"></i>{" "}
              <strong>info@safariX.com</strong>
            </div>
            <div className="mb-3">
              <i className="bi bi-envelope text-primary"></i>{" "}
              <strong>no-reply@safarixjourneys.com</strong>
            </div>
            <div>
              <h5>Safari X</h5>
              <p className="text-muted">
                <i className="bi bi-geo-alt text-primary"></i> Lorem ipsum dolor
                sit amet consectetur.
              </p>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="col-md-6">
            <div className="p-4 border rounded shadow-sm">
              <h4 className="fw-bold">Do You Have Any Questions?</h4>
              <p className="text-muted">Please complete the form below.</p>

              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="First Name"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Last Name"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Phone Number"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email Id"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Place and Street"
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Question / Comment"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="explore-btn"
                  disabled={isActive}
                >
                  {isActive ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
