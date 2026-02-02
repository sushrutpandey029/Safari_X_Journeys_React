import React, { useState } from "react";
import "../home/Home.css";
import { guideLogin } from "../services/guideService";
import { Modal } from "react-bootstrap";
import { saveUserData } from "../utils/storage";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const GuideAuth = ({ show, onClose, setShowGuideLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await guideLogin(formData);

      if (response.success === true) {
        dispatch(
          loginSuccess({
            user: response.user,
            token: response.token,
          })
        );

        saveUserData("guide", response.user);
        saveUserData("guide_token", response.token);
        saveUserData("guide_refreshtoken", response.refreshToken);

        saveUserData("guide_login_time", Date.now());

        navigate("/guide-dashboard");
        setShowGuideLogin(false);
      }
    } catch (err) {
      console.error("Error in guide login", err.response);
      alert(err?.response?.data?.message || "Login Failed, please try again.");
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => setShowGuideLogin(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      {/* Modal Header */}
      <Modal.Header closeButton>
        <Modal.Title>Guide Login</Modal.Title>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body>
        <>
          <p className="text-center text-muted mb-3">
            Plan your trip, manage bookings, and access everything with
            <strong> Safarix</strong>
          </p>

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
              onClick={handleLogin}
            >
              Continue
            </button>
          </div>
        </>
      </Modal.Body>

      {/* Modal Footer */}
      <Modal.Footer className="flex-column">
        <p className="text-center small text-muted mb-0">
          By signing in, you accept our{" "}
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

export default GuideAuth;
