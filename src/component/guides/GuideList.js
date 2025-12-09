import React, { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { getAllGuides } from "../services/guideService";
import { getAllCities } from "../services/commonService";
import { BASE_URL } from "../services/apiEndpoints";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./GuideCareers.css";

const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cityList, setCityList] = useState([]);


  


  const [selectedCity, setSelectedCity] = useState("");
 const [startDate, setStartDate] = useState(new Date());            // today
const [endDate, setEndDate] = useState(
  new Date(Date.now() + 24 * 60 * 60 * 1000)                       // tomorrow
);


  const [filters, setFilters] = useState({
    languages: [],
    specializations: [],
    ratings: [],
  });

  const [toggle, setToggle] = useState({
    languages: true,
    specialization: true,
    rating: true,
  });

  const navigate = useNavigate();

  // -----------------------------------------
  // FETCH ALL CITIES
  // -----------------------------------------
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // const res = await getAllCities();
        // const cities = res?.cities || [];
        // console.log("cities", cities);
        const cities = [
          "Delhi",
          "Rajasthan",
          "Agra",
          "Mumbai",
          "Goa",
          "Kerala",
          "Himachal Pradesh",
        ];
        setCityList(cities);

        const savedCity = localStorage.getItem("selectedCity");
        if (savedCity) setSelectedCity(savedCity);
      } catch (err) {
        console.error("Error loading cities:", err);
      }
    };

    fetchCities();
  }, []);

  // -----------------------------------------
  // FETCH ALL GUIDES (first load)
  // -----------------------------------------
  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async (filters = null) => {
    try {
      setLoading(true);
      console.log("filters data", filters);
      const response = filters
        ? await getAllGuides(filters)
        : await getAllGuides();

      console.log("guide resp", response);
      const list = response?.data?.filter((g) => g.profileImage) || [];
      console.log("guide list", list);

      setGuides(list);
      setFilteredGuides(list);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching guides:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // -----------------------------------------
  // FILTERS FOR ratings / languages / tours
  // -----------------------------------------
  useEffect(() => {
    let result = [...guides];

    // ⭐ Rating Filter
    if (filters.ratings.length > 0) {
      result = result.filter((guide) =>
        filters.ratings.some((rating) => (guide.rating || 0) >= rating)
      );
    }

    // 🌎 Language Filter
    if (filters.languages.length > 0) {
      result = result.filter((guide) => {
        const langs =
          guide.languageProficiency?.map((l) => l.language.toLowerCase()) || [];
        return filters.languages.some((l) => langs.includes(l.toLowerCase()));
      });
    }

    // 🧭 Specialization Filter
    if (filters.specializations.length > 0) {
      result = result.filter((guide) => {
        const tours = guide.typesOfTours?.map((t) => t.toLowerCase()) || [];
        return filters.specializations.some((s) =>
          tours.includes(s.toLowerCase())
        );
      });
    }

    setFilteredGuides(result);
  }, [filters, guides]);

  // -----------------------------------------
  // SEARCH → CALL BACKEND WITH FILTERS
  // -----------------------------------------
  const handleSearch = async () => {
    if (!selectedCity) return alert("Please select a city");
    if (!startDate || !endDate)
      return alert("Please select start and end date");

    const filterPayload = {
      city: selectedCity,
      startDate: startDate,
      endDate: endDate,
    };

    console.log("Searching with filters:", filterPayload);

    await loadGuides(filterPayload);
  };

  // ------------------ UI --------------------
  if (loading) return <div className="text-center py-5">Loading guides...</div>;

  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;

  return (
    <div
      className="guide-page py-5"
      style={{ backgroundColor: "#fff", marginTop: "34px" }}
    >
      {/* SEARCH BAR */}
      <div className="search-section">
        <div className="container">
          <div className="row g-3 align-items-end">
            {/* CITY */}
            <div className="col-md-3">
              <label className="form-label fw-semibold text-white">City</label>
              <select
                className="form-control"
                value={selectedCity}
                onChange={(e) => {
                  const city = e.target.value;
                  setSelectedCity(city);
                  localStorage.setItem("selectedCity", city);
                }}
              >
                <option value="">-- Select City --</option>
                {cityList.map((city, i) => (
                  <option key={i} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* START DATE */}
           <div className="col-md-3">
  <label className="form-label fw-semibold text-white">Start Day</label>
  <DatePicker
    selected={startDate}
    onChange={(date) => {
      setStartDate(date);

      // 👉 Auto fill END DATE = next day
      if (date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setEndDate(nextDay);
      }
    }}
    className="form-control"
    minDate={new Date()}
    dateFormat="yyyy-MM-dd"
  />
</div>

<div className="col-md-3">
  <label className="form-label fw-semibold text-white">End Day</label>
  <DatePicker
    selected={endDate}
    onChange={(date) => setEndDate(date)}
    className="form-control"
    minDate={startDate || new Date()}
    dateFormat="yyyy-MM-dd"
  />
</div>

            {/* BUTTON */}
            <div className="col-md-3">
              <button
                className="form-control explore-btn"
                onClick={handleSearch}
              >
                Search Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================== MAIN CONTENT ================== */}
      <div className="container mt-4">
        <div className="row">
          {/* LEFT FILTERS */}
          <div className="col-md-3">
            <div className="filter-box p-3 border rounded shadow-sm">
              <h5 className="mb-3 fw-bold">FILTERS</h5>

              {/* LANGUAGES */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setToggle((prev) => ({
                      ...prev,
                      languages: !prev.languages,
                    }))
                  }
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
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              languages: prev.languages.includes(lang)
                                ? prev.languages.filter((l) => l !== lang)
                                : [...prev.languages, lang],
                            }))
                          }
                        />
                        <label
                          htmlFor={`lang-${i}`}
                          className="form-check-label"
                        >
                          {lang}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SPECIALIZATION */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setToggle((prev) => ({
                      ...prev,
                      specialization: !prev.specialization,
                    }))
                  }
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
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              specializations: prev.specializations.includes(
                                type
                              )
                                ? prev.specializations.filter((s) => s !== type)
                                : [...prev.specializations, type],
                            }))
                          }
                        />
                        <label
                          htmlFor={`spec-${i}`}
                          className="form-check-label"
                        >
                          {type} Tours
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RATING FILTER */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setToggle((prev) => ({ ...prev, rating: !prev.rating }))
                  }
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
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              ratings: prev.ratings.includes(rating)
                                ? prev.ratings.filter((r) => r !== rating)
                                : [...prev.ratings, rating],
                            }))
                          }
                        />
                        <label
                          htmlFor={`rating-${rating}`}
                          className="form-check-label"
                        >
                          {rating} <FaStar className="text-warning" /> & up
                        </label>
                      </div>
                    ))}

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rating-all"
                        checked={filters.ratings.length === 0}
                        onChange={() =>
                          setFilters((prev) => ({ ...prev, ratings: [] }))
                        }
                      />
                      <label htmlFor="rating-all" className="form-check-label">
                        All Ratings
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* CLEAR FILTERS */}
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={() =>
                  setFilters({
                    languages: [],
                    specializations: [],
                    ratings: [],
                  })
                }
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* ============================= */}
          {/* RIGHT SIDE – GUIDE LIST        */}
          {/* ============================= */}
          <div className="col-md-9 px-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Found {filteredGuides.length} guides</h5>
            </div>

            {/* GUIDE CARDS */}
            {filteredGuides.map((guide) => (
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

                        <p className="mb-2 small text-secondary">
                          {guide.professionalSummary}
                        </p>

                        {/* LANGUAGES */}
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

                        {/* TOURS */}
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
                        {guide.rating && (
                          <div className="mb-2">
                            <span className="badge bg-warning text-dark">
                              ⭐ {guide.rating}
                            </span>
                          </div>
                        )}
                        {/* <span className="badge bg-light text-success small mt-1">
                          Available Today
                        </span> */}
                      </div>
                    </div>

                    {/* BOOK NOW */}
                    <button
                      className="explore-btn mt-3"
                      onClick={() =>
                        navigate(`/guide/${guide.guideId}`, {
                          state: {
                            guideData: guide,
                            startDate: startDate,
                            endDate: endDate,
                            city: selectedCity,
                          },
                        })
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredGuides.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">No guides match your filters.</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    setFilters({
                      languages: [],
                      specializations: [],
                      ratings: [],
                    })
                  }
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideList;
