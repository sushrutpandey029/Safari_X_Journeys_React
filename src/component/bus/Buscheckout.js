import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bus.css";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";

const BusCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { startPayment } = useCashfreePayment();

  const { bus, seats, selectedSeats, selectedBoarding, selectedDropping } =
    location?.state;
  console.log("Full BUS object => ", bus);
  console.log(
    "selectedBoarding",
    selectedBoarding,
    "selectedDropping",
    selectedDropping
  );

  const [passengers, setPassengers] = useState(
    seats.map((seat) => ({
      seatNumber: seat, // dynamic seat mapping
      name: "",
      age: "",
      gender: "",
      idType: "PAN",
      idNumber: "",
      address: "",
    }))
  );

  const [contactDetails, setContactDetails] = useState({
    email: "",
    mobile: "",
  });

  const [insurance, setInsurance] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [showGST, setShowGST] = useState(false);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleContactChange = (field, value) => {
    setContactDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleOfferToggle = (offerCode) => {
    setSelectedOffers((prev) =>
      prev.includes(offerCode)
        ? prev.filter((code) => code !== offerCode)
        : [...prev, offerCode]
    );
  };

  async function getUserIP() {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      console.log("ip", data.ip);
      return data.ip;
    } catch (err) {
      console.error("Error fetching IP:", err);
      return "";
    }
  }

  // ========= 🚀 API REQUEST BODY BUILDER =========
  const handleContinue = async () => {
    const user = await getUserData("safarix_user");
    const ip = await getUserIP();

    if (!contactDetails.email || !contactDetails.mobile) {
      alert("Please fill in all required contact details");
      return;
    }

    if (passengers.some((p) => !p.name || !p.age || !p.gender)) {
      alert("Please fill in all passenger details");
      return;
    }

    if (!selectedBoarding || !selectedDropping) {
      alert("Please select boarding & dropping point");
      return;
    }

    // Calculate total fare dynamically
    const totalAmount = passengers.reduce(
      (sum, p) => sum + Number(p?.fare || bus.price),
      0
    );

    const bookingData = {
      userId: user?.id || null,
      serviceType: "bus",

      startDate: bus.departureTime,
      endDate: bus.arrivalTime,
      currency: "INR",
      totalAmount,

      bookingInfo: {
        traceId: bus.traceId,
        resultIndex: bus.resultIndex,
        routeId: bus.routeId,
        busId: bus.busId,
        operatorId: bus.operatorId,
        busName: bus.busName,
        travelName: bus.travelName,
        busType: bus.busType,
      },

      BookingCustomer: {
        Name: passengers[0]?.name,
        Email: contactDetails.email,
        Phone: contactDetails.mobile,
        EmergencyContact: contactDetails.mobile,
        Address: "Not Provided",
      },

      Passenger: passengers.map((p, index) => ({
        LeadPassenger: index === 0,
        Title: p.gender === "Male" ? "Mr" : "Ms",
        FirstName: p.name.split(" ")[0] || "",
        LastName: p.name.split(" ")[1] || "",
        Age: Number(p.age),
        Gender: p.gender === "Male" ? 1 : 2,

        Seat: {
          SeatName: p.seatNumber,
          Fare: p.fare || bus.price, // Dynamic
        },

        Contact: {
          Email: contactDetails.email,
          Phone: contactDetails.mobile,
        },
      })),

      BoardingPoint: {
        name: selectedBoarding.CityPointName,
        location: selectedBoarding.CityPointLocation,
        time: selectedBoarding.CityPointTime,
        index: selectedBoarding.CityPointIndex,
      },

      DroppingPoint: {
        name: selectedDropping.CityPointName,
        location: selectedDropping.CityPointLocation,
        time: selectedDropping.CityPointTime,
        index: selectedDropping.CityPointIndex,
      },

      InsuranceRequired: insurance,
      AppliedOffers: selectedOffers || [],
      enduserip: ip,
    };

    console.log(
      "🚍 Final Bus Booking Payload:",
      JSON.stringify(bookingData, null, 2)
    );

    // Proceed to payment screen or API call
    const resp = await startPayment(bookingData);
  };

  // -------- UI (unchanged) ----------
  const offers = [
    { code: "MEGABUS", description: "Get discount up to 10%" },
    { code: "MMTEXTRA", description: "Rs 15 instant discount" },
    { code: "IDBICC", description: "Flat 10% off for IDBI CC Users" },
  ];

  return (
    <div className="bus-checkout" style={{ marginTop: "100px" }}>
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <h1># IntrCity SmartBus</h1>
          <div className="bus-type">Bharat Benz A/C Seater / Sleeper (2+1)</div>
        </div>

        {/* Journey Details */}
        <div className="journey-section">
          <div className="journey-info">
            <div className="time-info">
              <div className="time">22:30</div>
              <div className="date">11 Nov' 25, Tue</div>
            </div>
            <div className="location-info">
              <div className="city">Delhi</div>
              <div className="location-details">
                <div>Isbt Kashmiri gate - boarding zone</div>
                <div>
                  IntrCity Boarding Zone, Ground Floor, Arrival Block, Platform
                  No.55,56,57,58
                </div>
                <div>Inside ISBT Bus Stand (Delhi)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Main Content - 50/50 Split with Flex */}
        <div className="main-content">
          {/* Left Column - Forms */}
          <div className="left-column">
            {/* Traveler Details */}
            <div className="section">
              <h2 className="section-title">Traveler Details</h2>
              <div className="traveler-table">
                <div className="table-row header">
                  <div className="col-seat"></div>
                  <div className="col-name">Name</div>
                  <div className="col-age">Age*</div>
                  <div className="col-gender">Gender</div>
                </div>
                {passengers.map((passenger, index) => (
                  <div key={index} className="table-row">
                    <div className="col-seat">
                      <span className="seat-badge">
                        Seat {passenger.seatNumber}
                      </span>
                    </div>
                    <div className="col-name">
                      <input
                        type="text"
                        placeholder="Type here"
                        value={passenger.name}
                        onChange={(e) =>
                          handlePassengerChange(index, "name", e.target.value)
                        }
                        className="text-input"
                      />
                    </div>
                    <div className="col-age">
                      <input
                        type="number"
                        placeholder="eg : 24"
                        value={passenger.age}
                        onChange={(e) =>
                          handlePassengerChange(index, "age", e.target.value)
                        }
                        className="text-input"
                      />
                    </div>
                    <div className="col-gender">
                      <div className="gender-option">
                        <label className="gender-checkbox">
                          <input
                            type="checkbox"
                            checked={passenger.gender === "Male"}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "gender",
                                e.target.checked ? "Male" : ""
                              )
                            }
                          />
                          <span className="checkmark"></span>
                          Male
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Contact Details */}
            <div className="section">
              <h2 className="section-title">Contact Details</h2>
              <p className="section-subtitle">We'll send your ticket here</p>

              <div className="contact-fields">
                <div className="contact-field">
                  <label className="field-label">Email id*</label>
                  <div className="input-with-checkbox">
                    <input
                      type="email"
                      placeholder="Type here"
                      value={contactDetails.email}
                      onChange={(e) =>
                        handleContactChange("email", e.target.value)
                      }
                      className="text-input full-width"
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label className="field-label">Mobile Number*</label>
                  <div className="input-with-checkbox">
                    <input
                      type="tel"
                      placeholder="Type here"
                      value={contactDetails.mobile}
                      onChange={(e) =>
                        handleContactChange("mobile", e.target.value)
                      }
                      className="text-input full-width"
                    />
                  </div>
                </div>

                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showGST}
                      onChange={(e) => setShowGST(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Enter GST details (optional)
                  </label>
                </div>
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Insurance */}
            <div className="section">
              <div className="insurance-section">
                <div className="insurance-header">
                  <label className="insurance-checkbox">
                    <input
                      type="checkbox"
                      checked={insurance}
                      onChange={(e) => setInsurance(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <strong>Secure your trip at just ₹15</strong>
                  </label>
                  <div className="insurance-provider">
                    <div>Powered by</div>
                    <div className="terms-link">Terms and Conditions</div>
                  </div>
                </div>

                {insurance && (
                  <div className="insurance-grid">
                    <div className="insurance-item">[Logo of Passage]</div>
                    <div className="insurance-item">[Accidental Death]</div>
                    <div className="insurance-item">[Hospitalisation]</div>
                    <div className="insurance-item">[Actualization]</div>
                    <div className="insurance-item">[Local Response]</div>
                    <div className="insurance-item">[Accidental Death]</div>
                    <div className="insurance-item">[Hospitalisation]</div>
                    <div className="insurance-item">[Accessibility]</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="vertical-divider"></div>

          {/* Right Column - Offers & Price */}
          <div className="right-column">
            {/* Offers */}
            <div className="section">
              <h2 className="section-title">Offers</h2>
              <div className="offers-list">
                {offers.map((offer, index) => (
                  <div key={index} className="offer-item">
                    <label className="offer-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedOffers.includes(offer.code)}
                        onChange={() => handleOfferToggle(offer.code)}
                      />
                      <span className="checkmark"></span>
                      <div className="offer-content">
                        <strong>{offer.code}</strong>
                        <span>{offer.description}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Price Details */}
            <div className="section price-section">
              <h2 className="section-title">Price details</h2>
              <div className="price-table">
                <div className="price-row">
                  <span className="price-label">Base Fare</span>
                  <span className="price-value">₹{bus.price}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Amount</span>
                  <span className="price-value">₹{bus.price}</span>
                </div>
              </div>
              <div className="price-note">
                Final payable amount will be updated on the next page.
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button - Full Width */}
        <div className="continue-section">
          <button className="continue-btn" onClick={handleContinue}>
            CONTINUE
          </button>
          <p className="agreement">
            By proceeding, I agree to{" "}
            <a href="#agreement">MakeMyTrips User Agreement</a>,
            <a href="#terms"> Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusCheckout;
