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
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    address: "",
    location: `${guide?.city}, ${guide?.state}, ${guide?.country}` || ""
  });

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
    setSelectedDate(date);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }
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
          location: formData.location,
          chargesPerDay: guide.chargesPerDay,
          availableDays: guide.availability?.days || [],
          selectedDate: selectedDate.toISOString().split("T")[0],
          customerDetails: formData
        },
        customerDetails: {
          fullName: formData.fullName,
          email: userdetails?.emailid,
          phone: formData.contactNumber,
          address: formData.address
        },
        totalAmount: guide.chargesPerDay,
        bookingDate: new Date().toISOString(),
        startDate: selectedDate
      };

      const result = await startPayment(bookingData);
      console.log("payment res", result);
      
    } catch (err) {
      console.error(err);
      alert("Failed to send booking request. Please try again.");
    }
  };

  const handleSendMessage = () => {
    alert(
      `Message feature would open here. ${guide.fullName} will be notified.`
    );
  };

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
          <div className="guide-basic-info">
            <h1 className="guide-name">{guide.fullName}</h1>
            <div className="location-experience">
              <span className="location">
               {guide.city}, {guide.state}
              </span>
              <span className="experience">
                ⭐ {guide.workExperience?.[0]?.years}+ years Experience
              </span>
            </div>
          </div>

          <div className="language-rating-section">
            <div className="primary-language">
              <h3> {guide.languageProficiency?.[0]?.language || "English"}</h3>
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
      </div>

      <div className="divider-gradient"></div>

      {/* Tabs */}
      <div className="tabs-navigation">
        {["about", "tours","reviews"].map((tab) => (
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
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number *</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your complete address"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Tour Location</label>
                <textarea
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Selected tour location"
                  rows="2"
                  readOnly
                />
                <small className="location-note">
                  This location is pre-selected based on your guide's area
                </small>
              </div>

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
            <h3 className="widget-title">Select Date</h3>
            <div className="month-header">October 2025</div>
            <div className="calendar">
              <div className="week-days">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="week-day">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {calendar.map((date, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${
                      date.getMonth() !== 9 ? "other-month" : ""
                    } ${
                      selectedDate && date.getTime() === selectedDate.getTime()
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
};

export default Guidedetail;