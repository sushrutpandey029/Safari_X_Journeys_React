import React, { useState } from "react";
import "../home/Home.css";
import { registerOrLogin } from "../services/authService";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { Modal } from "react-bootstrap";
import { saveUserData } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function AuthModal({ show, onClose, setShowUserLogin }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailid: "",
    phonenumber: "",
    fullname: "",
    password: "",
  });

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailid);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeButton = () => {
    setFormData({ ...formData, fullname: "", phonenumber: "", password: "" });
    setStep(1);
  };

  const handleIdentifierSubmit = async () => {
    const payload = { emailid: formData.emailid };
    try {
      const response = await registerOrLogin(payload);
      console.log("identifire response", response);
    } catch (err) {
      console.log("err in handleIdentifierSubmit", err.response);
      if (err.response.data.userExists === true) {
        setStep(2);
      } else if (err.response.data.userExists === false) {
        setStep(3);
      } else {
        console.log("error in user login or register");
      }
    }
  };

  const handleLogin = async () => {
    const payload = {
      emailid: formData.emailid,
      password: formData.password,
    };
    try {
      const response = await registerOrLogin(payload);
      if (response.data.status === true) {
        dispatch(
          loginSuccess({ user: response.data.user, token: response.data.token })
        );
        saveUserInfo(response);
        setShowUserLogin(false);
      }
    } catch (err) {
      alert(err.response.data.message);
      console.log("err in login", err.response);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await registerOrLogin(formData);

      if (response.data.status === true) {
        console.log("response in register", response);
        saveUserInfo(response);
        setShowUserLogin(false);
        alert(response.data.message);
        window.location.reload(true);
      }
    } catch (err) {
      alert(err.response.data.message);
      console.log("err in register", err.response);
    }
  };

  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);
      console.log("decoded data", decoded);

      const payload = {
        emailid: decoded.email,
        fullname: decoded.name,
        uuid: decoded.sub,
      };

      const response = await registerOrLogin(payload);
      if (response.data.status === true) {
        dispatch(
          loginSuccess({ user: response.data.user, token: response.data.token })
        );
        saveUserInfo(response);
        setShowUserLogin(false);
      }
    } catch (err) {
      console.log("error in login with google", err.response);
    }
  };

  const saveUserInfo = (response) => {
    saveUserData("safarix_user", JSON.stringify(response.data.user));
    saveUserData("safarix_token", response.data.token);
    saveUserData("safarix_refreshtoken", response.data.refreshToken);
    navigate("/user-dashboard");
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => setShowUserLogin(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        {/* Modal Header */}
        <Modal.Header closeButton>
          {step === 1 && <Modal.Title>Login or Signup</Modal.Title>}
          {step === 2 && <Modal.Title>Login</Modal.Title>}
          {step === 3 && <Modal.Title>Create an account</Modal.Title>}
        </Modal.Header>

        {/* Modal Body */}
        <Modal.Body>
          {step === 1 && (
            <>
              <p className="text-center text-muted mb-3">
                Plan your trip, book your tickets, and access everything with  
                 <strong> SafariX</strong>
              </p>

            {/* social logins */}
              {/* <div className="d-flex justify-content-between gap-2 mb-3">
                <GoogleOAuthProvider clientId="625734741238-62mdgmg6rrsuvgbef8vpq59p4gh9uli9.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => console.log("Google login failed")}
                    useOneTap
                    width="100%"
                    shape="pill"
                    text="continue_with"
                  />
                </GoogleOAuthProvider>

                <button className="btn btn-outline-secondary w-100">
                  <i className="bi bi-apple me-2"></i>
                </button>
                <button className="btn btn-outline-secondary w-100">
                  <i className="bi bi-facebook me-2"></i>
                </button>
              </div> */}

              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email address"
                  name="emailid"
                  value={formData.emailid}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <button
                  className={`explore-btn ${
                    isValidEmail(formData.emailid)
                      ? "btn-primary text-white"
                      : "btn-light text-muted"
                  }`}
                  disabled={!isValidEmail(formData.emailid)}
                  onClick={() => handleIdentifierSubmit()}
                >
                  Continue with email
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-2">
                <div className="fw-bold">{formData.emailid}</div>
                <button
                  className="btn btn-link p-0 text-primary fw-bold"
                  onClick={() => handleChangeButton()}
                >
                  Change
                </button>
              </div>

              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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
                    formData.password
                      ? "btn-primary text-white"
                      : "btn-light text-muted"
                  }`}
                  disabled={!formData.password}
                  onClick={() => handleLogin()}
                >
                  Login
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-2">
                <div className="fw-bold">{formData.emailid}</div>
                <button
                  className="btn btn-link p-0 text-primary fw-bold"
                  onClick={() => handleChangeButton()}
                >
                  Change
                </button>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full name"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone number"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3 position-relative">
                <input
                  type="password"
                  className="form-control pe-5"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="position-absolute"
                  style={{
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  👁️
                </span>
              </div>

              <div className="mb-3">
                <button
                  className={`explore-btn ${
                    formData.fullname &&
                    formData.password &&
                    formData.phonenumber
                      ? "btn-primary text-white"
                      : "btn-light text-muted"
                  }`}
                  disabled={
                    !formData.fullname ||
                    !formData.password ||
                    !formData.phonenumber
                  }
                  onClick={() => handleRegister()}
                >
                  Create an account
                </button>
              </div>
            </>
          )}
        </Modal.Body>

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
    </>
  );
}

export default AuthModal;
