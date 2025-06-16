import React, { useState } from "react";
import "./AuthModal.css";

function AuthModal({ show, onClose }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    emailid: "",
    phonenumber: "",
    fullname: "",
    password: "",
  });

  const [userExists, setUserExists] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content"></div>
      <button onClick={onClose}>X</button>
      {step === 1 && (
        <div>
          <label>Email address</label>
          <input
            type="text"
            name="emailid"
            value={formData.emailid}
            onChange={handleChange}
          />
          <button onClick={""}>Continue</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} />
            onChange={handleChange}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Create an account</h3>
          {formData.emailid}
          <button>change</button>

          <div>
            <label>Full name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              type="number"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthModal;
