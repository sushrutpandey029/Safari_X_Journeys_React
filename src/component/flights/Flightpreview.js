import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Dropdown,
  Spinner,
  Alert,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import {
  getIndianAirports,
  Flight_authenticate,
} from "../services/flightService";
import "./Flights.css";

const Flightpreview = ({ 
  onSearch, 
  initialData = {},
  showTopRoutes = false 
}) => {
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

  // Authentication state
  const [token, setToken] = useState(null);

  // User details
  const [userIP, setUserIP] = useState("");
  const [tripType, setTripType] = useState("oneway");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");

  // Cabin class mapping
  const cabinClassMap = {
    Economy: 1,
    "Premium Economy": 2,
    Business: 3,
    "First Class": 4,
  };

  // Initial data set karein
  useEffect(() => {
    if (initialData.flights) {
      setFlights(initialData.flights);
    }
    if (initialData.tripType) {
      setTripType(initialData.tripType);
    }
    if (initialData.adults) {
      setAdults(initialData.adults);
    }
    if (initialData.children) {
      setChildren(initialData.children);
    }
    if (initialData.infants) {
      setInfants(initialData.infants);
    }
    if (initialData.travelClass) {
      setTravelClass(initialData.travelClass);
    }
    if (initialData.token) {
      setToken(initialData.token);
    }
    if (initialData.userIP) {
      setUserIP(initialData.userIP);
    }
  }, [initialData]);

  // Fetch user IP, authenticate and get airports
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get user IP
        const ipResponse = await axios.get("https://api.ipify.org?format=json");
        const userIp = ipResponse.data.ip;
        setUserIP(userIp);

        // Step 2: Authenticate
        const authResponse = await Flight_authenticate(userIp);
        const tokenId = authResponse?.TokenId || authResponse?.data?.TokenId;
        if (!tokenId) throw new Error("No TokenId found in auth response");

        setToken(tokenId);

        // Step 3: Fetch airports
        const airportsResponse = await getIndianAirports();
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

  // Search function
  const handleSearch = () => {
    if (!token) {
      setError("Please wait while we authenticate...");
      return;
    }

    // Validate form
    for (let flight of flights) {
      if (!flight.from || !flight.to || !flight.date) {
        setError("Please fill all fields");
        return;
      }
    }

    // Prepare search data
    const searchData = {
      flights: flights,
      tripType: tripType,
      adults: adults,
      children: children,
      infants: infants,
      travelClass: travelClass,
      token: token,
      userIP: userIP,
      cabinClass: cabinClassMap[travelClass],
    };

    // Parent component ko data pass karein
    if (onSearch) {
      onSearch(searchData);
    }
  };

  return (
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
                    flights[0]?.date ? new Date(flights[0].date) : new Date()
                  }
                  onChange={(date) => {
                    const newFlights = [...flights];
                    newFlights[0].date = date.toISOString().split("T")[0];
                    setFlights(newFlights);
                  }}
                  minDate={new Date()}
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
                      newFlights[0].returnDate = date.toISOString().split("T")[0];
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

                      {/* Flight Class Selection */}
                      <Col xs={12} className="mt-3">
                        <Form.Label>Travel Class</Form.Label>
                        <div className="d-flex flex-wrap gap-2">
                          {["Economy", "Premium Economy", "Business", "First Class"].map((cls) => (
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
                onClick={handleSearch}
                disabled={loading || !token}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading...
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
                        newFlights[index].date = date.toISOString().split("T")[0];
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
                      className="rounded-pill"
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
  );
};

export default Flightpreview;