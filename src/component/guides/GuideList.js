import React, { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { getAllGuides } from "../services/guideService";
import { BASE_URL } from "../services/apiEndpoints";
import "./GuideCareers.css";
import { Link, useNavigate } from "react-router-dom"; // useNavigate import karna hai

const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toggle, setToggle] = useState({
    price: true,
    languages: true,
    specialization: true,
    rating: true,
  });

  const handleToggle = (key) => {
    setToggle((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigate = useNavigate();

  // Book Now handler function
  const handleBookNow = (guide) => {
    navigate(`/guide/${guide.guideId}`, { state: { guideData:guide } });
  };

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await getAllGuides();
        const filtered = response?.data?.filter((g) => g.profileImage);
        setGuides(filtered || []);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };

    fetchGuides();
  }, []);

  return (
    <div
      className="guide-page py-5"
      style={{ backgroundColor: "#fff", marginTop: "150px" }}
    >
      <div className="container">
        <div className="row">
          {/* Filters Section */}
          <div className="col-md-3">
            <div className="filter-box p-3 border rounded shadow-sm">
              <h5 className="mb-3 fw-bold">FILTERS</h5>

              {/* Price Range */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("price")}
                >
                  <span>Price Range (per hour)</span>
                  {toggle.price ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {toggle.price && (
                  <div className="filter-options mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="form-range"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>$0</span>
                      <span>$100+</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("languages")}
                >
                  <span>Languages</span>
                  {toggle.languages ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {toggle.languages && (
                  <div className="filter-options mt-2">
                    {[
                      "English",
                      "Hindi",
                      "Spanish",
                      "French",
                      "German",
                      "Mandarin",
                    ].map((lang, i) => (
                      <div key={i} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`lang-${i}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`lang-${i}`}
                        >
                          {lang}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specialization */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("specialization")}
                >
                  <span>Specialization</span>
                  {toggle.specialization ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {toggle.specialization && (
                  <div className="filter-options mt-2">
                    {[
                      "Cultural Tours",
                      "Adventure Tours",
                      "Food Tours",
                      "Historical Sites",
                      "Nature & Wildlife",
                      "Photography Tours",
                    ].map((type, i) => (
                      <div key={i} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`spec-${i}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`spec-${i}`}
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Minimum Rating */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("rating")}
                >
                  <span>Minimum Rating</span>
                  {toggle.rating ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {toggle.rating && (
                  <div className="filter-options mt-2">
                    {[5, 4, 3].map((rating) => (
                      <div key={rating} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`rating-${rating}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`rating-${rating}`}
                        >
                          {rating} <FaStar className="text-warning" /> & up
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guide Cards Section */}
          <div className="col-md-9 px-4">
            <div
              className="guide-list overflow-auto"
              style={{
                maxHeight: "calc(100vh - 150px)",
                overflowY: "auto",
                paddingRight: "8px",
              }}
            >
              {guides.map((guide) => (
                <div
                  key={guide.guideId}
                  className="guide-card border rounded-3 p-3 mb-4 shadow-sm"
                >
                  <div className="d-flex align-items-start">
                    <img
                      src={`${BASE_URL}/uploads/guides/${guide.profileImage}`}
                      alt={guide.fullName}
                      className="rounded-3 me-3"
                      width="120"
                      height="120"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="fw-bold mb-1">
                            {guide.fullName}{" "}
                            <FaCheckCircle className="text-primary small ms-1" />
                          </h5>
                          <p className="text-muted mb-1">
                            <FaMapMarkerAlt className="text-secondary me-1" />
                            {guide.city}, {guide.state}
                          </p>
                          <p className="text-muted small mb-1">
                            {guide.workExperience?.[0]?.years || "0"}+ years
                          </p>
                          <p className="mb-2 small text-secondary">
                            {guide.professionalSummary}
                          </p>

                          {/* Languages */}
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {guide.languageProficiency?.map((lang, i) => (
                              <span
                                key={i}
                                className="badge bg-light text-dark border"
                              >
                                {lang.language}
                              </span>
                            ))}
                          </div>

                          {/* Tour Types */}
                          <div className="d-flex flex-wrap gap-2">
                            {guide.typesOfTours?.map((tour, i) => (
                              <span
                                key={i}
                                className="badge bg-light text-dark border"
                              >
                                {tour} Tours
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="fw-semibold">
                            ${Math.floor(Math.random() * 50) + 30}/hr
                          </div>
                          <span className="badge bg-light text-success small mt-1">
                            Available Today
                          </span>
                        </div>
                      </div>

                      {/* Book Now Button - YEH CHANGE KARNA HAI */}
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-outline-dark btn-sm px-3"
                          onClick={() => {
                            console.log("🟡 Button clicked for guide:", guide);
                            handleBookNow(guide);
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {guides.length === 0 && (
                <p className="text-center text-muted">No guides available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideList;
