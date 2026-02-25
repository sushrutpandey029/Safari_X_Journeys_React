import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { BASE_URL } from "../services/apiEndpoints";
import "./GuideCareers.css";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";
import { toast } from "react-toastify";

const Guidedetail = () => {
  const location = useLocation();
  const { guideId } = useParams();
  const guide = location.state?.guideData;

  const userdetails = getUserData("safarix_user");
  console.log("user data in guide checkout", userdetails);

  useEffect(() => {
    if (!userdetails) {
      toast.info("Please login first, before proceed to booking.", {
        toastId: "login-warning", // prevents duplicate toast
      });
    }
  }, []);

  // Get data from previous page (GuideList)
  const prevStartDate = location.state?.startDate;
  const prevEndDate = location.state?.endDate;
  const selectedCity =
    location.state?.city ||
    `${guide?.city}, ${guide?.state}, ${guide?.country}`;

  const { startPayment } = useCashfreePayment();

  const [activeTab, setActiveTab] = useState("about");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    address: "",
    location:
      selectedCity ||
      `${guide?.city}, ${guide?.state}, ${guide?.country}` ||
      "",
  });

  // Use dates from previous page or set defaults
  const [startDate, setStartDate] = useState(
    prevStartDate ? new Date(prevStartDate).toISOString().split("T")[0] : "",
  );
  const [endDate, setEndDate] = useState(
    prevEndDate ? new Date(prevEndDate).toISOString().split("T")[0] : "",
  );

  const GUIDE_FORM_STORAGE_KEY = "guide_form_data";

  // Calculate total price based on number of days
  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return guide?.chargesPerDay || 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return (guide?.chargesPerDay || 0) * dayDiff;
  };

  const totalPrice = calculateTotalPrice();
  const numberOfDays =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 3600 * 24),
        ) + 1
      : 1;

  const handleResetGuideForm = () => {
    if (!window.confirm("Are you sure you want to reset form data?")) {
      return;
    }

    // ✅ Reset form fields
    setUserForm({
      name: "",
      phone: "",
      address: "",
      location:
        selectedCity ||
        `${guide?.city}, ${guide?.state}, ${guide?.country}` ||
        "",
    });

    // ✅ Reset dates (optional: keep or clear)
    setStartDate(
      prevStartDate ? new Date(prevStartDate).toISOString().split("T")[0] : "",
    );

    setEndDate(
      prevEndDate ? new Date(prevEndDate).toISOString().split("T")[0] : "",
    );

    // ✅ Remove localStorage
    localStorage.removeItem(GUIDE_FORM_STORAGE_KEY);

    toast.success("Form reset successfully");
  };

  // ✅ RESTORE GUIDE FORM DATA
  useEffect(() => {
    try {
      const saved = localStorage.getItem(GUIDE_FORM_STORAGE_KEY);

      if (!saved) {
        console.log("No saved guide form found");
        return;
      }

      const parsed = JSON.parse(saved);

      console.log("Restoring guide form:", parsed);

      if (parsed.userForm) {
        setUserForm((prev) => ({
          ...prev,
          ...parsed.userForm,
        }));
      }

      if (parsed.startDate) {
        setStartDate(parsed.startDate);
      }

      if (parsed.endDate) {
        setEndDate(parsed.endDate);
      }
    } catch (err) {
      console.error("Guide restore error:", err);
    }
  }, [guideId]);

  // ✅ AUTO SAVE GUIDE FORM DATA
  useEffect(() => {
    try {
      if (!userForm) return;

      const hasData = userForm.name || userForm.phone || userForm.address;

      if (!hasData) return;

      const dataToSave = {
        userForm,
        startDate,
        endDate,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(GUIDE_FORM_STORAGE_KEY, JSON.stringify(dataToSave));

      console.log("Guide form saved");
    } catch (err) {
      console.error("Guide save error:", err);
    }
  }, [userForm, startDate, endDate, GUIDE_FORM_STORAGE_KEY]);
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFormSubmit = () => {
    if (
      !userForm.name.trim() ||
      !userForm.phone.trim() ||
      !userForm.address.trim()
    ) {
      alert("Please fill all required fields in the form below");
      return false;
    }

    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return false;
    }

    console.log("User Form Data:", userForm);
    console.log(`User ${userForm.name} details submitted successfully.`);

    return true;
  };

  if (!guide) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3>Guide Not Found</h3>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline"
          >
            ← Back to Guides
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBookNow = async () => {
    if (!userdetails) {
      alert("Please login first...");
      return;
    }
    console.log("before validate");
    // First validate and submit user form
    const isFormValid = handleUserFormSubmit();
    if (!isFormValid) {
      return;
    }
    console.log("after validate");

    // If form is valid, show booking confirmation
    setShowBookingForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const bookingData = {
        userId: userdetails?.id,
        serviceType: "guide",
        vendorType: "guide",
        vendorId: guide.guideId,
        serviceDetails: {
          guideId: guide.guideId,
          guideName: guide.fullName,
          guideEmail: guide.emailAddress,
          location: userForm.location,
          chargesPerDay: guide.chargesPerDay,
          availableDays: guide.availability?.days || [],
          selectedDate: startDate,
          customerDetails: userForm,
          dateRange: {
            from: startDate,
            to: endDate,
          },
          numberOfDays: numberOfDays,
          totalAmount: totalPrice,
        },
        customerDetails: {
          fullName: userForm.name,
          email: userdetails?.emailid,
          phone: userForm.phone,
          address: userForm.address,
        },
        totalAmount: totalPrice,
        bookingDate: new Date().toISOString(),
        startDate: startDate,
        endDate: endDate,
      };

      console.log("Booking Data with User Form", bookingData);
      const result = await startPayment(bookingData);
      console.log("payment res", result);

      setShowBookingForm(false);
      localStorage.removeItem(GUIDE_FORM_STORAGE_KEY);
    } catch (err) {
      console.error(err);
      alert("Failed to send booking request. Please try again.");
    }
  };

  const handleSendMessage = () => {
    // First validate user form
    const isFormValid = handleUserFormSubmit();
    if (!isFormValid) {
      return;
    }

    alert(
      `Message sent to ${guide.fullName}! We'll contact you at ${userForm.phone} soon.`,
    );
  };

  return (
    <div className="guidedetail-container">
      <div className="container">
        {/* ================= HEADER ================= */}
        <div className="guide-header mb-4">
          <div className="row align-items-center">
            {/* Left Info */}
            <div className="col-lg-8 col-md-12">
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <div className="guide-profile-image">
                  <img
                    src={`${BASE_URL}/uploads/guides/${guide.profileImage}`}
                    alt={guide.fullName}
                    className="profile-img"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                      e.target.onerror = null;
                    }}
                  />
                </div>

                <div className="guide-basic-info">
                  <h1 className="guide-name">{guide.fullName}</h1>
                  <span>
                    📍 {guide.city}, {guide.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Info */}
            <div className="col-lg-4 col-md-12 text-lg-end mt-3 mt-lg-0">
              <h5>
                🗣️ {guide.languageProficiency?.[0]?.language || "English"}
              </h5>
              <strong>4.8 ⭐ (120 reviews)</strong>
            </div>
          </div>

          {/* Specialties */}
          <div className="row mt-3">
            <div className="col-12 d-flex flex-wrap gap-2">
              {guide.typesOfTours?.map((specialty, index) => (
                <span key={index} className="specialty-item">
                  🎯 {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Selected Date */}
          {startDate && endDate && (
            <div className="row mt-3">
              <div className="col-12">
                📅 {formatDate(startDate)} to {formatDate(endDate)} (
                {numberOfDays} days × Rs. {guide.chargesPerDay} = Rs.{" "}
                {totalPrice})
              </div>
            </div>
          )}

          {/* Selected City */}
          {selectedCity && (
            <div className="row mt-2">
              <div className="col-12">
                📍 Selected City: <strong>{selectedCity}</strong>
              </div>
            </div>
          )}
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="row">
          {/* LEFT CONTENT */}
          <div className="col-lg-8 col-md-12">
            <div className="content-area">
              {/* Tabs */}
              <div className="tabs-navigation mb-3">
                {["about", "tours", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* About */}
              {activeTab === "about" && (
                <>
                  <h4>About Me</h4>
                  <p>{guide.professionalSummary}</p>
                </>
              )}

              {/* Tours */}
              {activeTab === "tours" && (
                <ul>
                  {guide.typesOfTours?.map((tour, i) => (
                    <li key={i}>🗺️ {tour}</li>
                  ))}
                </ul>
              )}

              {/* Reviews */}
              {activeTab === "reviews" && <p>No reviews yet.</p>}

              {/* User Form */}
              <div className="user-form-section mt-4">
                {/* <h4>User Detail</h4>

                {localStorage.getItem(GUIDE_FORM_STORAGE_KEY) && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleResetGuideForm}
                  >
                    Reset Form
                  </button>
                )} */}

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4>User Detail</h4>

                  {localStorage.getItem(GUIDE_FORM_STORAGE_KEY) && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleResetGuideForm}
                    >
                      Reset Form
                    </button>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={userForm.name}
                      onChange={handleUserFormChange}
                      className="form-control"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label>Phone </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userForm.phone}
                      onChange={handleUserFormChange}
                      className="form-control"
                      placeholder="Phone Number"
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label>Address </label>
                    <textarea
                      name="address"
                      value={userForm.address}
                      onChange={handleUserFormChange}
                      className="form-control"
                      rows="3"
                      placeholder="Address"
                    />
                  </div>

                  <div className="col-12">
                    <label>Location</label>
                    <input
                      readOnly
                      className="form-control"
                      value={
                        selectedCity ||
                        `${guide.city}, ${guide.state}, ${guide.country}`
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-lg-4 col-md-12 mt-4 mt-lg-0">
            <div className="booking-sidebar">
              <div className="card mb-3">
                <div className="card-body">
                  <h5>Select Dates</h5>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control mb-2"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="card mb-3">
                <div className="card-body">
                  <p>
                    📍 {guide.city}, {guide.state}
                  </p>
                  <p>💰 Rs. {guide.chargesPerDay} / day</p>
                  {startDate && endDate && (
                    <p>
                      <b>Total: Rs. {totalPrice}</b>
                    </p>
                  )}
                </div>
              </div>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={handleBookNow}
              >
                🎯 Book Now
              </button>

              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleSendMessage}
              >
                💬 Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="booking-form-overlay">
          <div className="booking-form-container">
            <div className="booking-form-header">
              <h2>Complete Your Booking</h2>
              <button
                className="close-button"
                onClick={() => setShowBookingForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="booking-form">
              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <div className="summary-item">
                  <span>Guide:</span>
                  <span>{guide.fullName}</span>
                </div>
                <div className="summary-item">
                  <span>Date Range:</span>
                  <span>
                    {formatDate(startDate)} to {formatDate(endDate)}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Number of Days:</span>
                  <span>{numberOfDays}</span>
                </div>
                <div className="summary-item">
                  <span>Start Date:</span>
                  <span>{startDate}</span>
                </div>
                <div className="summary-item">
                  <span>End Date:</span>
                  <span>{endDate}</span>
                </div>
                <div className="summary-item">
                  <span>Selected City:</span>
                  <span>{selectedCity}</span>
                </div>
                <div className="summary-item">
                  <span>Customer:</span>
                  <span>{userForm.name}</span>
                </div>
                <div className="summary-item">
                  <span>Contact:</span>
                  <span>{userForm.phone}</span>
                </div>
                <div className="summary-item price-breakdown">
                  <span>Price Breakdown:</span>
                  <span>
                    {numberOfDays} days × Rs. {guide.chargesPerDay}
                  </span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>Rs. {totalPrice}</span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  <span className="button-icon">💳</span>
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guidedetail;
