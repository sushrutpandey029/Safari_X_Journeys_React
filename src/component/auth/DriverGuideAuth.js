import React, { useState, useEffect } from "react";
import "../home/Home.css";
import { driverGuideLogin } from "../services/authService";
import { Modal } from "react-bootstrap";
import { saveUserData } from "../utils/storage";

const DriverGuideAuth = ({ show, onClose, setShowDriverGuideLogin }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "driver",
  });

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await driverGuideLogin(formData);

      if (response.success === true) {
        if (response.user.role === "guide") {
          saveUserData("guide", response.user);
          saveUserData("guide_token", response.token);
          saveUserData("guide_refreshtoken", response.refreshToken);
        } else if (response.user.role === "driver") {
          saveUserData("driver", response.user);
          saveUserData("driver_token", response.token);
          saveUserData("driver_refreshtoken", response.refreshToken);
        }

        setShowDriverGuideLogin(false);
        alert(response.message);
        console.log("response in driver or guide login", response);
      }
    } catch (err) {
      alert(err.response?.data?.message);
      console.log("err in driver or guide login", err.response);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => setShowDriverGuideLogin(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      {/* Modal Header */}
      <Modal.Header closeButton>
        <Modal.Title>Log in</Modal.Title>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body>
        <>
          {/* Role Selector */}
          <div className="mb-3">
            <label className="form-label d-block">Select Role</label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn ${
                  formData.role === "driver"
                    ? "btn-primary text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    role: "driver",
                  }))
                }
              >
                Driver
              </button>
              <button
                type="button"
                className={`btn ${
                  formData.role === "guide"
                    ? "btn-primary text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    role: "guide",
                  }))
                }
              >
                Guide
              </button>
            </div>
          </div>

          {/* Info text */}
          <p className="text-center text-muted mb-3">
            Check out more easily and access your tickets on any device with
            your <strong>SafariX</strong> account.
          </p>

          {/* Social login buttons */}
          <div className="d-flex justify-content-between gap-2 mb-3">
            <button className="btn btn-outline-secondary w-100">
              <i className="bi bi-google me-2"></i>
            </button>
            <button className="btn btn-outline-secondary w-100">
              <i className="bi bi-apple me-2"></i>
            </button>
            <button className="btn btn-outline-secondary w-100">
              <i className="bi bi-facebook me-2"></i>
            </button>
          </div>

          {/* Email */}
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="position-absolute"
              style={{
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i
                className={`bi ${
                  showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                }`}
              ></i>
            </span>
          </div>

          {/* Continue Button */}
          <div className="mb-3">
            <button
              className={`explore-btn ${
                isValidEmail(formData.email)
                  ? "btn-primary text-white"
                  : "btn-light text-muted"
              }`}
              disabled={!isValidEmail(formData.email)}
              onClick={() => handleLogin()}
            >
              Continue
            </button>
          </div>
        </>
      </Modal.Body>

      {/* <Modal.Body>
        <>
          <p className="text-center text-muted mb-3">
            Check out more easily and access your tickets on any device with
            your <strong>SafariX</strong> account.
          </p>

          <div className="d-flex justify-content-between gap-2 mb-3">
            <button className="btn btn-outline-secondary w-100">
              <i className="bi bi-google me-2"></i>
            </button>
            <button className="btn btn-outline-secondary w-100">
              <i className="bi bi-apple me-2"></i>
            </button>
            <button className="btn btn-outline-secondary w-100">
              <i className="bi bi-facebook me-2"></i>
            </button>
          </div>

         

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              placeholder="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="position-absolute"
              style={{
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i
                className={`bi ${
                  showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                }`}
              ></i>
            </span>
          </div>

          <div className="mb-3">
            <button
              className={`explore-btn ${
                isValidEmail(formData.email)
                  ? "btn-primary text-white"
                  : "btn-light text-muted"
              }`}
              disabled={!isValidEmail(formData.email)}
              onClick={() => handleLogin()}
            >
              Continue
            </button>
          </div>
        </>
      </Modal.Body> */}

      {/* Modal Footer */}
      <Modal.Footer className="flex-column">
        <p className="text-center small text-muted mb-0">
          By signing in or creating an account, you accept our{" "}
          <a href="#">
            <strong className="fs-6">Terms and Conditions</strong>
          </a>{" "}
          and{" "}
          <a href="#">
            <strong className="fs-6">Privacy Policy</strong>
          </a>
          .
        </p>
      </Modal.Footer>
    </Modal>
  );
};

export default DriverGuideAuth;
