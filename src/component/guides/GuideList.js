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
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleGuides, setVisibleGuides] = useState(6);
  const [guidesPerLoad, setGuidesPerLoad] = useState(6);


  const [selectedCity, setSelectedCity] = useState("");
const [selectedCityName, setSelectedCityName] = useState("");

const [checkIn, setCheckIn] = useState("");
const [checkOut, setCheckOut] = useState("");
const [selectedCountry, setSelectedCountry] = useState("");
const [cityList, setCityList] = useState([]);


  // Filter states
  const [filters, setFilters] = useState({
    priceRange: 100,
    languages: [],
    specializations: [],
    ratings: [] // Changed from minRating to ratings array for checkboxes
  });

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

  const handleBookNow = (guide) => {
    navigate(`/guide/${guide.guideId}`, { state: { guideData: guide } });
  };

  // Filter handlers
  const handlePriceChange = (e) => {
    setFilters(prev => ({ ...prev, priceRange: parseInt(e.target.value) }));
  };

  const handleLanguageChange = (language) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(lang => lang !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSpecializationChange = (specialization) => {
    setFilters(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(spec => spec !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleSearch = () => {
  console.log("City:", selectedCityName);
  console.log("CheckIn:", checkIn);
  console.log("CheckOut:", checkOut);

  // Yaha API call ya page redirect kar sakte ho
};


  // Updated rating handler for checkboxes
  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      ratings: prev.ratings.includes(rating)
        ? prev.ratings.filter(r => r !== rating)
        : [...prev.ratings, rating]
    }));
  };

  // Apply filters
  useEffect(() => {
    if (guides.length === 0) return;

    const filtered = guides.filter(guide => {
      // Price filter (using the random price logic from your code)
      const guidePrice = Math.floor(Math.random() * 50) + 30;
      if (guidePrice > filters.priceRange) return false;

      // Rating filter (updated for multiple ratings)
      if (filters.ratings.length > 0) {
        const guideRating = guide.rating || 0;
        const meetsRating = filters.ratings.some(minRating => guideRating >= minRating);
        if (!meetsRating) return false;
      }

      // Languages filter
      if (filters.languages.length > 0) {
        const guideLanguages = guide.languageProficiency?.map(lang => lang.language) || [];
        const hasMatchingLanguage = filters.languages.some(lang => 
          guideLanguages.some(guideLang => 
            guideLang.toLowerCase().includes(lang.toLowerCase())
          )
        );
        if (!hasMatchingLanguage) return false;
      }

      // Specialization filter
      if (filters.specializations.length > 0) {
        const guideTours = guide.typesOfTours || [];
        const hasMatchingSpecialization = filters.specializations.some(spec => 
          guideTours.some(tour => 
            tour.toLowerCase().includes(spec.toLowerCase())
          )
        );
        if (!hasMatchingSpecialization) return false;
      }

      return true;
    });

    setFilteredGuides(filtered);
    // Reset visible guides when filters change
    setVisibleGuides(6);
  }, [guides, filters]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await getAllGuides();
        const filtered = response?.data?.filter((g) => g.profileImage);
        setGuides(filtered || []);
        setFilteredGuides(filtered || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching guides:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  if (loading) return <div className="text-center py-5">Loading guides...</div>;
  if (error) return <div className="text-center py-5 text-danger">Error: {error}</div>;

  return (

    
    <div
      className="guide-page py-5"
      style={{ backgroundColor: "#fff", marginTop: "34px" }}
    >
      <div className="search-section">
  <div className="container">
    <div className="row g-3 align-items-end">

      {/* City */}
      <div className="col-md-3">
        <label className="form-label fw-semibold text-white">City</label>
        <select
          className="form-control"
          value={selectedCity}
          onChange={(e) => {
            const cityCode = e.target.value;
            setSelectedCity(cityCode);

            const cityObj = cityList.find(
              (c) =>
                (c.CityCode?.toString() || c.Code?.toString()) ===
                cityCode.toString()
            );

            const cityName =
              cityObj?.CityName || cityObj?.Name || cityObj?.City || "";

            setSelectedCityName(cityName);
            localStorage.setItem("selectedCity", cityCode);
            localStorage.setItem("selectedCityName", cityName);
          }}
          disabled={!selectedCountry || loading}
        >
          <option value="">-- Select City --</option>
          {cityList.map((city, index) => (
            <option key={index} value={city.CityCode || city.Code}>
              {city.CityName || city.Name || city.City}
            </option>
          ))}
        </select>
      </div>

      {/* Check-In */}
      <div className="col-md-3">
        <label className="form-label fw-semibold text-white">Start Day</label>
        <DatePicker
          selected={checkIn ? new Date(checkIn) : null}
          onChange={(date) => setCheckIn(date.toISOString().split("T")[0])}
          className="form-control"
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
          placeholderText="Select Start Day"
        />
      </div>

      {/* Check-Out */}
      <div className="col-md-3">
        <label className="form-label fw-semibold text-white">End Day</label>
        <DatePicker
          selected={checkOut ? new Date(checkOut) : null}
          onChange={(date) => setCheckOut(date.toISOString().split("T")[0])}
          className="form-control"
          dateFormat="yyyy-MM-dd"
          minDate={checkIn ? new Date(checkIn) : new Date()}
          placeholderText="Select End Day"
        />
      </div>

      {/* Search Button */}
      <div className="col-md-3">
        <button className="form-control explore-btn w-100">
          Search Guide
        </button>
      </div>

    </div>
  </div>
</div>



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
                      min="30"
                      max="100"
                      value={filters.priceRange}
                      onChange={handlePriceChange}
                      className="form-range"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Rs. 30</span>
                      <span>Rs. {filters.priceRange}+</span>
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
                    {["English", "Hindi"].map((lang, i) => (
                      <div key={i} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`lang-${i}`}
                          checked={filters.languages.includes(lang)}
                          onChange={() => handleLanguageChange(lang)}
                          style={{ 
                            width: "16px", 
                            height: "16px",
                            marginRight: "8px"
                          }}
                        />
                        <label className="form-check-label" htmlFor={`lang-${i}`} style={{ cursor: "pointer" }}>
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
                      "Cultural",
                      "Adventure",
                      "Food",
                      "Historical",
                      "Nature",
                      "Photography",
                    ].map((type, i) => (
                      <div key={i} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`spec-${i}`}
                          checked={filters.specializations.includes(type)}
                          onChange={() => handleSpecializationChange(type)}
                          style={{ 
                            width: "16px", 
                            height: "16px",
                            marginRight: "8px"
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`spec-${i}`}
                          style={{ cursor: "pointer" }}
                        >
                          {type} Tours
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating - Updated to use checkboxes */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("rating")}
                >
                  <span>Rating</span>
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
                          checked={filters.ratings.includes(rating)}
                          onChange={() => handleRatingChange(rating)}
                          style={{ 
                            width: "16px", 
                            height: "16px",
                            marginRight: "8px"
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`rating-${rating}`}
                          style={{ cursor: "pointer" }}
                        >
                          {rating} <FaStar className="text-warning" /> & up
                        </label>
                      </div>
                    ))}
                    {/* All Ratings checkbox */}
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rating-all"
                        checked={filters.ratings.length === 0}
                        onChange={() => setFilters(prev => ({ ...prev, ratings: [] }))}
                        style={{ 
                          width: "16px", 
                          height: "16px",
                          marginRight: "8px"
                        }}
                      />
                      <label className="form-check-label" htmlFor="rating-all" style={{ cursor: "pointer" }}>
                        All Ratings
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={() => setFilters({
                  priceRange: 100,
                  languages: [],
                  specializations: [],
                  ratings: []
                })}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Guide Cards Section */}
          <div className="col-md-9 px-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Found {filteredGuides.length} guides</h5>
              {(filters.languages.length > 0 || filters.specializations.length > 0 || filters.ratings.length > 0) && (
                <small className="text-muted">
                  Active filters: 
                  {filters.languages.length > 0 && ` Languages (${filters.languages.length})`}
                  {filters.specializations.length > 0 && ` Specializations (${filters.specializations.length})`}
                  {filters.ratings.length > 0 && ` Rating (${filters.ratings.map(r => `${r}+`).join(', ')})`}
                </small>
              )}
            </div>
            
            <div className="guide-list">
              {filteredGuides.slice(0, visibleGuides).map((guide) => {
                const guidePrice = Math.floor(Math.random() * 50) + 30;
                
                return (
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
                            {/* Rating from API */}
                            {guide.rating && (
                              <div className="mb-2">
                                <span className="badge bg-warning text-dark">
                                  ⭐ {guide.rating}
                                </span>
                              </div>
                            )}
                            <div className="fw-semibold">
                              Rs. {guidePrice}/hr
                            </div>
                            <span className="badge bg-light text-success small mt-1">
                              Available Today
                            </span>
                          </div>
                        </div>

                        {/* Book Now Button */}
                        <div className="d-flex gap-2 mt-3">
                          <button
                            className="explore-btn"
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
                );
              })}

              {/* Load More Button */}
              {visibleGuides < filteredGuides.length && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => setVisibleGuides(prev => prev + guidesPerLoad)}
                  >
                    Load More ({filteredGuides.length - visibleGuides} remaining)
                  </button>
                </div>
              )}

              {filteredGuides.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">No guides match your filters.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setFilters({
                      priceRange: 100,
                      languages: [],
                      specializations: [],
                      ratings: []
                    })}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideList;