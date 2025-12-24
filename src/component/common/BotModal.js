// BotModal.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { chatbotSubmit } from "../services/commonService";

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
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Plan Your Trip</h1>
        <p className="lead">
          Our travel assistant will create a personalized itinerary
        </p>
      </div>

      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white py-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Trip Planner</h2>
          </div>
        </div>

        <div className="card-body p-4 p-md-5">
          <div className="row">
            <div className="col-lg-8">
              <div className="mb-4">
                <h4 className="mb-4">Travel Details</h4>
                <Form>
                  <Row>
                    {/* From */}
                    <Col md={6} className="mb-4">
                      <Form.Label className="fw-bold">
                        From <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fromDestination"
                        placeholder="Departure city (e.g., Delhi)"
                        value={formData.fromDestination}
                        onChange={handleChange}
                        isInvalid={!!errors.fromDestination}
                        className="py-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fromDestination}
                      </Form.Control.Feedback>
                    </Col>

                    {/* To */}
                    <Col md={6} className="mb-4">
                      <Form.Label className="fw-bold">
                        To <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="toDestination"
                        placeholder="Destination city (e.g., Jaipur)"
                        value={formData.toDestination}
                        onChange={handleChange}
                        isInvalid={!!errors.toDestination}
                        className="py-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.toDestination}
                      </Form.Control.Feedback>
                    </Col>

                    {/* Adults */}
                    <Col md={6} className="mb-4">
                      <Form.Label className="fw-bold">Adults</Form.Label>
                      <Form.Select
                        name="noOfAdults"
                        value={formData.noOfAdults}
                        onChange={handleChange}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            {num} Adult{num > 1 ? "s" : ""}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    {/* Children */}
                    <Col md={6} className="mb-4">
                      <Form.Label className="fw-bold">
                        Children (2-12 yrs)
                      </Form.Label>
                      <Form.Select
                        name="noOfChildren"
                        value={formData.noOfChildren}
                        onChange={handleChange}
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} Child{num !== 1 ? "ren" : ""}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    {/* Purpose */}
                    <Col md={12} className="mb-4">
                      <Form.Label className="fw-bold">Trip Purpose</Form.Label>
                      <Form.Select
                        name="purposeType"
                        value={formData.purposeType}
                        onChange={handleChange}
                      >
                        <option value="Tourism">Tourism / Vacation</option>
                        <option value="Business">Business Trip</option>
                        <option value="Family">Family Visit</option>
                        <option value="Honeymoon">Honeymoon</option>
                        <option value="Adventure">Adventure Trip</option>
                      </Form.Select>
                    </Col>

                    {/* Cab Need */}
                    
                  </Row>
                </Form>
              </div>

              <div className="d-flex justify-content-end mt-5">
                {!chatbotReply ? (
                  <Button
                    variant="success"
                    size="lg"
                    className="px-5"
                    onClick={handleSubmitWithChatbot}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Generating...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-5 py-2"
                    onClick={() => {
                      setChatbotReply("");
                      setFormData({
                        fromDestination: "",
                        toDestination: "",
                        noOfAdults: "1",
                        noOfChildren: "0",
                        cabNeed: "Yes",
                        purposeType: "Tourism",
                      });
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Plan Another Trip
                  </Button>
                )}
              </div>

              {/* Chatbot Response */}
              {chatbotReply && (
                <div className="mt-5">
                  <div className="d-flex align-items-center mb-3">
                    <h3 className="mb-0">
                      <i className="bi bi-robot text-primary me-2"></i>
                      Your Travel Itinerary
                    </h3>
                  </div>

                  <div className="card border-success">
                    <div className="card-body">
                      <pre
                        className="m-0 p-3"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontFamily: "inherit",
                          fontSize: "1.1rem",
                          lineHeight: "1.6",
                        }}
                      >
                        {chatbotReply}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-4 mt-5 mt-lg-0">
              <div className="sticky-top" style={{ top: "20px" }}>
                <div className="card border-primary mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">How It Works</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex mb-4">
                      <div className="flex-shrink-0">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          1
                        </div>
                      </div>
                      <div className="ms-3">
                        <h6>Enter travel details</h6>
                        <p className="small mb-0">
                          Fill in all your trip requirements
                        </p>
                      </div>
                    </div>

                    <div className="d-flex mb-4">
                      <div className="flex-shrink-0">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          2
                        </div>
                      </div>
                      <div className="ms-3">
                        <h6>Get AI-powered suggestions</h6>
                        <p className="small mb-0">
                          Our bot creates a personalized itinerary
                        </p>
                      </div>
                    </div>

                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          3
                        </div>
                      </div>
                      <div className="explore-btn">
                        <h6>Plan your journey</h6>
                        <p className="small mb-0">
                          Review and customize your trip details
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BotModal;
