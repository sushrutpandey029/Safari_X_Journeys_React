import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
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
  if (price === null || price === undefined || isNaN(price)) return "0.00";
  return Number(price)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const FlightDetail = ({
  flightData,
  travelClass,
  showModal,
  onHide,
  searchData,
  totalPrice,
  pricingBreakdown,
}) => {
  // ✅ Multiple flights support - हर flight के लिए अलग state
  const [fareDetails, setFareDetails] = useState([]);
  const [loadingFares, setLoadingFares] = useState([]);
  const [selectedFares, setSelectedFares] = useState([]);
  const [fareRulesData, setFareRulesData] = useState([]);

  // ✅ Handle multiple flights or single flight
  const flights = Array.isArray(flightData)
    ? flightData
    : flightData
    ? [flightData]
    : [];

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [tripType, setTripType] = useState("oneway");
  const navigate = useNavigate();

  // ✅ Initialize state for each flight when modal opens
  useEffect(() => {
    if (showModal && flights.length > 0) {
      // Initialize arrays with flight count
      const initialFareDetails = new Array(flights.length).fill("");
      const initialLoading = new Array(flights.length).fill(false);
      const initialSelected = new Array(flights.length).fill(null);
      const initialFareRules = new Array(flights.length).fill(null);

      setFareDetails(initialFareDetails);
      setLoadingFares(initialLoading);
      setSelectedFares(initialSelected);
      setFareRulesData(initialFareRules);

      // Fetch fare rules for each flight
      flights.forEach((flight, index) => {
        fetchFareRules(flight, index);
      });
    }
  }, [showModal, flights]);

  // ✅ Set passenger data and trip type from searchData
  useEffect(() => {
    if (searchData) {
      setAdults(searchData.passengers?.adults || 1);
      setChildren(searchData.passengers?.children || 0);
      setInfants(searchData.passengers?.infants || 0);
      setTripType(searchData.tripType || "oneway");
    }
  }, [searchData]);

  // ✅ Fetch fare rules for specific flight by index
  const fetchFareRules = async (flight, index) => {
    if (!flight || !searchData?.TraceId) return;

    // Update loading state for this specific flight
    const newLoadingFares = [...loadingFares];
    newLoadingFares[index] = true;
    setLoadingFares(newLoadingFares);

    try {
      const payload = {
        TraceId: searchData.TraceId,
        ResultIndex: flight?.ResultIndex || flight?.resultIndex,
      };

      const res = await Flight_FareRule(payload);

      if (res?.data?.Response?.FareRules?.length > 0) {
        const rule = res.data.Response.FareRules[0];

        // Update fare details for this specific flight
        const newFareDetails = [...fareDetails];
        newFareDetails[index] =
          rule.FareRuleDetail || "<p>Fare rules available.</p>";
        setFareDetails(newFareDetails);

        // Update fare rules data for this specific flight
        const newFareRulesData = [...fareRulesData];
        newFareRulesData[index] = rule;
        setFareRulesData(newFareRulesData);

        // Auto-select first fare option
        const fareOptions = generateFareOptions(flight, index);
        if (fareOptions.length > 0 && !selectedFares[index]) {
          const newSelectedFares = [...selectedFares];
          newSelectedFares[index] = fareOptions[0];
          setSelectedFares(newSelectedFares);
        }
      } else {
        const newFareDetails = [...fareDetails];
        newFareDetails[index] = "<p>No fare rule available.</p>";
        setFareDetails(newFareDetails);
      }
    } catch (err) {
      console.error("Error fetching fare rules:", err);
      const newFareDetails = [...fareDetails];
      newFareDetails[index] = "<p>Error fetching fare rules.</p>";
      setFareDetails(newFareDetails);
    } finally {
      const newLoadingFares = [...loadingFares];
      newLoadingFares[index] = false;
      setLoadingFares(newLoadingFares);
    }
  };

  // ✅ Helper function to get display price from flight
  const getDisplayPrice = (flight) => {
    if (!flight) return 0;

    // First check for DisplayPrice at root level
    if (flight.DisplayPrice !== undefined && flight.DisplayPrice !== null) {
      return parseFloat(flight.DisplayPrice);
    }

    // Then check in Fare object
    if (flight.Fare) {
      if (
        flight.Fare.DisplayPrice !== undefined &&
        flight.Fare.DisplayPrice !== null
      ) {
        return parseFloat(flight.Fare.DisplayPrice);
      }
      if (
        flight.Fare.OfferedFare !== undefined &&
        flight.Fare.OfferedFare !== null
      ) {
        return parseFloat(flight.Fare.OfferedFare);
      }
      if (
        flight.Fare.PublishedFare !== undefined &&
        flight.Fare.PublishedFare !== null
      ) {
        return parseFloat(flight.Fare.PublishedFare);
      }
    }

    // Check root level
    if (flight.OfferedFare !== undefined && flight.OfferedFare !== null) {
      return parseFloat(flight.OfferedFare);
    }

    if (flight.PublishedFare !== undefined && flight.PublishedFare !== null) {
      return parseFloat(flight.PublishedFare);
    }

    return 0;
  };

  // ✅ Extract flight info for specific flight
  const extractFlightInfo = (flight) => {
    if (!flight) return null;

    // Get first segment
    let segments = flight.Segments || [];
    let firstSegment;

    if (segments.length > 0) {
      if (Array.isArray(segments[0])) {
        firstSegment = segments[0][0];
      } else {
        firstSegment = segments[0];
      }
    }

    const airline = flight.Airline || firstSegment?.Airline || {};
    const origin = firstSegment?.Origin || {};
    const destination = firstSegment?.Destination || {};
    const fare = flight.Fare || {};

    const displayPrice = getDisplayPrice(flight);
    const publishedPrice = fare.PublishedFare || displayPrice;

    return {
      airline: {
        code: airline.AirlineCode || "",
        name: airline.AirlineName || "",
        flightNumber: airline.FlightNumber || "",
      },
      origin: {
        city: origin.Airport?.CityName || "",
        code: origin.Airport?.AirportCode || origin.AirportCode || "",
        time: origin.DepTime,
        airport: origin.Airport?.AirportName || "",
      },
      destination: {
        city: destination.Airport?.CityName || "",
        code: destination.Airport?.AirportCode || destination.AirportCode || "",
        time: destination.ArrTime,
        airport: destination.Airport?.AirportName || "",
      },
      flight: {
        baggage: firstSegment?.Baggage || "",
        cabinBaggage: firstSegment?.CabinBaggage || "",
        duration: flight.TotalJourneyTime || "",
        aircraft: firstSegment?.AircraftType || "",
        stops: segments.length > 1 ? segments.length - 1 : 0,
      },
      fare: {
        displayPrice: displayPrice,
        total: fare.OfferedFare || displayPrice,
        publishedPrice: publishedPrice,
        isRefundable: flight.IsRefundable || false,
        penaltyCharges: flight.PenaltyCharges,
      },
      // Add original flight data
      originalData: flight,
      ResultIndex: flight.ResultIndex,
      FlightId: flight.FlightId,
      Segments: flight.Segments,
    };
  };

  // ✅ Generate fare options for specific flight - FIXED
  const generateFareOptions = (flight, flightIndex) => {
    const flightInfo = extractFlightInfo(flight);
    if (!flightInfo) return [];

    const displayPrice = flightInfo.fare.displayPrice;
    const publishedPrice = flightInfo.fare.publishedPrice;
    const isRefundable = flight.IsRefundable || false;

    // Create fare options based on flight data
    const fareOptions = [
      {
        id: `flight-${flightIndex}-standard`,
        type: "Standard Fare",
        price: displayPrice,
        originalPrice: displayPrice,
        isRefundable: isRefundable,
        savings:
          publishedPrice - displayPrice > 0 ? publishedPrice - displayPrice : 0,
        baggage: {
          cabin: flightInfo.flight.cabinBaggage || "7 KG",
          checkin: flightInfo.flight.baggage || "15 KG",
        },
        flexibility: {
          cancellation: isRefundable ? "" : "",
          dateChange: isRefundable ? "" : "",
        },
        amenities: {
          seats: "Standard",
          meals: "Not included",
        },
      },
    ];

    // Add flexi fare option if refundable
    if (isRefundable) {
      fareOptions.push({
        id: `flight-${flightIndex}-flexi`,
        type: "Flexi Fare",
        price: displayPrice * 1.15, // 15% more for flexi
        originalPrice: displayPrice,
        isRefundable: true,
        savings: 0,
        baggage: {
          cabin: "",
          checkin: "",
        },
        flexibility: {
          cancellation: "Free cancellation within 24 hours",
          dateChange: "Free date change",
        },
        amenities: {
          seats: "Preferred",
          meals: "Included",
        },
      });
    }

    return fareOptions;
  };

  // ✅ Handle fare selection for specific flight - FIXED
  const handleFareSelect = (fare, flightIndex) => {
    const newSelectedFares = [...selectedFares];

    // Check if same fare is clicked again
    if (newSelectedFares[flightIndex]?.id === fare.id) {
      return; // Don't deselect, keep it selected
    }

    newSelectedFares[flightIndex] = fare;
    setSelectedFares(newSelectedFares);
  };

  // ✅ Calculate total price for all selected fares - SIMPLIFIED (only adult price)
  const calculateTotalPrice = () => {
    if (selectedFares.length === 0) return 0;

    let total = 0;

    selectedFares.forEach((fare) => {
      if (fare) {
        // सिर्फ adult price को ही जोड़ें, बिना किसी multiplication के
        total += fare.price || fare.originalPrice || 0;
      }
    });

    return total;
  };

  // ✅ Check if all flights have selected fares
  const areAllFaresSelected = () => {
    return selectedFares.every((fare) => fare !== null);
  };

  // ✅ Get total selected flights count
  const getSelectedFlightsCount = () => {
    return selectedFares.filter((fare) => fare !== null).length;
  };

  // ✅ Handle Book Now - SIMPLIFIED
  const handleBookNow = () => {
    if (!areAllFaresSelected()) {
      alert(`Please select fare for all ${flights.length} flight(s)`);
      return;
    }

    // Create flight information for each flight
    const flightInfos = flights.map((flight) => extractFlightInfo(flight));
    const calculatedTotalPrice = calculateTotalPrice();

    // Create final search data
    const finalSearchData = {
      passengers: {
        adults: adults,
        children: children,
        infants: infants,
      },
      tripType: tripType,
      travelClass: travelClass,
      totalPrice: calculatedTotalPrice,
      pricingBreakdown: pricingBreakdown, // Add pricing breakdown from props
      TraceId: searchData?.TraceId,
      origin: searchData?.origin || flightInfos[0]?.origin.city,
      destination:
        searchData?.destination ||
        flightInfos[flightInfos.length - 1]?.destination.city,
      departureDate: searchData?.departureDate || flightInfos[0]?.origin.time,
      returnDate: searchData?.returnDate || null,
    };

    // Create detailed flight segments with selected fares
    const flightSegments = flights.map((flight, index) => {
      const info = extractFlightInfo(flight);
      const selectedFare = selectedFares[index];

      return {
        segmentNumber: index + 1,
        airline: info.airline,
        origin: info.origin,
        destination: info.destination,
        flight: info.flight,
        fare: info.fare,
        displayPrice: getDisplayPrice(flight),
        selectedFare: selectedFare,
        originalFlightData: flight,
        ResultIndex: flight.ResultIndex,
        FlightId: flight.FlightId,
        IsRefundable: flight.IsRefundable,
        FareType: selectedFare?.type || "Standard Fare",
        FarePrice: selectedFare?.price || 0,
      };
    });

    // Create comprehensive checkout data with PRICING DATA
    const checkoutData = {
      // All selected flights data
      selectedFlights: flights,

      // All selected fares
      selectedFares: selectedFares,

      // Search and booking information
      searchData: finalSearchData,

      // Passenger information
      passengerCount: {
        adults: adults,
        children: children,
        infants: infants,
      },

      // ✅ PRICE INFORMATION WITH PRICING BREAKDOWN
      totalPrice: calculatedTotalPrice,
      pricingBreakdown: pricingBreakdown, // This contains commission, GST, etc.

      // Flight details
      flightSegments: flightSegments,

      // Additional information
      tripType: tripType,
      travelClass: travelClass,
      TraceId: searchData?.TraceId,

      // Segment prices
      segmentPrices: flights.map((flight, index) => ({
        flightIndex: index,
        price: selectedFares[index]?.price || 0,
        displayPrice: formatPrice(selectedFares[index]?.price || 0),
      })),

      // Booking summary
      bookingSummary: {
        totalFlights: flights.length,
        selectedFlights: selectedFares.filter((fare) => fare !== null).length,
        totalPassengers: adults + children + infants,
        isRoundTrip: tripType === "round",
        bookingDate: new Date().toISOString(),
      },
    };

    console.log("✅ Checkout Data with Pricing:", checkoutData);

    // Navigate to checkout page with all data
    navigate("/flight-checkout", {
      state: checkoutData,
    });
    onHide();
  };

  // ✅ Render fare option card for specific flight - FIXED
  const renderFareOptionCard = (fare, flightIndex) => {
    if (!fare) return null;

    return (
      <div
        key={fare.id}
        className={`fare-option-card ${
          selectedFares[flightIndex]?.id === fare.id ? "selected" : ""
        }`}
        onClick={() => handleFareSelect(fare, flightIndex)}
        style={{ cursor: "pointer" }}
      >
        <div className="fare-header">
          <div className="fare-price">
            <span className="price-emoji">💬</span>
            <span className="price-amount">₹ {formatPrice(fare.price)}</span>
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

        {fare.savings > 0 && (
          <div className="savings-banner">
            <span className="savings-emoji">💰</span>
            You save ₹{formatPrice(fare.savings)}
          </div>
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

        <div className="selection-indicator">
          {selectedFares[flightIndex]?.id === fare.id ? (
            <div className="selected-tick">✓ SELECTED</div>
          ) : (
            <div className="select-prompt">Click to select</div>
          )}
        </div>
      </div>
    );
  };

  // ✅ Render flight card for specific flight - FIXED
  const renderFlightCard = (flight, index) => {
    const flightInfo = extractFlightInfo(flight);
    if (!flightInfo) return null;

    const fareOptions = generateFareOptions(flight, index);

    return (
      <Card key={index} className="mb-4 flight-card">
        <Card.Body>
          <Row>
            <Col md={4}>
              {/* Flight Summary */}
              <div className="flight-summary">
                <div className="airline-info">
                  <strong>{flightInfo.airline.name}</strong>
                  <small className="text-muted">
                    {" "}
                    ({flightInfo.airline.code}
                    {flightInfo.airline.flightNumber})
                  </small>
                </div>
                <div className="route-info">
                  <div className="departure">
                    <strong>{formatTime(flightInfo.origin.time)}</strong>
                    <div>{flightInfo.origin.code}</div>
                    <small>{flightInfo.origin.city}</small>
                  </div>
                  <div className="duration">
                    <small>{flightInfo.flight.duration}</small>
                    <div className="flight-line">---</div>
                    <small>
                      {flightInfo.flight.stops === 0
                        ? "Non-stop"
                        : `${flightInfo.flight.stops} stop(s)`}
                    </small>
                  </div>
                  <div className="arrival">
                    <strong>{formatTime(flightInfo.destination.time)}</strong>
                    <div>{flightInfo.destination.code}</div>
                    <small>{flightInfo.destination.city}</small>
                  </div>
                </div>
              </div>
            </Col>

            <Col md={8}>
              <div className="fare-options-container">
                <div className="fare-options-grid">
                  {fareOptions.map((fare) => (
                    <div key={fare.id} className="fare-option-column">
                      {renderFareOptionCard(fare, index)}
                    </div>
                  ))}
                </div>

                <div className="fare-rules-section mt-3">
                  <div className="section-title">Fare Rules & Terms</div>
                  {loadingFares[index] ? (
                    <div className="loading-rules">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <p>Loading fare rules...</p>
                    </div>
                  ) : fareDetails[index] ? (
                    <div
                      className="fare-rules-content"
                      dangerouslySetInnerHTML={{ __html: fareDetails[index] }}
                    />
                  ) : (
                    <div className="no-rules">
                      No fare rules available for this flight.
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  if (flights.length === 0) {
    return (
      <Modal show={showModal} onHide={onHide} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="text-center">
            No flight data available.
          </Alert>
        </Modal.Body>
      </Modal>
    );
  }

  const calculatedTotalPrice = calculateTotalPrice();
  const selectedCount = getSelectedFlightsCount();
  const allSelected = areAllFaresSelected();

  return (
    <Modal
      show={showModal}
      onHide={onHide}
      size="xl"
      centered
      scrollable
      className="flight-detail-modal"
      style={{ zIndex: 1060 }}
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="w-100">
          <div className="modal-main-title">
            Flight Details and Fare Options
            {flights.length > 1 && ` (${flights.length} Flights)`}
          </div>

          <div className="flight-segments-summary">
            <Badge bg="info" className="me-2">
              Trip Type: {tripType}
            </Badge>
            <Badge bg={allSelected ? "success" : "warning"} className="me-2">
              {selectedCount}/{flights.length} Flights Selected
            </Badge>
            <small className="text-muted">
              Total: ₹{formatPrice(calculatedTotalPrice)}
            </small>
          </div>

          <div className="passenger-count-display mt-2">
            <small className="text-muted">
              {adults} Adult{adults > 1 ? "s" : ""}
              {children > 0
                ? `, ${children} Child${children > 1 ? "ren" : ""}`
                : ""}
              {infants > 0
                ? `, ${infants} Infant${infants > 1 ? "s" : ""}`
                : ""}
              {tripType
                ? ` · ${
                    tripType.charAt(0).toUpperCase() + tripType.slice(1)
                  } Trip`
                : ""}
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        {/* ✅ Display all flight cards */}
        {flights.map((flight, index) => renderFlightCard(flight, index))}
      </Modal.Body>

      <Modal.Footer className="modal-footer-custom">
        <div className="footer-content w-100">
          <div className="selected-fare-info">
            {allSelected ? (
              <div className="selected-info">
                <strong>✓ All {flights.length} flight(s) selected</strong> -
                Total: ₹{formatPrice(calculatedTotalPrice)}
              </div>
            ) : (
              <div className="no-selection">
                Select fare for all flights to proceed
              </div>
            )}
          </div>
        </div>

        <Button
          className="book-now-main-btn"
          onClick={handleBookNow}
          disabled={!allSelected}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            fontWeight: "bold",
            background: allSelected
              ? "linear-gradient(90deg, #2b87da, #1e63b5)"
              : "#cccccc",
            border: "none",
            borderRadius: "30px",
            color: "white",
          }}
        >
          {allSelected
            ? `BOOK NOW - ₹${formatPrice(calculatedTotalPrice)}`
            : `SELECT ALL FARES (${selectedCount}/${flights.length})`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlightDetail;
