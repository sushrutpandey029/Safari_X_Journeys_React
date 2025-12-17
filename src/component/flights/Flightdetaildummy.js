import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Modal, Badge } from "react-bootstrap";
import { Flight_FareRule } from "../services/flightService";
import "./Flights.css";
import { useNavigate } from "react-router-dom";

const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "--:--";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  } catch {
    return "";
  }
};

const formatPrice = (price) => {
  if (!price) return "0";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const FlightDetail = ({
  flightData,
  travelClass,
  showModal,
  onHide,
  searchData,
}) => {
  const [fareDetail, setFareDetail] = useState("");
  const [loadingFare, setLoadingFare] = useState(false);
  const [selectedFare, setSelectedFare] = useState(null);
  const [fareRulesData, setFareRulesData] = useState(null);
  console.log("search data in flightdetails ", searchData);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [tripType, setTripType] = useState("oneway");

  const navigate = useNavigate();

  useEffect(() => {
    // Search data se passenger count set karo
    if (searchData && searchData.passengers) {
      setAdults(searchData.passengers.adults || 1);
      setChildren(searchData.passengers.children || 0);
      setInfants(searchData.passengers.infants || 0);
      setTripType(searchData.tripType || "oneway");
    }

    if (showModal && flightData) {
      fetchFareRules();
      setSelectedFare(null); // Reset selection when modal opens
    }
  }, [showModal, flightData, searchData]);

  const fetchFareRules = async () => {
    setLoadingFare(true);
    try {
      const fareData = {
        Airline:
          flightData.Airline?.AirlineCode || flightData.AirlineCode || "",
        FareBasisCode: flightData.Fare?.FareBasisCode || "",
      };
      const res = await Flight_FareRule(fareData);
      console.log("Fare Rules API Response:", res); // Debug log

      if (res.success && res.data?.Response?.FareRules?.length > 0) {
        const fareRule = res.data.Response.FareRules[0];
        setFareDetail(fareRule.FareRuleDetail);
        setFareRulesData(fareRule);
      } else {
        setFareDetail("<p>No fare rule found for this flight.</p>");
        setFareRulesData(null);
      }
    } catch (error) {
      console.error("Error fetching fare rules:", error);
      setFareDetail("<p>Error fetching fare rules.</p>");
      setFareRulesData(null);
    } finally {
      setLoadingFare(false);
    }
  };

  // Extract cancellation and date change fees from API response
  const extractFareRulesInfo = () => {
    if (!fareRulesData) return null;

    const fareRuleDetail = fareRulesData.FareRuleDetail || "";

    // Extract cancellation fee from API response
    let cancellationFee =
      "Cancellation fee starts at ₹4,300 (up to 2 hours before departure)";
    let dateChangeFee =
      "Date Change fee starts at ₹3,000 up to 2 hrs before departure";

    // Try to extract actual values from the API response
    if (fareRuleDetail.includes("CHARGE INR 4300 FOR CANCEL/REFUND")) {
      cancellationFee =
        "Cancellation fee: ₹4,300 (up to 2 hours before departure)";
    }

    if (fareRuleDetail.includes("CHARGE INR 3000 FOR REISSUE/REVALIDATION")) {
      dateChangeFee = "Date Change fee: ₹3,000 up to 2 hrs before departure";
    }

    // Check if it's refundable
    const isRefundable = !fareRuleDetail.includes("Non Refundable Fares");

    return {
      cancellation: cancellationFee,
      dateChange: dateChangeFee,
      isRefundable: isRefundable,
      fareBasisCode: fareRulesData.FareBasisCode || "VU1YXSII",
      airline: fareRulesData.Airline || "AI",
    };
  };

  const extractFlightInfo = () => {
    if (!flightData) return null;

    // API data structure ke according data extract karo
    const segments = flightData.Segments?.[0] || [];
    const firstSegment = Array.isArray(segments) ? segments[0] : segments;
    const airline = firstSegment?.Airline || flightData.Airline || {};
    const origin = firstSegment?.Origin || {};
    const destination = firstSegment?.Destination || {};
    const fare = flightData.Fare || {};

    return {
      airline: {
        code: airline.AirlineCode || flightData.AirlineCode || "AI",
        name: airline.AirlineName || "Air India",
        flightNumber: airline.FlightNumber || "2993",
        remark: flightData.AirlineRemark || "",
      },
      origin: {
        city: origin.Airport?.CityName || "Delhi",
        code: origin.Airport?.AirportCode || "DEL",
        time: origin.DepTime,
        airport: origin.Airport?.AirportName || "Delhi Airport",
        Airport: origin.Airport || {},
      },
      destination: {
        city: destination.Airport?.CityName || "Mumbai",
        code: destination.Airport?.AirportCode || "BOM",
        time: destination.ArrTime,
        airport: destination.Airport?.AirportName || "Mumbai Airport",
        Airport: destination.Airport || {},
      },
      flight: {
        baggage: firstSegment?.Baggage || "15 KG",
        cabinBaggage: firstSegment?.CabinBaggage || "7 KG",
        duration: flightData.TotalJourneyTime || "2h 15m",
        aircraft: firstSegment?.AircraftType || "A320",
        stops: Array.isArray(segments) ? segments.length - 1 : 0,
      },
      fare: {
        total: fare.OfferedFare || fare.PublishedFare || 0,
        isRefundable: flightData.IsRefundable,
        penaltyCharges: flightData.PenaltyCharges,
        isFreeMealAvailable: flightData.IsFreeMealAvailable,
      },
      // Add original flight data for API calls - IMPORTANT FOR CHECKOUT
      originalData: flightData,
      // Add essential API parameters
      ResultIndex: flightData.ResultIndex,
      FlightId: flightData.FlightId,
      Segments: flightData.Segments,
      TotalJourneyTime: flightData.TotalJourneyTime,
      Airline: flightData.Airline,
      IsLCC: flightData.IsLCC,
      IsRefundable: flightData.IsRefundable,
    };
  };

  const generateFareOptions = (flightInfo) => {
    if (!flightInfo) return [];
    const baseFare = flightInfo.fare.total;

    // Get fare rules info from API
    const fareRulesInfo = extractFareRulesInfo();

    return [
      {
        id: 1,
        type: "XPRESS VALUE",
        FareType: "XPRESS_VALUE", // API ke liye
        price: formatPrice(Math.max(1000, baseFare - 500)),
        originalPrice: Math.max(1000, baseFare - 500),
        baggage: {
          cabin: flightInfo.flight.cabinBaggage,
          checkin: flightInfo.flight.baggage,
        },
        flexibility: {
          cancellation:
            fareRulesInfo?.cancellation ||
            "Cancellation fee starts at ₹4,300 (up to 2 hours before departure)",
          dateChange:
            fareRulesInfo?.dateChange ||
            "Date Change fee starts at ₹3,000 up to 2 hrs before departure",
        },
        amenities: {
          seats: "Chargeable Seats",
          meals: "Chargeable Meals",
          priority: "",
        },
        offers: [],
        isRefundable: fareRulesInfo?.isRefundable || false,
      },
      {
        id: 2,
        type: "FARE BY MAKEMYTRIP",
        FareType: "STANDARD", // API ke liye
        price: formatPrice(baseFare),
        originalPrice: baseFare,
        baggage: {
          cabin: flightInfo.flight.cabinBaggage,
          checkin: flightInfo.flight.baggage,
        },
        flexibility: {
          cancellation:
            fareRulesInfo?.cancellation ||
            "Cancellation fee starts at ₹4,300 (up to 2 hours before departure)",
          dateChange:
            fareRulesInfo?.dateChange ||
            "Date Change fee starts at ₹3,000 up to 2 hrs before departure",
        },
        amenities: {
          seats: "Chargeable Seats",
          meals: "Chargeable Meals",
          priority: "",
        },
        benefits:
          "BENEFITS WORTH ₹299 INCLUDED - Travel Insurance for 2 days 😊",
        offers: [],
        isRefundable: fareRulesInfo?.isRefundable || false,
      },
      {
        id: 3,
        type: "XPRESS FLEX",
        FareType: "FLEX", // API ke liye
        price: formatPrice(Math.max(1000, baseFare + 200)),
        originalPrice: Math.max(1000, baseFare + 200),
        baggage: {
          cabin: flightInfo.flight.cabinBaggage,
          checkin: flightInfo.flight.baggage,
        },
        flexibility: {
          cancellation:
            fareRulesInfo?.cancellation ||
            "Cancellation fee starts at ₹4,300 (up to 2 hours before departure)",
          dateChange: "Free Date Change up to 2 hrs before departure",
        },
        amenities: {
          seats: "Chargeable Seats",
          meals: "Chargeable Meals",
          priority: "",
        },
        offers: [],
        isRefundable: fareRulesInfo?.isRefundable || false,
      },
    ];
  };

  const handleFareSelect = (fare) => {
    setSelectedFare(fare);
  };

  // Calculate total price based on passenger count
  const calculateTotalPrice = (selectedFare) => {
    if (!selectedFare) return 0;

    const basePrice = selectedFare.originalPrice;
    const totalAdults = adults * basePrice;
    const totalChildren = children * basePrice * 0.75; // 25% discount for children
    const totalInfants = infants * basePrice * 0.1; // 90% discount for infants

    return totalAdults + totalChildren + totalInfants;
  };

  const handleBookNow = () => {
    if (!selectedFare || !flightData) {
      alert("Please select a fare to continue");
      return;
    }

    const flightInfo = extractFlightInfo();

    // Create final search data with passenger information
    const finalSearchData = {
      passengers: {
        adults: adults,
        children: children,
        infants: infants,
      },
      tripType: tripType,
      travelClass: travelClass,
      origin: flightInfo.origin.city,
      destination: flightInfo.destination.city,
      departureDate: flightInfo.origin.time,
      returnDate: searchData?.returnDate || null,
      TraceId: searchData?.TraceId,
      TokenId: searchData?.TokenId,
    };

    // Calculate total price for all passengers
    const totalPrice = calculateTotalPrice(selectedFare);

    const checkoutData = {
      selectedFlight: {
        ...flightInfo,
        ResultIndex: flightData.ResultIndex,
        FlightId: flightData.FlightId,
        FareType: selectedFare.FareType,
        originalFlightData: flightData,
      },

      selectedFare: {
        ...selectedFare,
        price: selectedFare.originalPrice,
      },

      searchData: finalSearchData,

      // Passenger information for checkout forms
      passengerCount: {
        adults: adults,
        children: children,
        infants: infants,
      },

      totalPrice: totalPrice,
    };

    console.log("Checkout Data:", checkoutData);

    // Navigate to checkout page with all data
    navigate("/flight-checkout", { state: checkoutData });
    onHide();
  };

  const renderFareOptionCard = (fare, index) => (
    <div
      key={fare.id}
      className={`fare-option-card ${
        selectedFare?.id === fare.id ? "selected" : ""
      }`}
      onClick={() => handleFareSelect(fare)}
    >
      <div className="fare-header">
        <div className="fare-price">
          <span className="price-emoji">💬</span>
          <span className="price-amount">₹ {fare.price}</span>
          <span className="price-label">per adult</span>
        </div>
        <div className="fare-type">
          <Badge
            className={`fare-badge ${fare.type
              .replace(/\s+/g, "-")
              .toLowerCase()}`}
          >
            {fare.type}
          </Badge>
        </div>
      </div>

      {!fare.isRefundable && (
        <div className="non-refundable-banner">🚫 Non-Refundable Fare</div>
      )}

      <div className="fare-section">
        <div className="section-title">Baggage</div>
        <div className="section-content">
          <div className="feature-item">
            <span className="feature-emoji">💼</span>
            <span>{fare.baggage.cabin} Cabin Baggage</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">🧳</span>
            <span>{fare.baggage.checkin} Check-in Baggage</span>
          </div>
        </div>
      </div>

      <div className="fare-section">
        <div className="section-title">Flexibility</div>
        <div className="section-content">
          <div className="feature-item">
            <span className="feature-emoji">❌</span>
            <span>{fare.flexibility.cancellation}</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">📅</span>
            <span>{fare.flexibility.dateChange}</span>
          </div>
        </div>
      </div>

      <div className="fare-section">
        <div className="section-title">Seats, Meals & More</div>
        <div className="section-content">
          <div className="feature-item">
            <span className="feature-emoji">💺</span>
            <span>{fare.amenities.seats}</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">🍽️</span>
            <span>{fare.amenities.meals}</span>
          </div>
          {fare.amenities.priority && (
            <div className="feature-item">
              <span className="feature-emoji">⚡</span>
              <span>{fare.amenities.priority}</span>
            </div>
          )}
        </div>
      </div>

      {fare.benefits && (
        <div className="fare-benefits">
          <div className="benefits-title">BENEFITS WORTH ₹299 INCLUDED</div>
          <div className="benefits-content">
            <span className="feature-emoji">🛡️</span>
            <span>Travel Insurance for 2 days 😊</span>
          </div>
        </div>
      )}

      <div className="selection-indicator">
        {selectedFare?.id === fare.id ? (
          <div className="selected-tick">✓ SELECTED</div>
        ) : (
          <div className="select-prompt">Click to select</div>
        )}
      </div>
    </div>
  );

  const flightInfo = extractFlightInfo();
  if (!flightInfo) {
    return (
      <Modal show={showModal} onHide={onHide} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="text-center">
            Invalid flight data format.
          </Alert>
        </Modal.Body>
      </Modal>
    );
  }

  const fareOptions = generateFareOptions(flightInfo);
  const isNextDayArrival = () => {
    const dep = new Date(flightInfo.origin.time);
    const arr = new Date(flightInfo.destination.time);
    return dep && arr && dep.getDate() !== arr.getDate();
  };

  // Calculate total price for all passengers
  const totalPrice = selectedFare ? calculateTotalPrice(selectedFare) : 0;

  return (
    <Modal
      show={showModal}
      onHide={onHide}
      size="xl"
      centered
      scrollable
      className="flight-detail-modal"
      style={{ zIndex: 1060 }} // Ensure modal appears above everything
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="w-100">
          <div className="modal-main-title">
            Flight Details and Fare Options available for you!
          </div>
          <div className="flight-route">
            DEPART: {flightInfo.origin.code} - {flightInfo.destination.code}
          </div>
          <div className="flight-details">
            {flightInfo.airline.name} · {formatDate(flightInfo.origin.time)} ·
            Departure: {formatTime(flightInfo.origin.time)} - Arrival:{" "}
            {formatTime(flightInfo.destination.time)}
            {isNextDayArrival() && " (+1 day)"}
          </div>

          {/* Passenger Count Display */}
          <div className="passenger-count-display">
            <strong>Passengers:</strong> {adults} Adult(s), {children}{" "}
            Child(ren), {infants} Infant(s)
          </div>

          {fareRulesData && (
            <div className="fare-basis-info">
              Fare Basis: {extractFareRulesInfo()?.fareBasisCode} · Airline:{" "}
              {extractFareRulesInfo()?.airline}
            </div>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        <div className="fare-options-container">
          <div className="fare-options-grid">
            {fareOptions.map((fare, index) => (
              <div key={fare.id} className="fare-option-column">
                {renderFareOptionCard(fare, index)}
              </div>
            ))}
          </div>

          <div className="total-price-section">
            <div className="total-price-card">
              <div className="total-price">
                <span className="total-amount">
                  ₹ {formatPrice(totalPrice)}
                </span>
                <span className="total-label">
                  {selectedFare
                    ? `${selectedFare.type} FOR ${adults} ADULT(S), ${children} CHILD(REN), ${infants} INFANT(S)`
                    : "SELECT A FARE TO SEE TOTAL"}
                </span>
              </div>
              <div className="passenger-breakdown">
                {selectedFare && (
                  <div className="breakdown-details">
                    <div>
                      Adults ({adults} x ₹
                      {formatPrice(selectedFare.originalPrice)})
                    </div>
                    {children > 0 && (
                      <div>
                        Children ({children} x ₹
                        {formatPrice(selectedFare.originalPrice * 0.75)})
                      </div>
                    )}
                    {infants > 0 && (
                      <div>
                        Infants ({infants} x ₹
                        {formatPrice(selectedFare.originalPrice * 0.1)})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fare Rules Section */}
          <div className="fare-rules-section">
            <div className="section-title">Fare Rules & Terms</div>
            {loadingFare ? (
              <div className="loading-rules">
                <Spinner animation="border" variant="primary" size="sm" />
                <p>Loading fare rules...</p>
              </div>
            ) : fareDetail ? (
              <div
                className="fare-rules-content"
                dangerouslySetInnerHTML={{ __html: fareDetail }}
              />
            ) : (
              <div className="no-rules">
                No fare rules available for this flight.
              </div>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="modal-footer-custom">
        <div className="footer-content">
          <div className="selected-fare-info">
            {selectedFare ? (
              <div className="selected-info">
                <strong>Selected: {selectedFare.type}</strong> - Total: ₹
                {formatPrice(totalPrice)} for {adults} Adult(s), {children}{" "}
                Child(ren), {infants} Infant(s)
                {!selectedFare.isRefundable && (
                  <span className="refundable-badge non-refundable">
                    Non-Refundable
                  </span>
                )}
              </div>
            ) : (
              <div className="no-selection">Please select a fare option</div>
            )}
          </div>
          <div className="footer-actions">
            <Button
              className="explore-btn book-now-main-btn"
              onClick={handleBookNow}
              disabled={!selectedFare}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #2b87da, #1e63b5)",
                border: "none",
                borderRadius: "30px",
                color: "white",
              }}
            >
              BOOK NOW - ₹{formatPrice(totalPrice)}
            </Button>
          </div>
        </div>
        <div className="footer-note">
          All prices include taxes and fees. Additional charges may apply.
          {fareRulesData && !extractFareRulesInfo()?.isRefundable && (
            <span className="non-refundable-note">
              {" "}
              · This is a non-refundable fare
            </span>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default FlightDetail;
