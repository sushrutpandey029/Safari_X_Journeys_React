
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Bootmodel from "../common/Bootmodel.css";
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
    mood: "",
    budget: "",
    startDate: "",
    endDate: "",
  });

  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromDestination.trim())
      newErrors.fromDestination = "Departure location is required";
    if (!formData.toDestination.trim())
      newErrors.toDestination = "Destination is required";
    if (!formData.startDate)
      newErrors.startDate = "Start date is required";
    if (!formData.endDate)
      newErrors.endDate = "End date is required";
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitWithChatbot = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setChatbotReply("");

      const payload = {
        fromDestination: formData.fromDestination,
        toDestination: formData.toDestination,
        noOfAdults: formData.noOfAdults,
        noOfChildren: formData.noOfChildren,
        purposeType: formData.purposeType,
        mood: formData.mood,
        budget: formData.budget,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      const response = await chatbotSubmit(payload);
      setChatbotReply(response.result);

      setTimeout(() => {
        document.querySelector('.ai-response')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    } catch (error) {
      console.error("Error generating trip plan:", error);
      setChatbotReply(
        `Error: ${
          error.message || "Failed to generate trip plan. Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTripDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const tripDays = getTripDuration();

  return (
    <div className="trip-container">
      <div className="trip-hero">
        <div className="container">
          <div className="row">
            <h1>Plan Your Dream Trip</h1>
            <p>Let's design a journey tailored just for you</p>
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
                {/* From Destination */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-geo-alt"></i>
                    <Form.Control
                      placeholder="From (Delhi)"
                      name="fromDestination"
                      value={formData.fromDestination}
                      onChange={handleChange}
                      isInvalid={!!errors.fromDestination}
                    />
                    {errors.fromDestination && (
                      <Form.Control.Feedback type="invalid">
                        {errors.fromDestination}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>

                {/* To Destination */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-flag"></i>
                    <Form.Control
                      placeholder="To (Jaipur)"
                      name="toDestination"
                      value={formData.toDestination}
                      onChange={handleChange}
                      isInvalid={!!errors.toDestination}
                    />
                    {errors.toDestination && (
                      <Form.Control.Feedback type="invalid">
                        {errors.toDestination}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>

                {/* Start Date */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-calendar-check"></i>
                    <Form.Control
                      type="date"
                      placeholder="Start Date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      isInvalid={!!errors.startDate}
                    />
                    {errors.startDate && (
                      <Form.Control.Feedback type="invalid">
                        {errors.startDate}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>

                {/* End Date */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-calendar-x"></i>
                    <Form.Control
                      type="date"
                      placeholder="End Date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      isInvalid={!!errors.endDate}
                    />
                    {errors.endDate && (
                      <Form.Control.Feedback type="invalid">
                        {errors.endDate}
                      </Form.Control.Feedback>
                    )}
                  </div>
                  {tripDays > 0 && (
                    <small className="text-muted ms-2">
                      {tripDays} day{tripDays > 1 ? 's' : ''} trip
                    </small>
                  )}
                </Col>

                {/* Budget Dropdown */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-currency-rupee"></i>
                    <Form.Select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                    >
                      <option value="">Select Budget Range</option>
                      <option value="5000">Under ₹5,000 (Budget)</option>
                      <option value="10000">₹5,000 - ₹10,000 (Economy)</option>
                      <option value="20000">₹10,000 - ₹20,000 (Standard)</option>
                      <option value="35000">₹20,000 - ₹35,000 (Comfort)</option>
                      <option value="50000">₹35,000 - ₹50,000 (Premium)</option>
                      <option value="75000">₹50,000 - ₹75,000 (Luxury)</option>
                      <option value="100000">Above ₹75,000 (Ultra Luxury)</option>
                    </Form.Select>
                  </div>
                </Col>

                {/* Mood */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-emoji-smile"></i>
                    <Form.Select
                      name="mood"
                      value={formData.mood}
                      onChange={handleChange}
                    >
                      <option value="">Select your mood (optional)</option>
                      <option value="Relaxed">😌 Relaxed</option>
                      <option value="Happy">😊 Happy</option>
                      <option value="Adventurous">🏔️ Adventurous</option>
                      <option value="Romantic">💕 Romantic</option>
                      <option value="Low or Tired">😔 Low or Tired</option>
                      <option value="Spiritual">🙏 Spiritual</option>
                    </Form.Select>
                  </div>
                </Col>

                {/* Adults */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-person"></i>
                    <Form.Select
                      name="noOfAdults"
                      value={formData.noOfAdults}
                      onChange={handleChange}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>

                {/* Children */}
                <Col md={6} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-people"></i>
                    <Form.Select
                      name="noOfChildren"
                      value={formData.noOfChildren}
                      onChange={handleChange}
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n} Children</option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>

                {/* Purpose */}
                <Col md={12} className="mb-4">
                  <div className="input-group-modern">
                    <i className="bi bi-bullseye"></i>
                    <Form.Select
                      name="purposeType"
                      value={formData.purposeType}
                      onChange={handleChange}
                    >
                      <option value="Tourism">🏖️ Tourism</option>
                      <option value="Business">💼 Business</option>
                      <option value="Honeymoon">💑 Honeymoon</option>
                      <option value="Adventure">⛰️ Adventure</option>
                    </Form.Select>
                  </div>
                </Col>
              </Row>
            </Form>

            <div className="text-end mt-4">
              <button 
                className="ai-btn" 
                onClick={handleSubmitWithChatbot}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Planning...
                  </>
                ) : (
                  <>
                    <i className="bi bi-magic me-2"></i>
                    Ask ARIX
                  </>
                )}
              </button>
            </div>

            {/* AI Response */}
            {isLoading && (
              <div className="ai-response mt-4">
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3"></div>
                  <p>ARIX is creating your personalized itinerary...</p>
                </div>
              </div>
            )}

            {chatbotReply && !isLoading && (
              <div className="ai-response mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3>
                    <i className="bi bi-robot me-2"></i>
                    Your Travel Plan
                  </h3>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setChatbotReply("")}
                  >
                    <i className="bi bi-x-circle"></i> Clear
                  </button>
                </div>
                <div
                  className="ai-response-text"
                  dangerouslySetInnerHTML={{
                    __html: chatbotReply
                      .replace(
                        /(http:\/\/localhost:3000\/[^\s]+)/g,
                        '<a href="$1" target="_blank" class="booking-link">$1</a>'
                      )
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="col-lg-4">
            <div className="assistant-card sticky-top">
              <h5>
                <i className="bi bi-robot me-2"></i>
                ARIX Travel Assistant
              </h5>
              <p>
                Smart itinerary planning based on your preferences, time and
                budget.
              </p>

              <ul>
                <li>
                  <i className="bi bi-check-circle"></i> Day-by-day planning
                </li>
                <li>
                  <i className="bi bi-check-circle"></i> Budget optimization
                </li>
                <li>
                  <i className="bi bi-check-circle"></i> Mood-based suggestions
                </li>
                <li>
                  <i className="bi bi-check-circle"></i> Local food recommendations
                </li>
              </ul>

              {tripDays > 0 && formData.fromDestination && formData.toDestination && (
                <div className="trip-summary mt-4 p-3 bg-light rounded">
                  <h6>Trip Summary</h6>
                  <p className="mb-1">
                    <strong>{formData.fromDestination}</strong> → <strong>{formData.toDestination}</strong>
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-calendar3"></i> {tripDays} days
                  </p>
                  {formData.budget && (
                    <p className="mb-1">
                      <i className="bi bi-currency-rupee"></i> ₹{formData.budget}
                      <span className="ms-2 badge bg-primary">
                        {formData.budget <= 10000 && "Budget"}
                        {formData.budget > 10000 && formData.budget <= 35000 && "Standard"}
                        {formData.budget > 35000 && formData.budget <= 50000 && "Premium"}
                        {formData.budget > 50000 && "Luxury"}
                      </span>
                    </p>
                  )}
                  <p className="mb-0">
                    <i className="bi bi-people"></i> {formData.noOfAdults} Adult{formData.noOfAdults > 1 ? 's' : ''}{formData.noOfChildren > 0 && `, ${formData.noOfChildren} Child${formData.noOfChildren > 1 ? 'ren' : ''}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BotModal;