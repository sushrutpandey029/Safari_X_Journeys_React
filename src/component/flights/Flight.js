// src/components/Flight.js
import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "./Flights.css";

const Flight = () => {
  // Flight segments (multi-city form)
  const [flights, setFlights] = useState([
    { from: "Delhi", to: "Bengaluru", date: "2025-09-16" },
    { from: "Bengaluru", to: "Mumbai", date: "2025-10-15" },
  ]);

  const [isRefundable, setIsRefundable] = useState(false);
  const [travellers, setTravellers] = useState(1);
  const [tripType, setTripType] = useState("multi");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");

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
    star: true,
    review: true,
    amenities: true,
  });

  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addCity = () => {
    setFlights([...flights, { from: "", to: "", date: "" }]);
  };

  const removeCity = (index) => {
    const newFlights = flights.filter((_, i) => i !== index);
    setFlights(newFlights);
  };

  const searchFlights = () => {
    console.log("Search button clicked!");
  };

  return (
    <div>
      {/* 🔹 Flight Search Form */}

      <div className="flight-section">
          <div className="container search-box rounded shadow-sm flight-form">
            <div className="d-flex gap-3 mb-3">
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
                    <Form.Control
                      type="text"
                      placeholder="From City"
                      value={flight.from}
                      onChange={(e) => {
                        const newFlights = [...flights];
                        newFlights[index].from = e.target.value;
                        setFlights(newFlights);
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>To</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="To City"
                      value={flight.to}
                      onChange={(e) => {
                        const newFlights = [...flights];
                        newFlights[index].to = e.target.value;
                        setFlights(newFlights);
                      }}
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
                    style={{ width: "100%", padding: "10px 16px" }} // toggle size bada
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
                    style={{ width: "100%", padding: "10px 16px" }} // toggle size bada
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
                  onClick={searchFlights} // tumhara existing search function
                >
                  Search
                </Button>
              </Col>
            </Row>
          </div>
        </div>
    

  
        <div className="container py-5">
        <div className="col-sm-3">
          <div className="filter-box p-3 border rounded shadow-sm">
            <h5 className="mb-3 fw-bold">FILTER</h5>
            {/* Show Properties With */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("showProperties")}
                style={{ cursor: "pointer" }}
              >
                <span>Show Properties With</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.showProperties ? faChevronUp : faChevronDown}
                  />
                </span>
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
                      checked={isRefundable}
                      onChange={(e) => setIsRefundable(e.target.checked)}
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
                onClick={() => handleToggle("airlines")}
                style={{ cursor: "pointer" }}
              >
                <span>Airlines</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.airlines ? faChevronUp : faChevronDown}
                  />
                </span>
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
                onClick={() => handleToggle("aircraft")}
                style={{ cursor: "pointer" }}
              >
                <span>Aircraft Size</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.aircraft ? faChevronUp : faChevronDown}
                  />
                </span>
              </div>
              {toggle.aircraft && (
                <div className="filter-options mt-2">
                  {["Small", "Medium", "Large", "Wide-body"].map((label, i) => (
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
                  ))}
                </div>
              )}
            </div>

            {/* One-way Price */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("price")}
                style={{ cursor: "pointer" }}
              >
                <span>One-way Price</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.price ? faChevronUp : faChevronDown}
                  />
                </span>
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
                      <label className="form-check-label" htmlFor={`price${i}`}>
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
                onClick={() => handleToggle("departure")}
                style={{ cursor: "pointer" }}
              >
                <span>Departure Time</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.departure ? faChevronUp : faChevronDown}
                  />
                </span>
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
                onClick={() => handleToggle("popular")}
                style={{ cursor: "pointer" }}
              >
                <span>Popular Filters</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.popular ? faChevronUp : faChevronDown}
                  />
                </span>
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
        </div>
      </div>

    </div>
   
  );
};

export default Flight;
