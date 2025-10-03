// src/components/Flight.js
import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col, Card, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./Flights.css";
import { getIndianAirports } from "../services/flightService";
import axios from "axios";

const Flight = () => {
  // Flight segments (multi-city form)
  const [flights, setFlights] = useState([
    { from: "", to: "", date: "2025-09-16" },
  ]);

  // Dynamic airports data - API se fetch hoga
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRefundable, setIsRefundable] = useState(false);
  const [travellers, setTravellers] = useState(1);
  const [tripType, setTripType] = useState("multi");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");

  // Fetch airports data from API
 // Fetch airports data from API
useEffect(() => {
  const fetchAirports = async () => {
    try {
      const response = await axios.get(
        "http://192.168.1.15:2625/flight/getIndianAirports"
      );

      console.log("response in fetch airports", response);

      if (response.data && response.data.status && response.data.data) {
        setAirports(response.data.data); // ✅ Yahan airports state update karna hai
      }
    } catch (error) {
      console.log("Error fetching airports in file:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAirports();
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
        const filtered = airports.filter(
          (airport) =>
            airport.city_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            airport.airport_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            airport.airport_code
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
        setFilteredAirports(filtered);
      } else {
        setFilteredAirports(airports.slice(0, 10)); // Show first 10 by default
      }
    }, [searchTerm, airports]);

    // Close dropdown when clicking outside
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
    setFilteredAirports(airports.slice(0, 10)); // Show first 10 by default
  }
}, [searchTerm, airports]);


    const handleSelect = (airport) => {
      onChange(airport.airport_code);
      setIsOpen(false);
      setSearchTerm("");
    };

    const selectedAirport = airports.find(
      (airport) => airport.airport_code === value
    );

    // Get nearby airports for Delhi (example)
    const getNearbyAirports = () => {
      return [
        {
          airport_code: "DEL",
          city_name: "New Delhi",
          airport_name: "Indira Gandhi International Airport",
        },
        {
          airport_code: "GWL",
          city_name: "Gwalior",
          airport_name: "Gwalior Airport",
        },
        {
          airport_code: "JDH",
          city_name: "Johdpur",
          airport_name: "Johdpur Airport",
        },
      ];
    };

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
            {/* Search Header */}
            <div className="dropdown-header">
              <small className="text-muted">SUGGESTIONS</small>
            </div>

            {/* Filtered Airport Results */}
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
              <div className="dropdown-item text-muted">No airports found</div>
            )}

            {/* Nearby Airports Section */}
            {type === "from" && searchTerm.toLowerCase().includes("delhi") && (
              <>
                <div className="dropdown-header mt-2">
                  <small className="text-muted">
                    3 Nearby Airports found | within 200 km
                  </small>
                </div>
                {getNearbyAirports().map((airport) => (
                  <div
                    key={airport.airport_code}
                    className="dropdown-item"
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
                ))}
              </>
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

  // Toggle states for filters (object)
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
    const newFlights = flights.filter((_, i) => i !== index);
    setFlights(newFlights);
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

  const searchFlights = () => {
    console.log("Search button clicked!");
  };

  return (
    <div>
      {/* 🔹 Flight Search Form */}
      <div className="flight-section" style={{ marginTop: "110px" }}>
        <div className=" search-box  rounded shadow-sm flight-form ">
          <div className="container">
            <div className=" d-flex gap-3 mb-3">
              <Form.Check
                type="radio"
                label="One Way"
                name="tripType"
                checked={tripType === "oneway"}
                onChange={() => setTripType("oneway")}
              />
              <Form.Check
                type="radio"
                label="Round Trip"
                name="tripType"
                checked={tripType === "round"}
                onChange={() => setTripType("round")}
              />
              <Form.Check
                type="radio"
                label="Multi City"
                name="tripType"
                checked={tripType === "multi"}
                onChange={() => setTripType("multi")}
              />
            </div>

            {/* Flight Segments */}
            {flights.map((flight, index) => (
              <Row className="align-items-end mb-3" key={index}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>From</Form.Label>
                    <AirportDropdown
                      value={flight.from}
                      onChange={(value) => handleFromChange(index, value)}
                      placeholder="From City"
                      type="from"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>To</Form.Label>
                    <AirportDropdown
                      value={flight.to}
                      onChange={(value) => handleToChange(index, value)}
                      placeholder="To City"
                      type="to"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Departure</Form.Label>
                    <Form.Control
                      type="date"
                      value={flight.date}
                      onChange={(e) => {
                        const newFlights = [...flights];
                        newFlights[index].date = e.target.value;
                        setFlights(newFlights);
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Add / Remove Button */}
                <Col md={3}>
                  {index === flights.length - 1 ? (
                    <Button className="explore-btn" onClick={addCity}>
                      + Add Another City
                    </Button>
                  ) : (
                    <Button
                      className="explore-btn"
                      variant="outline-danger"
                      onClick={() => removeCity(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Col>
              </Row>
            ))}

            {/* Travellers & Class */}
            <Row className="g-3">
              {/* Travellers Dropdown */}
              <Col md={3}>
                <Dropdown style={{ width: "100%" }}>
                  <Dropdown.Toggle
                    id="travellers-dropdown"
                    variant="light"
                    style={{ width: "100%", padding: "10px 16px" }}
                  >
                    Travellers: {adults + children + infants}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ minWidth: "100%" }}>
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
                    </Row>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              {/* Class Dropdown */}
              <Col md={3}>
                <Dropdown style={{ width: "100%" }}>
                  <Dropdown.Toggle
                    id="class-dropdown"
                    variant="light"
                    style={{ width: "100%", padding: "10px 16px" }}
                  >
                    Class: {travelClass}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ minWidth: "100%" }}>
                    <Dropdown.Item onClick={() => setTravelClass("Economy")}>
                      Economy
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setTravelClass("Premium Economy")}
                    >
                      Premium Economy
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setTravelClass("Business")}>
                      Business
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setTravelClass("First Class")}
                    >
                      First Class
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              {/* Search Button */}
              <Col md={3}>
                <Button
                  className="explore-btn"
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    fontSize: "16px",
                    backgroundColor: "#274a62",
                  }}
                  onClick={searchFlights}
                >
                  Search
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <Row>
          {/* ===== Filter Sidebar ===== */}
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

          {/* ===== Flight Details Section ===== */}
          <Col sm={9}>
            <Card className="shadow-sm p-3 mb-4 rounded-3">
              <Row className="align-items-center">
                {/* Airline Info */}
                <Col md={3} className="d-flex align-items-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Air_India_Express_logo.svg/512px-Air_India_Express_logo.svg.png"
                    alt="Airline Logo"
                    style={{ width: "40px", marginRight: "10px" }}
                  />
                  <div>
                    <h6 className="mb-0">Air India Express</h6>
                    <small className="text-muted">IX 1971</small>
                  </div>
                </Col>

                {/* Departure */}
                <Col md={3} className="text-center">
                  <h5 className="mb-0">08:50</h5>
                  <small className="text-muted">Ghaziabad</small>
                  <br />
                  <small className="text-muted">(32 KM from New Delhi)</small>
                </Col>

                {/* Duration */}
                <Col md={2} className="text-center">
                  <p className="mb-1 text-success fw-bold">02 h 50 m</p>
                  <small className="text-muted">Non stop</small>
                </Col>

                {/* Arrival */}
                <Col md={2} className="text-center">
                  <h5 className="mb-0">11:40</h5>
                  <small className="text-muted">Bengaluru</small>
                </Col>

                {/* Price + Button */}
                <Col md={2} className="text-end">
                  <h5 className="fw-bold">₹ 5,509</h5>
                  <small className="text-muted">per adult</small>
                  <br />
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2 rounded-pill"
                  >
                    VIEW PRICES
                  </Button>
                </Col>
              </Row>

              {/* Lock Price */}
              <Row className="mt-3">
                <Col>
                  <div className="d-flex align-items-center bg-light p-2 rounded-2">
                    <span className="me-2 text-primary">🔒</span>
                    <small className="text-primary">
                      Lock this price starting from ₹496
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Deal */}
              <Row className="mt-2">
                <Col>
                  <div className="bg-warning bg-opacity-25 p-2 rounded-2">
                    <small className="text-dark">
                      🔴 EXCLUSIVE DEAL: Get FLAT ₹266 OFF using <b>TRYMMT</b>{" "}
                      code for you
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Details Link */}
              <Row className="mt-2">
                <Col className="text-end">
                  <a href="#" className="text-primary">
                    View Flight Details
                  </a>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Flight;
