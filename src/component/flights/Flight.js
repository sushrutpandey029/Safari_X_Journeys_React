// src/components/Flight.js
import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Dropdown,
  Spinner,
  Alert,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./Flights.css";
import axios from "axios";
import {
  getIndianAirports,
  Flight_authenticate,
  Flight_search,
} from "../services/flightService";
import { Modal } from "react-bootstrap";
import FlightDetail from "./Flghitdetail";

const Flight = () => {
  // Flight segments (multi-city form)
  const [flights, setFlights] = useState([{ from: "", to: "", date: "" }]);

  useEffect(() => {
    if (!flights[0]?.date) {
      const newFlights = [...flights];
      newFlights[0].date = new Date().toISOString().split("T")[0];
      setFlights(newFlights);
    }
  }, []);

  // Dynamic airports data
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication and search states
  const [token, setToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // User details
  const [userIP, setUserIP] = useState("");
  const [isRefundable, setIsRefundable] = useState(false);
  const [tripType, setTripType] = useState("one way");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");

  // fare rule detaile

  const [showModal, setShowModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null); // Add this state

  // Update the onViewPrices function
  const onViewPrices = (flight) => {
    console.log("flight in view price", flight);
    setSelectedFlight(flight);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFlight(null);
  };
  // Cabin class mapping
  const cabinClassMap = {
    Economy: 1,
    "Premium Economy": 2,
    Business: 3,
    "First Class": 4,
  };

  // Journey type mapping
  const journeyTypeMap = {
    oneway: 1,
    round: 2,
    multi: 3,
  };

  // Fetch user IP, authenticate and get airports - ALL IN ONE FLOW
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get user IP
        const ipResponse = await axios.get("https://api.ipify.org?format=json");
        const userIp = ipResponse.data.ip;
        setUserIP(userIp);
        console.log("✅ Step 1 - User IP:", userIp);

        // Step 2: Authenticate
        const authResponse = await Flight_authenticate(userIp);
        console.log("✅ Step 2 - Auth Response:", authResponse);

        const tokenId = authResponse?.TokenId || authResponse?.data?.TokenId;
        if (!tokenId) throw new Error("No TokenId found in auth response");

        setToken(tokenId);
        console.log("✅ Step 3 - Token saved:", tokenId);

        // Step 4: Fetch airports
        const airportsResponse = await getIndianAirports();
        console.log("✅ Step 4 - Airports Response:", airportsResponse);

        if (airportsResponse?.data) {
          setAirports(airportsResponse.data);
        } else if (Array.isArray(airportsResponse)) {
          setAirports(airportsResponse);
        } else {
          throw new Error("Invalid airports response format");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError(`Initialization failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Custom Airport Dropdown Component
  const AirportDropdown = ({
    value,
    onChange,
    placeholder = "Select Airport",
    type = "from",
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAirports, setFilteredAirports] = useState([]);
    const dropdownRef = useRef(null);

    // Filter airports based on search term
    useEffect(() => {
      if (searchTerm) {
        const filtered = airports.filter((airport) => {
          const city = airport.city_name || "";
          const name = airport.airport_name || "";
          const code = airport.airport_code || "";

          return (
            city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        setFilteredAirports(filtered);
      } else {
        setFilteredAirports(airports.slice(0, 10));
      }
    }, [searchTerm, airports]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleSelect = (airport) => {
      onChange(airport.airport_code);
      setIsOpen(false);
      setSearchTerm("");
    };

    const selectedAirport = airports.find(
      (airport) => airport.airport_code === value
    );

    return (
      <div className="position-relative" ref={dropdownRef}>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={
            isOpen
              ? searchTerm
              : selectedAirport
              ? `${selectedAirport.city_name} (${selectedAirport.airport_code})`
              : ""
          }
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setFilteredAirports(airports.slice(0, 10));
          }}
          className="custom-dropdown-input"
        />

        {isOpen && (
          <div className="custom-dropdown-menu">
            <div className="dropdown-header">
              <small className="text-muted">SUGGESTIONS</small>
            </div>

            {filteredAirports.length > 0 ? (
              filteredAirports.map((airport) => (
                <div
                  key={airport.airport_code}
                  className={`dropdown-item ${
                    value === airport.airport_code ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(airport)}
                >
                  <div className="airport-option">
                    <div className="airport-main">
                      <strong>{airport.city_name}</strong>
                      <span className="airport-code">
                        {airport.airport_code}
                      </span>
                    </div>
                    <div className="airport-name text-muted">
                      {airport.airport_name}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dropdown-item text-muted">
                {loading ? "Loading airports..." : "No airports found"}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderButtons = (count, setter, max = 9) => {
    return (
      <div className="traveller-options">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            className={`traveller-btn ${count === i ? "active" : ""}`}
            onClick={() => setter(i)}
            type="button"
          >
            {i}
          </button>
        ))}
      </div>
    );
  };

  // Toggle states for filters
  const [toggle, setToggle] = useState({
    showProperties: true,
    airlines: false,
    aircraft: false,
    price: false,
    departure: false,
    popular: false,
  });

  const handleToggle = (section) => {
    setToggle((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addCity = () => {
    setFlights([...flights, { from: "", to: "", date: "" }]);
  };

  const removeCity = (index) => {
    if (flights.length > 1) {
      const newFlights = flights.filter((_, i) => i !== index);
      setFlights(newFlights);
    }
  };

  const handleFromChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index].from = value;
    setFlights(newFlights);
  };

  const handleToChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index].to = value;
    setFlights(newFlights);
  };

  // SIMPLIFIED SEARCH FUNCTION - Direct API response use karo
  const searchFlights = async () => {
    if (!token) {
      setSearchError("Please wait while we authenticate...");
      return;
    }

    // Validate form
    for (let flight of flights) {
      if (!flight.from || !flight.to || !flight.date) {
        setSearchError("Please fill all fields");
        return;
      }
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      // Prepare segments for API
      const segments = flights.map((flight) => ({
        Origin: flight.from,
        Destination: flight.to,
        FlightCabinClass: cabinClassMap[travelClass],
        PreferredDepartureTime: `${flight.date}T00:00:00`,
        PreferredArrivalTime: `${flight.date}T00:00:00`,
      }));

      const searchPayload = {
        EndUserIp: userIP,
        TokenId: token,
        AdultCount: adults,
        ChildCount: children,
        InfantCount: infants,
        DirectFlight: false,
        OneStopFlight: false,
        JourneyType: journeyTypeMap[tripType],
        PreferredAirlines: [],
        Segments: segments,
        Sources: ["GDS"],
      };

      console.log("🔍 SEARCH PAYLOAD:", JSON.stringify(searchPayload, null, 2));

      // API call
      const searchResponse = await Flight_search(searchPayload);
      console.log("📨 FULL API RESPONSE:", searchResponse);

      // DIRECT APPROACH: API jo bhi response de raha hai, use directly set karo
      let foundFlights = [];

      // Multiple possible response formats handle karo
      if (searchResponse && searchResponse.data) {
        // Format 1: searchResponse.data.Response.Results
        if (
          searchResponse.data.Response &&
          searchResponse.data.Response.Results
        ) {
          foundFlights = searchResponse.data.Response.Results.flat();
        }
        // Format 2: searchResponse.data.Results
        else if (searchResponse.data.Results) {
          foundFlights = searchResponse.data.Results.flat();
        }
        // Format 3: Direct array
        else if (Array.isArray(searchResponse.data)) {
          foundFlights = searchResponse.data;
        }
        // Format 4: Nested data
        else if (
          searchResponse.data.data &&
          Array.isArray(searchResponse.data.data)
        ) {
          foundFlights = searchResponse.data.data;
        }
      }
      // Direct response check
      else if (Array.isArray(searchResponse)) {
        foundFlights = searchResponse;
      }
      // Response object check
      else if (searchResponse && searchResponse.Results) {
        foundFlights = searchResponse.Results.flat();
      }

      console.log(`🎯 Extracted ${foundFlights.length} flights`);

      if (foundFlights.length > 0) {
        setSearchResults(foundFlights);
        setSearchError(null);
      } else {
        setSearchError(
          "No flights found. Please try different search criteria."
        );
      }
    } catch (error) {
      console.error("💥 SEARCH ERROR:", error);
      setSearchError(error.message || "Failed to search flights");
    } finally {
      setSearchLoading(false);
    }
  };

  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return "08:50";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "08:50";
    }
  };

  // Format duration from minutes
  const formatDuration = (minutes) => {
    if (!minutes) return "02h 50m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // SIMPLIFIED RENDER FUNCTION - Direct API data use karo
  const renderFlightResults = () => {
    console.log("🔍 renderFlightResults called with:", {
      searchLoading,
      searchError,
      resultsCount: searchResults.length,
      searchResults,
    });

    if (searchLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Searching flights...</span>
          </Spinner>
          <p className="mt-2">Searching for the best flights...</p>
        </div>
      );
    }

    if (searchError) {
      return (
        <Alert variant="danger" className="text-center">
          {searchError}
        </Alert>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-5 text-muted">
          <h5>No flights found</h5>
          <p>Try adjusting your search criteria</p>
        </div>
      );
    }

    return searchResults.map((flight, index) => {
      console.log(`✈️ Flight ${index}:`, flight);

      // DIRECT DATA EXTRACTION - API ke structure ke hisab se
      const segments = flight.Segments || [];
      const fareInfo = flight.Fare || {};

      // First segment data
      let segmentData = {};
      if (segments.length > 0) {
        const firstSegment = segments[0];
        segmentData = Array.isArray(firstSegment)
          ? firstSegment[0] || {}
          : firstSegment || {};
      }

      const airlineInfo = segmentData.Airline || {};
      const originInfo = segmentData.Origin || {};
      const destinationInfo = segmentData.Destination || {};

      // Airport details
      const originAirport = originInfo.Airport || {};
      const destinationAirport = destinationInfo.Airport || {};

      // Fare calculation
      const publishedFare = fareInfo.PublishedFare || 0;
      const offeredFare = fareInfo.OfferedFare || publishedFare;
      const savings = publishedFare - offeredFare;

      return (
        <Card key={index} className="shadow-sm p-3 mb-4 rounded-3">
          <Row className="align-items-center">
            {/* Airline Info */}
            <Col md={3} className="d-flex align-items-center">
              <div
                className="bg-light rounded p-2 me-3 d-flex align-items-center justify-content-center"
                style={{ width: "50px", height: "50px" }}
              >
                <strong className="text-primary">
                  {airlineInfo.AirlineCode || "AI"}
                </strong>
              </div>
              <div>
                <h6 className="mb-0">
                  {airlineInfo.AirlineName || "Air India"}
                </h6>
                <small className="text-muted">
                  {airlineInfo.FlightNumber
                    ? `Flight ${airlineInfo.FlightNumber}`
                    : "Flight 2993"}
                </small>
                <br />
                <small
                  className={
                    flight.IsRefundable ? "text-success" : "text-danger"
                  }
                >
                  {flight.IsRefundable ? "🔄 Refundable" : "❌ Non-Refundable"}
                </small>
              </div>
            </Col>

            {/* Departure */}
            <Col md={2} className="text-center">
              <h5 className="mb-0">{formatTime(originInfo.DepTime)}</h5>
              <small className="text-muted">
                {originAirport.AirportCode || "DEL"}
              </small>
              <br />
              <small className="text-muted small">
                {originAirport.CityName || "Delhi"}
              </small>
            </Col>

            {/* Duration */}
            <Col md={2} className="text-center">
              <p className="mb-1 text-success fw-bold">
                {formatDuration(segmentData.Duration)}
              </p>
              <small className="text-muted">
                {segmentData.StopOver ? "With Stop" : "Non stop"}
              </small>
              <br />
              <small className="text-muted small">
                {segmentData.Craft || "32N"}
              </small>
            </Col>

            {/* Arrival */}
            <Col md={2} className="text-center">
              <h5 className="mb-0">{formatTime(destinationInfo.ArrTime)}</h5>
              <small className="text-muted">
                {destinationAirport.AirportCode || "BOM"}
              </small>
              <br />
              <small className="text-muted small">
                {destinationAirport.CityName || "Mumbai"}
              </small>
            </Col>

            {/* Price + Button */}
            <Col md={3} className="text-end">
              <h5 className="fw-bold text-primary">
                ₹ {formatPrice(offeredFare)}
              </h5>
              <small className="text-muted">per adult</small>
              {savings > 0 && (
                <>
                  <br />
                  <small className="text-success small">
                    Save ₹{formatPrice(savings)}
                  </small>
                </>
              )}
              <br />
              <Button
                variant="primary"
                size="sm"
                className="mt-2 rounded-pill px-4"
                onClick={() => onViewPrices(flight)} // ✅ Parent function call
              >
                VIEW PRICES
              </Button>
            </Col>
          </Row>

          {/* Flight Details */}
          <Row className="mt-3">
            <Col>
              <div className="bg-light p-2 rounded-2">
                <small className="text-muted">
                  <strong>Baggage:</strong> {segmentData.Baggage || "15 KG"} •
                  <strong> Cabin:</strong> {segmentData.CabinBaggage || "7 KG"}{" "}
                  •<strong> Class:</strong> {travelClass}
                </small>
              </div>
            </Col>
          </Row>

          {/* Deal */}
          <Row className="mt-2">
            <Col>
              <div className="bg-warning bg-opacity-25 p-2 rounded-2">
                <small className="text-dark">
                  🔴 EXCLUSIVE DEAL: Get FLAT ₹266 OFF using <b>TRYMMT</b> code
                  for you
                </small>
              </div>
            </Col>
          </Row>

          {/* Additional Info */}
          <Row className="mt-2">
            <Col className="text-end">
              <a
                href="#"
                className="text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Flight details:", flight);
                }}
              >
                View Flight Details
              </a>
            </Col>
          </Row>
        </Card>
      );
    });
  };

  return (
    <div>
      {/* Flight Search Form */}
      <div className="flight-section" style={{ marginTop: "110px" }}>
        <div className="search-box rounded shadow-sm flight-form">
          <div className="container">
            {error && <Alert variant="warning">{error}</Alert>}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Initializing application...</span>
              </div>
            )}
            {/* One Row Flight Search Bar */}
            <Row className="align-items-end g-2 mb-3 travellers">
              {/* Trip Type */}
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Trip Type
                  </Form.Label>
                  <Form.Select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    className="form-control"
                  >
                    <option value="oneway">One Way</option>
                    <option value="round">Round Trip</option>
                    <option value="multi">Multi City</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* From */}
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">From</Form.Label>
                  <AirportDropdown
                    value={flights[0].from}
                    onChange={(value) => handleFromChange(0, value)}
                    placeholder="From City"
                    type="from"
                  />
                </Form.Group>
              </Col>

              {/* To */}
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">To</Form.Label>
                  <AirportDropdown
                    value={flights[0].to}
                    onChange={(value) => handleToChange(0, value)}
                    placeholder="To City"
                    type="to"
                  />
                </Form.Group>
              </Col>

              {/* Departure Date */}
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Depart</Form.Label>
                  <DatePicker
                    selected={
                      flights[0]?.date ? new Date(flights[0].date) : new Date() // default: current date
                    }
                    onChange={(date) => {
                      const newFlights = [...flights];
                      newFlights[0].date = date.toISOString().split("T")[0];
                      setFlights(newFlights);
                    }}
                    minDate={new Date()} // can't pick past dates
                    dateFormat="EEE, MMM d, yyyy"
                    className="form-control"
                  />
                </Form.Group>
              </Col>

              {/* Return Date (Only for Round Trip) */}
              {tripType === "round" && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Return
                    </Form.Label>
                    <DatePicker
                      selected={
                        flights[0].returnDate
                          ? new Date(flights[0].returnDate)
                          : flights[0].date
                          ? new Date(flights[0].date)
                          : new Date()
                      }
                      onChange={(date) => {
                        const newFlights = [...flights];
                        newFlights[0].returnDate = date
                          .toISOString()
                          .split("T")[0];
                        setFlights(newFlights);
                      }}
                      minDate={
                        flights[0].date ? new Date(flights[0].date) : new Date()
                      }
                      dateFormat="EEE, MMM d, yyyy"
                      className="form-control"
                      placeholderText="Select Return"
                    />
                  </Form.Group>
                </Col>
              )}

              {/* Travellers */}
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Passengers & Class
                  </Form.Label>
                  <Dropdown className="AddClass" style={{ width: "100%" }}>
                    <Dropdown.Toggle
                      id="travellers-dropdown"
                      variant="light"
                      className="AddClass-toggle"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        textAlign: "left",
                        backgroundColor: "transparent",
                      }}
                    >
                      {adults} Adult{adults > 1 ? "s" : ""},{" "}
                      {travelClass || "Economy"}
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      className="AddClass-menu"
                      style={{ minWidth: "100%" }}
                    >
                      <Row className="p-2">
                        <Col xs={12}>
                          <Form.Label>Adults (12y+)</Form.Label>
                          {renderButtons(adults, setAdults, 9)}
                        </Col>
                        <Col xs={12}>
                          <Form.Label>Children (2y-12y)</Form.Label>
                          {renderButtons(children, setChildren, 6)}
                        </Col>
                        <Col xs={12}>
                          <Form.Label>Infants (below 2y)</Form.Label>
                          {renderButtons(infants, setInfants, 6)}
                        </Col>

                        {/* ✨ Added Flight Class Selection */}
                        <Col xs={12} className="mt-3">
                          <Form.Label>Travel Class</Form.Label>
                          <div className="d-flex flex-wrap gap-2">
                            {["Economy", "Premium", "Business"].map((cls) => (
                              <Button
                                key={cls}
                                variant={
                                  travelClass === cls
                                    ? "primary"
                                    : "outline-secondary"
                                }
                                size="sm"
                                className="rounded-pill"
                                onClick={() => setTravelClass(cls)}
                              >
                                {cls}
                              </Button>
                            ))}
                          </div>
                        </Col>
                      </Row>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>

              {/* Search Button */}
              <Col md={2}>
                <Button
                  className="explore-btn w-100"
                  style={{
                    padding: "10px 16px",
                    fontSize: "16px",
                    background: "linear-gradient(90deg, #2b87da, #1e63b5)",
                    border: "none",
                    borderRadius: "30px",
                    color: "white",
                  }}
                  onClick={searchFlights}
                  disabled={searchLoading || !token || loading}
                >
                  {searchLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </Col>
            </Row>

            {/* Multi City Repeater Section */}
            {tripType === "multi" &&
              flights.map((flight, index) => (
                <Row
                  key={index}
                  className="align-items-end g-2 mb-3 travellers"
                >
                  {/* From */}
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        From
                      </Form.Label>
                      <AirportDropdown
                        value={flight.from}
                        onChange={(value) => handleFromChange(index, value)}
                        placeholder="From City"
                        type="from"
                      />
                    </Form.Group>
                  </Col>

                  {/* To */}
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">To</Form.Label>
                      <AirportDropdown
                        value={flight.to}
                        onChange={(value) => handleToChange(index, value)}
                        placeholder="To City"
                        type="to"
                      />
                    </Form.Group>
                  </Col>

                  {/* Departure Date */}
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Depart
                      </Form.Label>
                      <DatePicker
                        selected={
                          flight.date ? new Date(flight.date) : new Date()
                        }
                        onChange={(date) => {
                          const newFlights = [...flights];
                          newFlights[index].date = date
                            .toISOString()
                            .split("T")[0];
                          setFlights(newFlights);
                        }}
                        minDate={new Date()}
                        dateFormat="EEE, MMM d, yyyy"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>

                  {/* Add / Remove City Buttons */}
                  <Col md={2} className="d-flex gap-2">
                    {index === flights.length - 1 ? (
                      <Button
                        variant="outline-primary"
                        className="rounded-pill"
                        onClick={() =>
                          setFlights([
                            ...flights,
                            {
                              from: "",
                              to: "",
                              date: new Date().toISOString().split("T")[0],
                            },
                          ])
                        }
                      >
                        + Add City
                      </Button>
                    ) : (
                      <Button
                        variant="outline-danger"
                        className="rounded-pill,"
                        onClick={() => {
                          const newFlights = flights.filter(
                            (_, i) => i !== index
                          );
                          setFlights(newFlights);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
          </div>
        </div>
      </div>

      <div className="container py-5">
        <Row>
          {/* Filter Sidebar */}
          <Col sm={3}>
            <div className="filter-box p-3 border rounded shadow-sm">
              <h5 className="mb-3 fw-bold">FILTER</h5>

              {/* Show Properties With */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("showProperties")}
                >
                  <span>Show Properties With</span>
                  <FontAwesomeIcon
                    icon={toggle.showProperties ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.showProperties && (
                  <div className="filter-options mt-2">
                    {[
                      "Book With ₹0",
                      "Free Cancellation",
                      "Free Breakfast",
                      "Pay at Hotel",
                    ].map((label, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`spw${i}`}
                        />
                        <label className="form-check-label" htmlFor={`spw${i}`}>
                          {label}
                        </label>
                      </div>
                    ))}
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="refundable"
                        checked={isRefundable}
                        onChange={() => setIsRefundable(!isRefundable)}
                      />
                      <label className="form-check-label" htmlFor="refundable">
                        Refundable Only
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Airlines */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("airlines")}
                >
                  <span>Airlines</span>
                  <FontAwesomeIcon
                    icon={toggle.airlines ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.airlines && (
                  <div className="filter-options mt-2">
                    {[
                      "IndiGo [120]",
                      "Air India [80]",
                      "SpiceJet [70]",
                      "Vistara [60]",
                    ].map((label, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`airline${i}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`airline${i}`}
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Aircraft Size */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("aircraft")}
                >
                  <span>Aircraft Size</span>
                  <FontAwesomeIcon
                    icon={toggle.aircraft ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.aircraft && (
                  <div className="filter-options mt-2">
                    {["Small", "Medium", "Large", "Wide-body"].map(
                      (label, i) => (
                        <div className="form-check" key={i}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`aircraft${i}`}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`aircraft${i}`}
                          >
                            {label}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* One-way Price */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("price")}
                >
                  <span>One-way Price</span>
                  <FontAwesomeIcon
                    icon={toggle.price ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.price && (
                  <div className="filter-options mt-2">
                    {[
                      "< ₹2000",
                      "₹2000 - ₹5000",
                      "₹5000 - ₹10000",
                      "> ₹10000",
                    ].map((label, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`price${i}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`price${i}`}
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Departure Time */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("departure")}
                >
                  <span>Departure Time</span>
                  <FontAwesomeIcon
                    icon={toggle.departure ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.departure && (
                  <div className="filter-options mt-2">
                    {[
                      "Early Morning (00:00-06:00)",
                      "Morning (06:00-12:00)",
                      "Afternoon (12:00-18:00)",
                      "Evening (18:00-24:00)",
                    ].map((label, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`departure${i}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`departure${i}`}
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Filters */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("popular")}
                >
                  <span>Popular Filters</span>
                  <FontAwesomeIcon
                    icon={toggle.popular ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.popular && (
                  <div className="filter-options mt-2">
                    {[
                      "Non-stop Flights",
                      "Refundable Only",
                      "Premium Airlines",
                      "Short Duration",
                    ].map((label, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`popular${i}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`popular${i}`}
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Flight Results Section */}
          <Col sm={9}>{renderFlightResults()}</Col>
        </Row>
      </div>
      {/* Flight Detail Modal */}
      <FlightDetail
        flightData={selectedFlight}
        travelClass={travelClass}
        showModal={showModal}
        onHide={handleCloseModal}
      />
    </div>
  );
};

export default Flight;
