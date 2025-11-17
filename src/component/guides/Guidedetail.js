
// new code

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

  if (!guide) {
    return (
      <div className="error">
        <h3>Guide Not Found</h3>
        <button
          onClick={() => window.history.back()}
          className="btn btn-outline"
        >
          ← Back to Guides
        </button>
      </div>
    );
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }

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
          location: `${guide.city}, ${guide.state}, ${guide.country}`,
          chargesPerDay: guide.chargesPerDay,
          availableDays: guide.availability?.days || [],
          selectedDate: selectedDate.toISOString().split("T")[0],
        },
        customerDetails: {
          fullName: userdetails?.fullname, // replace later with logged-in user's name
          email: userdetails?.emailid, // same here
          phone: userdetails?.phonenumber, // and here
        },
        totalAmount: guide.chargesPerDay,
        bookingDate: new Date().toISOString(),
        startDate:selectedDate
      };

      const result = await startPayment(bookingData);
    console.log("payment res", result);

      // const response = await fetch(`${BASE_URL}/bookings/create-draft`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(bookingData),
      // });

      
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
          # Back to Guides
        </div>

        <div className="guide-main-info">
          <div className="guide-basic-info">
            <h1>{guide.fullName}</h1>
            <div className="location-experience">
              <span className="location">
                - {guide.city}, {guide.state}
              </span>
              <span className="experience">
                - {guide.workExperience?.[0]?.years}+ years Experience
              </span>
            </div>
          </div>

          <div className="language-rating-section">
            <div className="primary-language">
              <h3>{guide.languageProficiency?.[0]?.language || "English"}</h3>
              <div className="rating">
                <strong>4.8</strong> (120 reviews)
              </div>
            </div>
            <div className="other-languages-table">
              <table>
                <tbody>
                  <tr>
                    {guide.languageProficiency?.slice(1).map((lang, index) => (
                      <td key={index}>{lang.language}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="specialties-section">
          {guide.typesOfTours?.map((specialty, index) => (
            <strong key={index} className="specialty-item">
              {specialty}
            </strong>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* Tabs */}
      <div className="tabs-navigation">
        {["about", "tours", "gallery", "reviews"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <strong>{tab.charAt(0).toUpperCase() + tab.slice(1)}</strong>
          </button>
        ))}
      </div>

      <hr className="divider" />

      <div className="main-content-layout">
        {/* Left Content */}
        <div className="content-area">
          {activeTab === "about" && (
            <div className="about-content">
              <h2>About Me</h2>
              <p className="description">{guide.professionalSummary}</p>

              <div className="certifications-section">
                <h3>Certifications</h3>
                <div className="certifications-list">
                  {guide.certifications?.map((cert, index) => (
                    <div key={index} className="certification-item">
                      <span className="checkbox">[ ]</span>
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
              <h2>Types of Tours</h2>
              <ul>
                {guide.typesOfTours?.map((tour, index) => (
                  <li key={index}>{tour}</li>
                ))}
              </ul>
            </div>
          )}

         {/* {activeTab === "gallery" && (
  <div className="gallery-content">
    <h2>Gallery</h2>
    <div className="gallery-grid">
      <img
        src={`${BASE_URL}/uploads/${guide.profileImage}`}
        alt="Guide"
        className="gallery-item"
      />
    </div>
  </div>
)} */}


          {activeTab === "reviews" && (
            <div className="reviews-content">
              <h2>Customer Reviews</h2>
              <p>No reviews yet.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="booking-sidebar">
          <div className="calendar-widget">
            <h3>Select Date</h3>
            <div className="month-header">October 2025</div>
            <div className="calendar">
              <div className="week-days">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
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
            <h3>Quick Info</h3>
            <ul>
              <li>
                - Available Days:{" "}
                {Array.isArray(guide.availability?.days)
                  ? guide.availability.days.join(", ")
                  : "Not available"}
              </li>
              <li>- Group Size: {guide.groupSizesManaged}</li>
              <li>
                - Location: {guide.city}, {guide.state}
              </li>
              <li>
                - Charges per day: <b>Rs. {guide.chargesPerDay}</b>
              </li>
            </ul>
          </div>

          <div className="action-buttons">
            <button className="book-now-button" onClick={handleBookNow}>
              Book Now
            </button>
            <button className="message-button" onClick={handleSendMessage}>
              Send Message
            </button>
          </div>

          <div className="contact-widget">
            <h3>Contact Information</h3>
            <p>Email: {guide.emailAddress}</p>
            <p>Phone: {guide.phoneNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidedetail;
