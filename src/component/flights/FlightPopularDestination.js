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
import "./Flights.css";
import axios from "axios";
import { getIndianAirports } from "../services/flightService";
import { useNavigate } from "react-router-dom";

function FlightPopularDestination() {
  const navigate = useNavigate();

  // Flight search state
  const [flights, setFlights] = useState([
    {
      from: "DEL",
      to: "BOM",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      returnDate: "",
    },
  ]);

  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tripType, setTripType] = useState("oneway");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Popular destinations
  const popularDestinations = [
    { code: "BOM", city: "Mumbai", image: "/Images/dharamshala.jpg" },
    { code: "CCU", city: "Kolkata", image: "/Images/dharamshala.jpg" },
    { code: "MAA", city: "Chennai", image: "/Images/dharamshala.jpg" },
    { code: "HYD", city: "Hyderabad", image: "/Images/dharamshala.jpg" },
    { code: "CMB", city: "Colombo", image: "/Images/dharamshala.jpg" },
    { code: "PEK", city: "Beijing", image: "/Images/dharamshala.jpg" },
    { code: "EWR", city: "New York", image: "/Images/dharamshala.jpg" },
    { code: "LCY", city: "London", image: "/Images/dharamshala.jpg" },
  ];

  // Initialize airports data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user IP
        const ipResponse = await axios.get("https://api.ipify.org?format=json");

        // Fetch airports data dynamically
        const airportsResponse = await getIndianAirports();

        if (airportsResponse?.data && Array.isArray(airportsResponse.data)) {
          const airportsData = airportsResponse.data;
          setAirports(airportsData);

          // Cache airports data
          localStorage.setItem("airportsCache", JSON.stringify(airportsData));
          localStorage.setItem("airportsCacheTimestamp", Date.now().toString());
        } else if (Array.isArray(airportsResponse)) {
          setAirports(airportsResponse);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError(`Initialization failed: ${error.message}`);

        // Load from cache if available
        try {
          const cachedData = localStorage.getItem("airportsCache");
          if (cachedData) {
            setAirports(JSON.parse(cachedData));
          }
        } catch (cacheError) {
          console.error("Cache load error:", cacheError);
        }
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Check if route is domestic
  const checkIfDomestic = (origin, destination) => {
    if (!airports || airports.length === 0) return false;

    const normalizedOrigin = origin?.toUpperCase().trim();
    const normalizedDest = destination?.toUpperCase().trim();

    const originAirport = airports.find(
      (a) => a.airport_code === normalizedOrigin,
    );
    const destinationAirport = airports.find(
      (a) => a.airport_code === normalizedDest,
    );

    if (!originAirport || !destinationAirport) return false;

    const isIndian = (airport) => {
      return (
        airport.country_code === "IN" ||
        airport.country_name?.toLowerCase().includes("india")
      );
    };

    return isIndian(originAirport) && isIndian(destinationAirport);
  };

  // Handle search button click - Navigate to flight page
  const handleSearch = () => {
    // Validate form
    for (let flight of flights) {
      if (!flight.from || !flight.to || !flight.date) {
        setError("Please fill all fields");
        return;
      }
    }

    if (tripType === "round" && !flights[0].returnDate) {
      setError("Please select return date for round trip");
      return;
    }

    setSearchLoading(true);

    // Prepare search data for navigation
    const searchData = {
      tripType,
      flights: flights.map((flight) => ({
        from: flight.from,
        to: flight.to,
        date: flight.date,
        returnDate: flight.returnDate,
      })),
      passengers: {
        adults,
        children,
        infants,
      },
      travelClass,
      isDomestic: checkIfDomestic(flights[0].from, flights[0].to),
    };

    // Navigate to flight page with state
    navigate("/flight", { state: searchData });
  };

  // Handle popular destination click
  const handleDestinationClick = (dest) => {
    const updatedFlights = [{ ...flights[0], to: dest.code }];

    const searchData = {
      tripType: "oneway", // Default to oneway for popular destinations
      flights: updatedFlights,
      passengers: {
        adults,
        children,
        infants,
      },
      travelClass,
      isDomestic: checkIfDomestic(flights[0].from, dest.code),
    };

    navigate("/flight", { state: searchData });
  };

  // Add city for multi-city
  const addCity = () => {
    if (flights.length >= 4) {
      alert("Maximum 4 cities allowed for multi-city trip");
      return;
    }

    const lastFlight = flights[flights.length - 1];
    const newFlight = {
      from: lastFlight.to || "",
      to: "",
      date: lastFlight.date || new Date().toISOString().split("T")[0],
    };
    setFlights([...flights, newFlight]);
  };

  // Remove city for multi-city
  const removeCity = (index) => {
    if (flights.length > 1) {
      const newFlights = flights.filter((_, i) => i !== index);
      setFlights(newFlights);
    }
  };

  // Custom Airport Dropdown Component
  const AirportDropdown = ({
    value,
    onChange,
    placeholder = "Select Airport",
    disabled = false,
    type = "from",
    segmentIndex = 0,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAirports, setFilteredAirports] = useState([]);
    const dropdownRef = useRef(null);

    // Get airports to exclude (same segment opposite field)
    const getExcludedAirports = () => {
      const excluded = new Set();
      const currentFlight = flights[segmentIndex];
      if (currentFlight) {
        if (type === "from" && currentFlight.to) {
          excluded.add(currentFlight.to);
        } else if (type === "to" && currentFlight.from) {
          excluded.add(currentFlight.from);
        }
      }
      return excluded;
    };

    useEffect(() => {
      const filterAirports = () => {
        const excludedAirports = getExcludedAirports();
        let filtered = airports;

        // Apply search filter
        if (searchTerm.trim()) {
          const search = searchTerm.toLowerCase();
          filtered = airports.filter((airport) => {
            const city = airport.city_name?.toLowerCase() || "";
            const airportName = airport.airport_name?.toLowerCase() || "";
            const airportCode = airport.airport_code?.toLowerCase() || "";
            const countryName = airport.country_name?.toLowerCase() || "";

            return (
              city.includes(search) ||
              airportName.includes(search) ||
              airportCode.includes(search) ||
              countryName.includes(search)
            );
          });
        }

        // Apply exclusion filter
        filtered = filtered.filter(
          (airport) => !excludedAirports.has(airport.airport_code),
        );

        return filtered.slice(0, 15);
      };

      const results = filterAirports();
      setFilteredAirports(results);
    }, [searchTerm, airports, flights, segmentIndex, type]);

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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (airport) => {
      onChange(airport.airport_code);
      setIsOpen(false);
      setSearchTerm("");
    };

    const selectedAirport = airports.find(
      (airport) => airport.airport_code === value,
    );

    const displayValue = isOpen
      ? searchTerm
      : selectedAirport
        ? `${selectedAirport.city_name} (${selectedAirport.airport_code})`
        : "";

    return (
      <div className="position-relative" ref={dropdownRef}>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (disabled) return;
            setIsOpen(true);
            const excludedAirports = getExcludedAirports();
            const availableAirports = airports.filter(
              (airport) => !excludedAirports.has(airport.airport_code),
            );
            setFilteredAirports(availableAirports.slice(0, 15));
          }}
          className="custom-dropdown-input"
          disabled={disabled}
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
                      <strong>{`${airport.city_name}, ${airport.country_name}`}</strong>
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
                {loading ? "Loading airports..." : "No airports available"}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render traveller buttons
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

  // Handle trip type change
  const handleTripTypeChange = (newTripType) => {
    setTripType(newTripType);
    setError(null);

    if (newTripType === "multi") {
      if (flights.length === 1) {
        setFlights([
          flights[0],
          {
            from: flights[0].to || "",
            to: "",
            date: flights[0].date || new Date().toISOString().split("T")[0],
          },
        ]);
      }
    } else {
      setFlights([flights[0]]);
    }
  };

  return (
    <div className="container">
      {/* Flight Search Form */}
      <div className="flight-section" style={{ marginTop: "98px" }}>
        <div className="search-box rounded shadow-sm flight-form">
          <div className="container">
            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {loading && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Loading airports...</span>
              </div>
            )}

            <Row className="align-items-end g-2 mb-3 travellers justify-content-center">
              <Col md={12} className="mb-4 tabing-section">
                {/* <Form.Group>
                  <Form.Label className="fw-semibold small">Trip Type</Form.Label>
                  <Form.Select
                    value={tripType}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="form-control"
                    disabled={isInitialLoading}
                  >
                    <option value="oneway">One Way</option>
                    <option value="round">Round Trip</option>
                    <option value="multi">Multi City</option>
                  </Form.Select>
                </Form.Group> */}
                <Form.Group>
                  <div className="trip-tabs text-center">
                    <button
                      type="button"
                      className={`trip-tab ${tripType === "oneway" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("oneway")}
                      disabled={isInitialLoading || searchLoading}
                    >
                      <i class="bi bi-airplane"></i> One Way
                    </button>

                    <button
                      type="button"
                      className={`trip-tab ${tripType === "round" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("round")}
                      disabled={isInitialLoading || searchLoading}
                    >
                      <i class="bi bi-arrow-left-right"></i> Round Trip
                    </button>

                    <button
                      type="button"
                      className={`trip-tab ${tripType === "multi" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("multi")}
                      disabled={isInitialLoading || searchLoading}
                    >
                      <i class="bi bi-signpost-split"></i> Multi City
                    </button>
                  </div>
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">From</Form.Label>
                  <AirportDropdown
                    value={flights[0].from}
                    onChange={(value) => {
                      const newFlights = [...flights];
                      newFlights[0].from = value;
                      setFlights(newFlights);
                    }}
                    placeholder="From City"
                    type="from"
                    segmentIndex={0}
                    disabled={isInitialLoading}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">To</Form.Label>
                  <AirportDropdown
                    value={flights[0].to}
                    onChange={(value) => {
                      const newFlights = [...flights];
                      newFlights[0].to = value;
                      setFlights(newFlights);
                    }}
                    placeholder="To City"
                    type="to"
                    segmentIndex={0}
                    disabled={isInitialLoading}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
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
                    disabled={isInitialLoading}
                  />
                </Form.Group>
              </Col>

              {tripType === "round" && (
                <Col xs={6} md={2}>
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
                      disabled={isInitialLoading}
                    />
                  </Form.Group>
                </Col>
              )}

              <Col xs={6} sm={2} md={tripType === "round" ? 2 : 2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Passengers & Class
                  </Form.Label>
                  <Dropdown
                    className="AddClass"
                    style={{ width: "100%" }}
                    show={showTravellerDropdown}
                    onToggle={(isOpen) => setShowTravellerDropdown(isOpen)}
                  >
                    <Dropdown.Toggle
                      id="travellers-dropdown"
                      variant="light"
                      className="AddClass-toggle form-control"
                      disabled={isInitialLoading}
                    >
                      {adults} Adult{adults > 1 ? "s" : ""}, {travelClass}
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

                        <Col xs={12} className="mt-3">
                          <Form.Label>Travel Class</Form.Label>
                          <div className="d-flex flex-wrap gap-2">
                            {[
                              "Economy",
                              "Premium Economy",
                              "Business",
                              "First Class",
                            ].map((cls) => (
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
                      <Button
                        variant="primary"
                        className="w-100 mt-3"
                        onClick={() => setShowTravellerDropdown(false)}
                      >
                        Done
                      </Button>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
                <Button
                  type="button"
                  className="explore-flight-btn w-100"
                  onClick={handleSearch}
                  disabled={searchLoading || loading || isInitialLoading}
                >
                  {searchLoading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2 spinner-white"
                      />
                      Searching...
                    </>
                  ) : (
                    "Search Flights"
                  )}
                </Button>
              </Col>
            </Row>

            {/* Multi-city additional rows */}
            {tripType === "multi" &&
              flights.slice(1).map((flight, index) => {
                const actualIndex = index + 1;

                return (
                  <Row
                    key={actualIndex}
                    className="align-items-end g-2 mb-3 travellers justify-content-center"
                  >
                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">
                          From
                        </Form.Label>
                        <AirportDropdown
                          value={flight.from}
                          onChange={(value) => {
                            const updatedFlights = [...flights];
                            updatedFlights[actualIndex] = {
                              ...updatedFlights[actualIndex],
                              from: value,
                            };
                            setFlights(updatedFlights);
                          }}
                          placeholder="From City"
                          type="from"
                          segmentIndex={actualIndex}
                          disabled={isInitialLoading}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">
                          To
                        </Form.Label>
                        <AirportDropdown
                          value={flight.to}
                          onChange={(value) => {
                            const updatedFlights = [...flights];
                            updatedFlights[actualIndex] = {
                              ...updatedFlights[actualIndex],
                              to: value,
                            };
                            setFlights(updatedFlights);
                          }}
                          placeholder="To City"
                          type="to"
                          segmentIndex={actualIndex}
                          disabled={isInitialLoading}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">
                          Depart
                        </Form.Label>
                        <DatePicker
                          selected={flight.date ? new Date(flight.date) : null}
                          onChange={(date) => {
                            const updatedFlights = [...flights];
                            updatedFlights[actualIndex] = {
                              ...updatedFlights[actualIndex],
                              date: date
                                ? date.toISOString().split("T")[0]
                                : null,
                            };
                            setFlights(updatedFlights);
                          }}
                          minDate={
                            flights[actualIndex - 1]?.date
                              ? new Date(flights[actualIndex - 1].date)
                              : new Date()
                          }
                          dateFormat="EEE, MMM d, yyyy"
                          className="form-control"
                          disabled={isInitialLoading}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={2} className="d-flex align-items-center gap-2">
                      {actualIndex > 0 && (
                        <Button
                          variant="outline-danger"
                          className="rounded-pill"
                          onClick={() => removeCity(actualIndex)}
                        >
                          Remove
                        </Button>
                      )}

                      {actualIndex === flights.length - 1 &&
                        flights.length < 4 && (
                          <Button
                            variant="outline-primary"
                            className="rounded-pill"
                            onClick={addCity}
                          >
                            Add City
                          </Button>
                        )}
                    </Col>
                  </Row>
                );
              })}
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="row mt-5">
        <h2>
          Popular Flights from <span>Delhi</span>
        </h2>

        {popularDestinations.map((dest, index) => (
          <div key={index} className="col-md-3 col-6 mb-4">
            <div
              className="destination-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleDestinationClick(dest)}
            >
              <img src={dest.image} className="img-fluid" alt={dest.city} />
              <div className="card-destination">Delhi → {dest.city}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlightPopularDestination;
