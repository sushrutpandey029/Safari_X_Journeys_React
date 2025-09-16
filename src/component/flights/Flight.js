// src/components/Flight.js
import React, { useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";

const Flight = () => {
  const [flights, setFlights] = useState([
    { from: "Delhi", to: "Bengaluru", date: "2025-09-16" },
    { from: "Bengaluru", to: "Mumbai", date: "2025-10-15" },
  ]);

  const [travellers, setTravellers] = useState(1);
  const [tripType, setTripType] = useState("multi");

  const addCity = () => {
    setFlights([...flights, { from: "", to: "", date: "" }]);
  };

  const removeCity = (index) => {
    const newFlights = flights.filter((_, i) => i !== index);
    setFlights(newFlights);
  };

  return (
    <Card className="p-3 shadow-lg">
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
  );
};

export default Flight;
