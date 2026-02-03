import React, { useState, useEffect } from "react";
import "../home/Home.css";
import { registerOrLogin, userResendOtp } from "../services/authService";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { Modal } from "react-bootstrap";
import { saveToken, saveUserData } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { userVerifyEmailOtp } from "../services/authService";

function AuthModal({ show, onClose, setShowUserLogin }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(120); // 2 minutes
  const [resending, setResending] = useState(false);

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
    try {
      setLoading(true);
      const payload = { emailid: formData.emailid };
      const response = await registerOrLogin(payload);
      console.log("identifire response", response);
      if (response.data.status === "otp_required") {
        setStep(4);
        return;
      }
    } catch (err) {
      console.log("error n identifire",err)
      console.log("err in handleIdentifierSubmit", err.response);
      if (err?.response?.data?.userExists === true) {
        setStep(2);
      } else if (err?.response?.data?.userExists === false) {
        setStep(3);
      } else {
        console.log("error in user login or register");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const payload = {
        emailid: formData.emailid,
        password: formData.password,
      };
      const response = await registerOrLogin(payload);

      if (response.data.status === "otp_required") {
        setStep(4);
        return;
      }
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
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await registerOrLogin(formData);

      if (response?.data?.status === "otp_required") {
        setMessage(response.data.message);
        setStep(4);
      }
    } catch (err) {
      alert(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      setLoading(true);
      const payload = {
        emailid: formData.emailid,
        otp: emailOtp,
        // password: formData.password,
      };
      console.log("payload before senign api", payload);
      const res = await userVerifyEmailOtp(payload);

      if (res.data.status === true) {
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
        saveUserInfo(res);
        setShowUserLogin(false);
      }
    } catch (err) {
      console.log("error in verify otp", err.response);
      alert(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      await userResendOtp({ emailid: formData.emailid });

      setResendTimer(120); // reset timer
      alert("OTP resent successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const saveUserInfo = (response) => {
    const now = Date.now();
    saveUserData("safarix_user", response.data.user);
    // saveUserData("safarix_token", response.data.token);
    // saveUserData("safarix_refreshtoken", response.data.refreshToken);
    saveToken("safarix_token", response.data.token);
    saveToken("safarix_refreshtoken", response.data.refreshToken);

    // ✅ ADD THIS
    saveUserData("safarix_login_time", now);
    navigate("/user-dashboard");
  };

  useEffect(() => {
    if (step === 4) {
      setResendTimer(120);

      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step]);

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
          {step === 4 && <Modal.Title>Verify OTP</Modal.Title>}
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
                  disabled={!isValidEmail(formData.emailid) || loading}
                  onClick={() => handleIdentifierSubmit()}
                >
                  {loading ? "processing..." : "Continue with email"}
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
                  disabled={!formData.password || loading}
                  onClick={() => handleLogin()}
                >
                  {loading ? "processing..." : "Login"}
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
                  {loading ? "processing..." : "Create an account"}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h5 className="text-center mb-2">Verify your email</h5>
              <p className="text-muted text-center">
                {message
                  ? `${message}`
                  : `We’ve sent a verification code to ${formData.emailid}`}
              </p>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter 6-digit OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
              />

              <button
                className={`explore-btn ${
                  emailOtp.length === 6
                    ? "btn-primary text-white"
                    : "btn-light text-muted"
                }`}
                disabled={emailOtp.length !== 6}
                onClick={verifyEmailOtp}
              >
                {loading ? "processing..." : "Verify"}
              </button>

              {/* 🔁 Resend OTP */}
              <div className="text-center mt-3">
                {resendTimer > 0 ? (
                  <small className="text-muted">
                    Resend OTP in {Math.floor(resendTimer / 60)}:
                    {String(resendTimer % 60).padStart(2, "0")}
                  </small>
                ) : (
                  <button
                    className="btn btn-link p-0"
                    disabled={resending}
                    onClick={handleResendOtp}
                  >
                    {resending ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </>
          )}
        </Modal.Body>

        {/* Modal Footer */}
        <Modal.Footer className="flex-column">
          <p className="text-center small text-muted mb-0">
            By signing in or creating an account, you accept our{" "}
            <a href="/terms-conditions">
              <strong className="fs-6">Terms and Conditions</strong>
            </a>
            and
            <a href="/privacy-policy">
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
