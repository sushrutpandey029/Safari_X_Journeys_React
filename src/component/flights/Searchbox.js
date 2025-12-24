
import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import "./Flights.css";

const SearchBox = ({ placeholder = "Search...", onSearch }) => {
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
 
   const searchFlights = () => {
     console.log("Search button clicked!");
   };

  return (
    <div className="flight-section">
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
  onClick={searchFlights}
>
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
