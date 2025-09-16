// src/components/Flight.js
import React, { useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const Flight = () => {
  // Flight segments (multi-city form)
  const [flights, setFlights] = useState([
    { from: "Delhi", to: "Bengaluru", date: "2025-09-16" },
    { from: "Bengaluru", to: "Mumbai", date: "2025-10-15" },
  ]);

  const [isRefundable, setIsRefundable] = useState(false);
  const [travellers, setTravellers] = useState(1);
  const [tripType, setTripType] = useState("multi");

  // Toggle states for filters (object)
  const [toggle, setToggle] = useState({
    showProperties: false,
    star: false,
    review: false,
    amenities: false,
  });

  // Handle filter section toggle
  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Add & Remove multi-city fields
  const addCity = () => {
    setFlights([...flights, { from: "", to: "", date: "" }]);
  };

  const removeCity = (index) => {
    const newFlights = flights.filter((_, i) => i !== index);
    setFlights(newFlights);
  };

  return (
    <div>
      {/* 🔹 Flight Search Form */}
      <Card className="p-3  mb-4">
        {/* Trip Type Selection */}
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
            <Col md={3} className="d-flex justify-content-end">
              {index === flights.length - 1 ? (
                <Button variant="outline-primary" onClick={addCity}>
                  + Add Another City
                </Button>
              ) : (
                <Button
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
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Travellers</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={travellers}
                onChange={(e) => setTravellers(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Class</Form.Label>
              <Form.Select>
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
                <option>First Class</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card>

      {/* 🔹 Filter Sidebar */}
      <div className="col-sm-3">
        <div className="filter-box p-3 border rounded shadow-sm">
          <h5 className="mb-3 fw-bold">FILTER</h5>

          {/* Filter: Show Properties With */}
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
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="bookZero" />
                  <label className="form-check-label" htmlFor="bookZero">
                    Book With ₹0
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="freeCancel" />
                  <label className="form-check-label" htmlFor="freeCancel">
                    Free Cancellation
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="freeBreakfast" />
                  <label className="form-check-label" htmlFor="freeBreakfast">
                    Free Breakfast
                  </label>
                </div>
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

          {/* Filter: Star Rating */}
          <div className="filter-group mb-3">
            <div
              className="filter-title d-flex justify-content-between"
              onClick={() => handleToggle("star")}
              style={{ cursor: "pointer" }}
            >
              <span>Star Rating</span>
              <span>
                <FontAwesomeIcon
                  icon={toggle.star ? faChevronUp : faChevronDown}
                />
              </span>
            </div>
            {toggle.star && (
              <div className="filter-options mt-2">
                {["5 Star [205]", "4 Star [550]", "3 Star [305]", "Budget [750]", "Unrated [500]"].map(
                  (label, i) => (
                    <div className="form-check" key={i}>
                      <input className="form-check-input" type="checkbox" id={`s${i}`} />
                      <label className="form-check-label" htmlFor={`s${i}`}>
                        {label}
                      </label>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Filter: User Review Rating */}
          <div className="filter-group mb-3">
            <div
              className="filter-title d-flex justify-content-between"
              onClick={() => handleToggle("review")}
              style={{ cursor: "pointer" }}
            >
              <span>User Review Rating</span>
              <span>
                <FontAwesomeIcon
                  icon={toggle.review ? faChevronUp : faChevronDown}
                />
              </span>
            </div>
            {toggle.review && (
              <div className="filter-options mt-2">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="r1" />
                  <label className="form-check-label" htmlFor="r1">
                    4.5 & Above (Excellent)
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="r2" />
                  <label className="form-check-label" htmlFor="r2">
                    4 & Above (Very Good)
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="r3" />
                  <label className="form-check-label" htmlFor="r3">
                    3 & Above (Good)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Filter: Amenities */}
          <div className="filter-group mb-3">
            <div
              className="filter-title d-flex justify-content-between"
              onClick={() => handleToggle("amenities")}
              style={{ cursor: "pointer" }}
            >
              <span>Amenities</span>
              <span>
                <FontAwesomeIcon
                  icon={toggle.amenities ? faChevronUp : faChevronDown}
                />
              </span>
            </div>
            {toggle.amenities && (
              <div className="filter-options mt-2">
                {["Free Cancellation", "24 Hour Front Desk", "AC", "Bar", "Wi-Fi", "Breakfast"].map(
                  (label, i) => (
                    <div className="form-check" key={i}>
                      <input className="form-check-input" type="checkbox" id={`a${i}`} />
                      <label className="form-check-label" htmlFor={`a${i}`}>
                        {label}
                      </label>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flight;
