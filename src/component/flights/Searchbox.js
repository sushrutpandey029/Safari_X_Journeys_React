import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { Form, Button, Row, Col } from "react-bootstrap";
import "./Flights.css";

const SearchBox = ({ placeholder = "Search...", onSearch }) => {
  const [flights, setFlights] = useState([{ from: "", to: "", date: "" }]);
  const [tripType, setTripType] = useState("multi");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");
  const MAX_MULTI_CITIES = 5;

  // Function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  // Function to add one day to a date
  const addOneDay = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return formatDate(d);
  };

  // Handle trip type change
  const handleTripTypeChange = (type) => {
    setTripType(type);

    if (type === "oneway") {
      setFlights([{ from: "", to: "", date: "" }]);
    } else if (type === "round") {
      setFlights([
        { from: "", to: "", date: "" },
        { from: "", to: "", date: "" },
      ]);
    } else if (type === "multi") {
      // Multi-city में सिर्फ एक ही row शुरू में
      setFlights([{ from: "", to: "", date: "" }]);
    }
  };

  // Handle date change
  const handleDateChange = (index, value) => {
    if (!value) return;

    setFlights((prev) => {
      const updated = [...prev];

      // सिर्फ current row की date update करें
      updated[index] = {
        ...updated[index],
        date: value,
      };

      // ===== ROUND TRIP =====
      if (tripType === "round" && index === 0) {
        if (updated[1]) {
          updated[1] = {
            ...updated[1],
            date: addOneDay(value),
          };
        }
      }

      return updated;
    });
  };

  // Handle from/to city change - COMPLETELY SEPARATE LOGIC
  const handleCityChange = (index, field, value) => {
    setFlights((prevFlights) => {
      const newFlights = [...prevFlights];

      // 1. First, update ONLY the current row
      newFlights[index] = {
        ...newFlights[index],
        [field]: value,
      };

      // 2. Check if we should do any auto-fill
      // ONLY FOR ROUND TRIP, NOT FOR MULTI-CITY
      if (tripType === "round" && prevFlights.length >= 2) {
        // Round trip auto-fill logic
        if (index === 0 && field === "to") {
          // First trip's "to" becomes second trip's "from"
          newFlights[1] = {
            ...newFlights[1],
            from: value,
          };
        }
        if (index === 0 && field === "from") {
          // First trip's "from" becomes second trip's "to"
          newFlights[1] = {
            ...newFlights[1],
            to: value,
          };
        }
      }

      // 3. For MULTI-CITY: NO AUTO-FILL AT ALL
      // Each row stays completely independent

      return newFlights;
    });
  };

  const addCity = () => {
    if (flights.length >= MAX_MULTI_CITIES) {
      alert(`Maximum ${MAX_MULTI_CITIES} cities allowed`);
      return;
    }

    // Last flight की date लें
    const lastFlight = flights[flights.length - 1];
    const nextDate = lastFlight.date ? addOneDay(lastFlight.date) : "";

    // नई row add करें - COMPLETELY EMPTY
    setFlights([
      ...flights,
      {
        from: "", // हमेशा blank
        to: "", // हमेशा blank
        date: nextDate,
      },
    ]);
  };

  const removeCity = (index) => {
    if (flights.length <= 1) return;
    const newFlights = flights.filter((_, i) => i !== index);
    setFlights(newFlights);
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

  const searchFlights = () => {
    console.log("Searching flights:", {
      tripType,
      flights,
      travellers: {
        adults,
        children,
        infants,
        total: adults + children + infants,
      },
      class: travelClass,
    });
  };

  // Initialize flights based on trip type
  useEffect(() => {
    // सिर्फ round trip के लिए ही date set करें
    if (tripType === "round") {
      const departDate = flights[0]?.date;
      if (!departDate) return;

      if (flights[1] && !flights[1].date) {
        setFlights((prev) => [
          prev[0],
          { ...prev[1], date: addOneDay(departDate) },
        ]);
      }
    }
  }, [tripType, flights[0]?.date]);

  return (
    <div className="flight-section">
      <div className="search-box rounded shadow-sm flight-form">
        <div className="container">
          <div className="d-flex gap-3 mb-3">
            <Form.Check
              type="radio"
              label="One Way"
              name="tripType"
              checked={tripType === "oneway"}
              onChange={() => handleTripTypeChange("oneway")}
            />
            <Form.Check
              type="radio"
              label="Round Trip"
              name="tripType"
              checked={tripType === "round"}
              onChange={() => handleTripTypeChange("round")}
            />
            <Form.Check
              type="radio"
              label="Multi City"
              name="tripType"
              checked={tripType === "multi"}
              onChange={() => handleTripTypeChange("multi")}
            />
          </div>

          {/* Flight Segments */}
          {flights.map((flight, index) => (
            <Row className="align-items-end mb-3" key={index}>
              <Col md={tripType === "multi" ? 3 : 4}>
                <Form.Group>
                  <Form.Label>
                    {tripType === "round" && index === 0
                      ? "Depart From"
                      : tripType === "round" && index === 1
                      ? "Return From"
                      : "From"}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="From City"
                    value={flight.from}
                    onChange={(e) =>
                      handleCityChange(index, "from", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={tripType === "multi" ? 3 : 4}>
                <Form.Group>
                  <Form.Label>
                    {tripType === "round" && index === 0
                      ? "Depart To"
                      : tripType === "round" && index === 1
                      ? "Return To"
                      : "To"}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="To City"
                    value={flight.to}
                    onChange={(e) =>
                      handleCityChange(index, "to", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              {/* Add / Remove Button for Multi City */}
              {tripType === "multi" && index === flights.length - 1 && (
                <Col md={3} className="d-flex align-items-center gap-2">
                  {/* Remove Button */}
                  {index > 0 && (
                    <Button
                      variant="outline-danger"
                      className="explore-btn"
                      onClick={() => removeCity(index)}
                    >
                      Remove
                    </Button>
                  )}

                  {/* Add City Button */}
                  {flights.length < MAX_MULTI_CITIES && (
                    <Button className="explore-btn" onClick={addCity}>
                      + Add Another City
                    </Button>
                  )}
                </Col>
              )}
            </Row>
          ))}

          {/* Travellers & Class - Separate Section */}
          <Row className="g-3 mt-3">
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
                  <Dropdown.Item onClick={() => setTravelClass("First Class")}>
                    First Class
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            <Col md={3}>
              <Button className="explore-btn" onClick={searchFlights}>
                Search
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
