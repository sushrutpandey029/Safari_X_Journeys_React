// BotModal.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Bootmodel from "../common/Bootmodel.css";
import { chatbotSubmit } from "../services/commonService";
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
  rel="stylesheet"
/>

function BotModal() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fromDestination: "",
    toDestination: "",
    noOfAdults: "1",
    noOfChildren: "0",
    cabNeed: "Yes",
    purposeType: "Tourism",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [chatbotReply, setChatbotReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fromDestination.trim())
        newErrors.fromDestination = "Departure location is required";
      if (!formData.toDestination.trim())
        newErrors.toDestination = "Destination is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitWithChatbot = async () => {
    if (!validateStep()) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setChatbotReply("Generating your personalized itinerary...");

      const payload = {
        fromDestination: formData.fromDestination,
        toDestination: formData.toDestination,
        noOfAdults: formData.noOfAdults,
        noOfChildren: formData.noOfChildren,
        purposeType: formData.purposeType,
      };

      const response = await chatbotSubmit(payload);

      setChatbotReply(response.result);
    } catch (error) {
      console.error("Error generating trip plan:", error);
      setChatbotReply(
        ` Error: ${
          error.message || "Failed to generate trip plan. Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className=" trip-container">
  <div className="trip-hero">
    <div className="container">
      <div className="row">
        <h1>Plan Your Dream Trip</h1>
    <p>Let AI design a journey tailored just for you</p>
      </div>
    </div>
    
  </div>

  <div className="container trip-glass-card">
    <div className="row g-5">

      {/* LEFT */}
      <div className="col-lg-8">
        <h4 className="form-title">Travel Details</h4>

        <Form>
          <Row>

            <Col md={6} className="mb-4">
              <div className="input-group-modern">
                <i className="bi bi-geo-alt"></i>
                <Form.Control
                  placeholder="From (Delhi)"
                  name="fromDestination"
                  value={formData.fromDestination}
                  onChange={handleChange}
                />
              </div>
            </Col>

            <Col md={6} className="mb-4">
              <div className="input-group-modern">
                <i className="bi bi-flag"></i>
                <Form.Control
                  placeholder="To (Jaipur)"
                  name="toDestination"
                  value={formData.toDestination}
                  onChange={handleChange}
                />
              </div>
            </Col>

            <Col md={6} className="mb-4">
              <div className="input-group-modern">
                <i className="bi bi-person"></i>
                <Form.Select
                  name="noOfAdults"
                  value={formData.noOfAdults}
                  onChange={handleChange}
                >
                  {[1,2,3,4,5].map(n=>(
                    <option key={n}>{n} Adults</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            <Col md={6} className="mb-4">
              <div className="input-group-modern">
                <i className="bi bi-people"></i>
                <Form.Select
                  name="noOfChildren"
                  value={formData.noOfChildren}
                  onChange={handleChange}
                >
                  {[0,1,2,3].map(n=>(
                    <option key={n}>{n} Children</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            <Col md={12} className="mb-4">
              <div className="input-group-modern">
                <i className="bi bi-bullseye"></i>
                <Form.Select
                  name="purposeType"
                  value={formData.purposeType}
                  onChange={handleChange}
                >
                  <option>Tourism</option>
                  <option>Business</option>
                  <option>Honeymoon</option>
                  <option>Adventure</option>
                </Form.Select>
              </div>
            </Col>

          </Row>
        </Form>

        <div className="text-end mt-4">
          <button className="ai-btn" onClick={handleSubmitWithChatbot}>
            Generate AI Plan
          </button>
        </div>

        {chatbotReply && (
          <div className="ai-response">
            <h3>Your Personalized Itinerary</h3>
            <pre>{chatbotReply}</pre>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="col-lg-4">
        <div className="assistant-card sticky-top">
          <h5>AI Travel Assistant</h5>
          <p>
            Smart itinerary planning based on your preferences,
            time and budget.
          </p>

          <ul>
            <li><i className="bi bi-check-circle"></i> Smart route planning</li>
            <li><i className="bi bi-check-circle"></i> Budget friendly</li>
            <li><i className="bi bi-check-circle"></i> Time optimized</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</div>


  );
}
export default BotModal;
