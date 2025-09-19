import React, { useState, useEffect } from "react";
import "./CabList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../services/apiEndpoints";
import { fetchCabList } from "../services/cabService";
import { useNavigate } from "react-router-dom";

function CabList() {
  const [cabData, setCabData] = useState([]);
  const [toggle, setToggle] = useState({
    showProperties: true,
    price: true,
    star: true,
  });
  const navigate = useNavigate();

  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getCabList = async () => {
    try {
      const resp = await fetchCabList();
      setCabData(resp.data);
    } catch (err) {
      console.error("Error in listing cab:", err?.response || err);
    }
  };

  const handleNavigate = (item) => {
    navigate("/cab-details", { state: { cab: item } });
  };

  useEffect(() => {
    getCabList();
  }, []);

  return (
    <div>
      {/* Search Section */}
      <div className="col-sm-12">
        {/* <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Hotels
            </li>
          </ol>
        </nav> */}

        <div className="col-sm-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Cabs
              </li>
            </ol>
          </nav>

          <div className="cab-section ">
            <div className="container search-box rounded shadow-sm">
              <div className="row mb-4 g-2 align-items-center">
                <div className="col-md-3">
                  <select className="form-select" defaultValue="">
                    <option disabled value="">
                      Trip Type
                    </option>
                    <option>One Way</option>
                    <option>Round Trip</option>
                    <option>Local</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <input type="date" className="form-control" />
                </div>
                <div className="col-md-2">
                  <input type="time" className="form-control" />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="From"
                  />
                </div>
                <div className="col-md-1">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+ Add Stops"
                  />
                </div>
                <div className="col-md-1">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="To"
                  />
                </div>
                <div className="col-md-1">
                  <button className="explore-btn">Search</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* FILTER COLUMN */}
          <div className="container">
          <div className="col-sm-3 mb-4">
          <div className="cab-card rounded-4 border shadow-sm p-3">
            <h5 className="mb-3 fw-bold">FILTER</h5>

            {/* Cab Type Filter */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("showProperties")}
                style={{ cursor: "pointer" }}
              >
                <span>Cab Type</span>
                <FontAwesomeIcon
                  icon={toggle.showProperties ? faChevronUp : faChevronDown}
                />
              </div>
              {toggle.showProperties && (
                <div className="filter-options mt-2">
                  {["Sedan", "Hatchback", "Suv"].map((item) => (
                    <div className="form-check" key={item}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`cab-${item}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`cab-${item}`}
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fuel Type Filter */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("price")}
                style={{ cursor: "pointer" }}
              >
                <span>Fuel Type</span>
                <FontAwesomeIcon
                  icon={toggle.price ? faChevronUp : faChevronDown}
                />
              </div>
              {toggle.price && (
                <div className="filter-options mt-2">
                  {["CNG", "Diesel", "Petrol"].map((item) => (
                    <div className="form-check" key={item}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`fuel-${item}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`fuel-${item}`}
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Car Model Filter */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("star")}
                style={{ cursor: "pointer" }}
              >
                <span>Car Model</span>
                <FontAwesomeIcon
                  icon={toggle.star ? faChevronUp : faChevronDown}
                />
              </div>
              {toggle.star && (
                <div className="filter-options mt-2">
                  {["Maruti", "Ertiga"].map((model) => (
                    <div className="form-check" key={model}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`model-${model}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`model-${model}`}
                      >
                        {model}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
       

       <div className="col-sm-9">
          <div className="row">
            {cabData.map((cab) => (
              <div className="col-sm-4 mb-4" key={cab.cabId}>
                <div className="cab-card rounded-4 border shadow-sm overflow-hidden h-100">
                  <div className="cab-image-wrapper">
                    <img
                      src={`${BASE_URL}/cab/images/${cab.imagePath}`}
                      alt="Cab"
                      className="cab-img img-fluid"
                      style={{
                        height: "150px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                  </div>
                  <div className="cab-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="fw-bold mb-0">{cab.cabtype}</h6>
                      <small className="text-muted">7 Ratings</small>
                    </div>
                    <p className="mb-2 text-muted small">
                      {cab.cabtype} <span className="dot">•</span> AC{" "}
                      <span className="dot">•</span> {cab.cabseats} Seats
                    </p>
                    <h6 className="spacious-title mb-3">Spacious Car</h6>
                    <div className="row text-muted small cab-features">
                      <div className="col-6">
                        <ul className="ps-3 mb-0">
                          <li>Extra Km Fare</li>
                          <li>Fuel Type</li>
                          <li>Cancellation</li>
                        </ul>
                      </div>
                      <div className="col-6">
                        <ul className="ps-3 mb-0">
                          <li>₹{cab.price_per_km}/Km</li>
                          <li>
                            {cab.hasDedicatedDriver
                              ? "Driver Included"
                              : "No Driver"}
                          </li>
                          <li>Free Till 1 Hour Of Departure</li>
                        </ul>
                      </div>
                    </div>
                    <div className="cab-footer pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div>
                          <div>
                            <small className="text-decoration-line-through text-muted">
                              ₹{cab.price_per_day + 500}
                            </small>
                            <small className="text-danger fw-semibold ms-2">
                              13% Off
                            </small>
                          </div>
                          <h5 className="fw-bold mb-0 mt-1">
                            ₹{cab.price_per_day}
                          </h5>
                          <small className="text-muted">+Taxes</small>
                        </div>

                        <button
                          className="explore-btn"
                          onClick={() => handleNavigate(cab)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
       

       </div>
        </div>
       </div>
        {/* CAB CARDS COLUMN */}
      </div>
   
  );
}

export default CabList;
