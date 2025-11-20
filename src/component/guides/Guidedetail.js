import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { BASE_URL } from "../services/apiEndpoints";
import "./GuideCareers.css";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";

const Guidedetail = () => {
  const location = useLocation();
  const { guideId } = useParams();
  const guide = location.state?.guideData;
  const {startPayment} = useCashfreePayment()

  console.log("GUIDEDETAIL", JSON.stringify(guide, null, 2));
  console.log("Guide ID from URL:", guideId);

  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    address: "",
    location: `${guide?.city}, ${guide?.state}, ${guide?.country}` || ""
  });

  // Get dates from previous page
  const { fromDate, toDate } = location.state || {};
  const start = fromDate ? new Date(fromDate) : null;
  const end = toDate ? new Date(toDate) : null;

  // Helper functions for date handling
  const isSameDate = (d1, d2) =>
    d1 &&
    d2 &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const isInRange = (date) => {
    if (!start || !end) return false;
    return date >= start && date <= end;
  };

  const isStartDate = (date) => isSameDate(date, start);
  const isEndDate = (date) => isSameDate(date, end);

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFormSubmit = () => {
    // Form validation
    if (!userForm.name.trim() || !userForm.phone.trim() || !userForm.address.trim()) {
      alert("Please fill all required fields in the form below");
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

  const handleDateSelect = (date) => {
    // Only allow selection if date is in the selected range
    if (isInRange(date)) {
      setSelectedDate(date);
    }
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      alert("Please select a date from your chosen range first");
      return;
    }

    // First validate and submit user form
    const isFormValid = handleUserFormSubmit();
    if (!isFormValid) {
      return;
    }

    // If form is valid, show booking confirmation
    setShowBookingForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const userdetails = await getUserData("safarix_user");

    try {
      const bookingData = {
        userId: userdetails?.id,
        serviceType: "guide",
        serviceProviderId: guide.guideId,
        serviceDetails: {
          guideId: guide.guideId,
          guideName: guide.fullName,
          guideEmail: guide.emailAddress,
          location: userForm.location,
          chargesPerDay: guide.chargesPerDay,
          availableDays: guide.availability?.days || [],
          selectedDate: selectedDate.toISOString().split("T")[0],
          customerDetails: userForm
        },
        customerDetails: {
          fullName: userForm.name,
          email: userdetails?.emailid,
          phone: userForm.phone,
          address: userForm.address
        },
        totalAmount: guide.chargesPerDay,
        bookingDate: new Date().toISOString(),
        startDate: selectedDate
      };

      console.log("Booking Data with User Form:", bookingData);
      const result = await startPayment(bookingData);
      console.log("payment res", result);
      
      // Show success message
      alert(`Booking confirmed! Thank you ${userForm.name}. Payment processing started.`);
      
      // Reset form after successful booking
      setUserForm({
        name: "",
        phone: "",
        address: "",
        location: `${guide?.city}, ${guide?.state}, ${guide?.country}` || ""
      });
      setShowBookingForm(false);
      
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

    alert(`Message sent to ${guide.fullName}! We'll contact you at ${userForm.phone} soon.`);
  };

  // Generate calendar with highlighted range
  const generateOctober2025Calendar = () => {
    const calendar = [];
    for (let i = 28; i <= 30; i++) calendar.push(new Date(2025, 8, i));
    for (let day = 1; day <= 31; day++) calendar.push(new Date(2025, 9, day));
    calendar.push(new Date(2025, 10, 1));
    return calendar;
  };

  const calendar = generateOctober2025Calendar();

  return (
    <div className="guidedetail-container">
      {/* Header */}
      <div className="guide-header">
        <div className="back-button" onClick={() => window.history.back()}>
          <span className="back-arrow">←</span>
          Back to Guides
        </div>

        <div className="guide-main-info">
          {/* Guide Profile Image */}
          <div className="guide-profile-image">
            <img 
              src={`${BASE_URL}/uploads/guides/${guide.profileImage}`}
              alt={guide.fullName}
              className="profile-img"
              onError={(e) => {
                e.target.src = '/default-avatar.png'; // Fallback image
                e.target.onerror = null;
              }}
            />
          </div>

          <div className="guide-basic-info">
            <h1 className="guide-name">{guide.fullName}</h1>
            <div className="location-experience">
              <span className="location">
               📍 {guide.city}, {guide.state}
              </span>
              <span className="experience">
                ⭐ {guide.workExperience?.[0]?.years}+ years Experience
              </span>
            </div>
          </div>

          <div className="language-rating-section">
            <div className="primary-language">
              <h3>🗣️ {guide.languageProficiency?.[0]?.language || "English"}</h3>
              <div className="rating">
                <strong>4.8</strong> ⭐ (120 reviews)
              </div>
            </div>
            <div className="other-languages-table">
              <table>
                <tbody>
                  <tr>
                    {guide.languageProficiency?.slice(1).map((lang, index) => (
                      <td key={index}>• {lang.language}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="specialties-section">
          {guide.typesOfTours?.map((specialty, index) => (
            <div key={index} className="specialty-item">
              🎯 {specialty}
            </div>
          ))}
        </div>

        {/* Show selected date range */}
        {start && end && (
          <div className="selected-date-range">
            <div className="range-badge">
              <span className="range-icon">📅</span>
              Selected Dates: {start.toDateString()} to {end.toDateString()}
            </div>
          </div>
        )}
      </div>

      <div className="divider-gradient"></div>

      {/* Tabs */}
      <div className="tabs-navigation">
        {["about", "tours", "reviews"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="tab-text">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
            <span className="tab-indicator"></span>
          </button>
        ))}
      </div>

      <div className="divider-gradient"></div>

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
                  <span>Date:</span>
                  <span>{selectedDate?.toDateString()}</span>
                </div>
                <div className="summary-item">
                  <span>Location:</span>
                  <span>{userForm.location}</span>
                </div>
                <div className="summary-item">
                  <span>Customer:</span>
                  <span>{userForm.name}</span>
                </div>
                <div className="summary-item">
                  <span>Contact:</span>
                  <span>{userForm.phone}</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>Rs. {guide.chargesPerDay}</span>
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

      <div className="main-content-layout">
        {/* Left Content */}
        <div className="content-area">
          {activeTab === "about" && (
            <div className="about-content">
              <h2 className="section-title">About Me</h2>
              <p className="description">{guide.professionalSummary}</p>

              <div className="certifications-section">
                <h3 className="section-subtitle">Certifications</h3>
                <div className="certifications-list">
                  {guide.certifications?.map((cert, index) => (
                    <div key={index} className="certification-item">
                      <div className="certification-icon">🏆</div>
                      <div className="certification-details">
                        <div className="certification-name">{cert.name}</div>
                        <div className="certification-org">{cert.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tours" && (
            <div className="tours-content">
              <h2 className="section-title">Types of Tours</h2>
              <ul className="tours-list">
                {guide.typesOfTours?.map((tour, index) => (
                  <li key={index} className="tour-item">
                    🗺️ {tour}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-content">
              <h2 className="section-title">Customer Reviews</h2>
              <div className="reviews-placeholder">
                <div className="review-icon">💬</div>
                <p>No reviews yet.</p>
                <small>Be the first to share your experience!</small>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="booking-sidebar">
          <div className="calendar-widget">
            <h3 className="widget-title">
              Select Date 
              {start && end && (
                <span className="date-range-info">
                  ({start.toLocaleDateString()} - {end.toLocaleDateString()})
                </span>
              )}
            </h3>
            <div className="month-header">October 2025</div>
            <div className="calendar">
              <div className="week-days">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="week-day">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {calendar.map((date, index) => {
                  const inRange = isInRange(date);
                  const isStart = isStartDate(date);
                  const isEnd = isEndDate(date);
                  
                  return (
                    <div
                      key={index}
                      className={`calendar-day ${
                        date.getMonth() !== 9 ? "other-month" : ""
                      } ${
                        inRange ? "in-range" : ""
                      } ${
                        isStart ? "range-start" : ""
                      } ${
                        isEnd ? "range-end" : ""
                      } ${
                        selectedDate && date.getTime() === selectedDate.getTime()
                          ? "selected"
                          : ""
                      } ${
                        !inRange ? "disabled" : ""
                      }`}
                      onClick={() => handleDateSelect(date)}
                      title={inRange ? `Available: ${date.toDateString()}` : "Not in selected range"}
                    >
                      {date.getDate()}
                      {isStart && <div className="range-indicator start">Start</div>}
                      {isEnd && <div className="range-indicator end">End</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Legend */}
            {start && end && (
              <div className="calendar-legend">
                <div className="legend-item">
                  <div className="legend-color range-start"></div>
                  <span>Start Date</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color in-range"></div>
                  <span>Available Dates</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color range-end"></div>
                  <span>End Date</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color selected"></div>
                  <span>Selected Date</span>
                </div>
              </div>
            )}
          </div>

          <div className="quick-info-widget">
            <h3 className="widget-title">Quick Info</h3>
            <ul className="quick-info-list">
              <li>
                <span className="info-icon">📅</span>
                Available Days: {Array.isArray(guide.availability?.days)
                  ? guide.availability.days.join(", ")
                  : "Not available"}
              </li>
              <li>
                <span className="info-icon">👥</span>
                Group Size: {guide.groupSizesManaged}
              </li>
              <li>
                <span className="info-icon">📍</span>
                Location: {guide.city}, {guide.state}
              </li>
              <li>
                <span className="info-icon">💰</span>
                Charges per day: <b>Rs. {guide.chargesPerDay}</b>
              </li>
              {start && end && (
                <li>
                  <span className="info-icon">⏱️</span>
                  Your Dates: {start.toLocaleDateString()} - {end.toLocaleDateString()}
                </li>
              )}
            </ul>
          </div>

          <div className="action-buttons">
            <button className="book-now-button" onClick={handleBookNow}>
              <span className="button-icon">🎯</span>
              Book Now
            </button>
            <button className="message-button" onClick={handleSendMessage}>
              <span className="button-icon">💬</span>
              Send Message
            </button>
          </div>

          <div className="contact-widget">
            <h3 className="widget-title">Contact Information</h3>
            <div className="contact-info">
              <p>📧 {guide.emailAddress}</p>
              <p>📞 {guide.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent User Form at Bottom */}
      <div className="user-form-section">
        <div className="user-form-container">
          <div className="user-form-header">
            <h2 className="user-form-title">Your Contact Details</h2>
            <p className="user-form-subtitle">
              Fill your details below. Both "Book Now" and "Send Message" will use this information.
            </p>
          </div>
          
          <div className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="userName" className="form-label">
                  <span className="required">*</span> Full Name
                </label>
                <input
                  type="text"
                  id="userName"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  required
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="userPhone" className="form-label">
                  <span className="required">*</span> Phone Number
                </label>
                <input
                  type="tel"
                  id="userPhone"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleUserFormChange}
                  required
                  placeholder="Enter your phone number"
                  className="form-input"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="userAddress" className="form-label">
                <span className="required">*</span> Address
              </label>
              <textarea
                id="userAddress"
                name="address"
                value={userForm.address}
                onChange={handleUserFormChange}
                required
                placeholder="Enter your complete address"
                rows="3"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="userLocation" className="form-label">
                Preferred Tour Location
              </label>
              <input
                type="text"
                id="userLocation"
                name="location"
                value={userForm.location}
                onChange={handleUserFormChange}
                className="form-input location-field"
                readOnly
              />
              <small className="location-note">
                Based on guide's location: {guide.city}, {guide.state}
              </small>
            </div>

            <div className="form-status">
              <p className="status-message">
                ✅ Your details will be used for booking and messaging
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidedetail;