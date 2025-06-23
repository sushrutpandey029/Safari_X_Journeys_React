 <div
      className="popup-container p-4 rounded shadow-sm mx-auto mt-5 bg-white"
      style={{ maxWidth: "420px" }}
    >
      <div className="d-flex justify-content-end">
        <i
          className="bi bi-x-lg"
          role="button"
          onClick={() => setShowLoginPopup(false)}
        ></i>
      </div>

      {/* Headings */}
      {step === 1 && <h5 className="text-center fw-bold">Log in or sign up</h5>}
      {step === 2 && <h5 className="text-center fw-bold">Login</h5>}
      {step === 3 && <h5 className="text-center fw-bold">Create an account</h5>}

      {/* Step 1: Email Input */}
      {step === 1 && (
        <>
          <p className="text-center text-muted mb-3">
            Check out more easily and access your tickets on any device with
            your <strong>GetYourGuide</strong> account.
          </p>

          <div className="form-check d-flex align-items-start mb-3">
            <input
              className="form-check-input mt-1"
              type="checkbox"
              id="offers"
              defaultChecked
            />
            <label className="form-check-label ms-2" htmlFor="offers">
              Send me discounts and other offers by email. Opt out any time in
              your settings
            </label>
          </div>

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
              placeholder="Email address"
              name="emailid"
              value={formData.emailid}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <button
              className={`btn w-100 ${
                isValidEmail(formData.emailid)
                  ? "btn-primary text-white"
                  : "btn-light text-muted"
              }`}
              disabled={!isValidEmail(formData.emailid)}
              onClick={() => {
                handleIdentifierSubmit();
              }}
            >
              Continue with email
            </button>
          </div>
        </>
      )}

      {/* Step 2: Log in */}
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
              type="password"
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
              }}
            >
              👁️
            </span>
          </div>

          <div className="mb-3">
            <button
              className={`btn w-100 ${
                formData.password
                  ? "btn-primary text-white"
                  : "btn-light text-muted"
              }`}
              disabled={!formData.password}
              onClick={() => {
                handleLogin();
              }}
            >
              Login
            </button>
          </div>
        </>
      )}

      {/* Step 3: Create Account */}
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
              placeholder="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="phone"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 position-relative">
            <input
              type="password"
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
              }}
            >
              👁️
            </span>
          </div>

          <div className="mb-3">
            <button
              className={`btn w-100 ${
                formData.fullname && formData.password && formData.phonenumber
                  ? "btn-primary text-white"
                  : "btn-light text-muted"
              }`}
              disabled={
                !formData.fullname ||
                !formData.password ||
                !formData.phonenumber
              }
              onClick={() => {
                handleRegister();
              }}
            >
              Create an account
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <p className="text-center small text-muted">
        By signing in or creating an account, you accept our{" "}
        <a href="#">
          <strong className="ft-400 fs-6">Terms and Conditions</strong>
        </a>{" "}
        and{" "}
        <a href="#">
          <strong className="fs-6">Privacy Policy</strong>
        </a>
        .
      </p>
    </div>