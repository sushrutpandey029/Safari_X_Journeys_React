

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCityList, getCountryList } from "../services/hotelService";
import HotelPopularDestination from "./HotelPopularDestination";
import "./HotelBooking.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Hotel() {
  const navigate = useNavigate();

  // States
  const [cityList, setCityList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);

  // Country search states
  const [countrySearch, setCountrySearch] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const countrySearchRef = useRef(null);

  // City select state
  const [paxRooms, setPaxRooms] = useState([
    { Adults: 1, Children: 0, ChildrenAges: [] },
  ]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all countries from API and set default to India
  const fetchAllCountry = async () => {
    try {
      const resp = await getCountryList();

      const sortedCountries = resp.sort((a, b) =>
        a.Name.localeCompare(b.Name)
      );

      setCountryList(sortedCountries);
      setFilteredCountries(sortedCountries);

      // Set default country name based on selectedCountry ("IN")
      const defaultCountry = sortedCountries.find(
        (country) => country.Code === selectedCountry
      );

      if (defaultCountry) {
        setCountrySearch(defaultCountry.Name); // Shows "India" by default
      }
    } catch (err) {
      console.log("err in country list", err.response);
    }
  };

  // ✅ Handle country search input change
  const handleCountrySearch = (e) => {
    const value = e.target.value;
    setCountrySearch(value);

    if (value.trim() === "") {
      setFilteredCountries(countryList);
    } else {
      const filtered = countryList.filter((country) =>
        country.Name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCountries(filtered);
    }

    setShowCountrySuggestions(true);
  };

  // ✅ Handle country selection from dropdown
  const handleCountrySelect = (country) => {
    setSelectedCountry(country.Code);
    setCountrySearch(country.Name);
    setShowCountrySuggestions(false);

    // Reset city when country changes
    setSelectedCity("");
    setSelectedCityName("");
  };

  // ✅ Default check-in = tomorrow, check-out = day after tomorrow
  useEffect(() => {
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const formatDate = (d) => d.toISOString().split("T")[0];

    setCheckIn(formatDate(tomorrow));
    setCheckOut(formatDate(dayAfterTomorrow));
  }, []);

  // ✅ Click outside → close country suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countrySearchRef.current &&
        !countrySearchRef.current.contains(event.target)
      ) {
        setShowCountrySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch cities when selectedCountry changes
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await getCityList(selectedCountry);

        let cities = [];
        if (Array.isArray(data)) cities = data;
        else if (data?.CityList) cities = data.CityList;
        else if (data?.data?.CityList) cities = data.data.CityList;

        setCityList(cities);

        if (cities.length > 0) {
          setSelectedCity(cities[0].CityCode || cities[0].Code);
          setSelectedCityName(
            cities[0].CityName || cities[0].Name || cities[0].City
          );
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  // ✅ Fetch countries on mount
  useEffect(() => {
    fetchAllCountry();
  }, []);

  // Handle search → navigate to hotel-list
  const handleSearch = () => {
    const filters = {
      country: selectedCountry,
      city: selectedCity,
      cityName: selectedCityName,
      checkIn,
      checkOut,
      rooms,
      paxRooms,
    };

    console.log(
      "➡️ Passing Filters to hotel-list:",
      JSON.stringify(filters, null, 2)
    );

    navigate("/hotel-list", { state: filters });
  };

  return (
    <div>
      <div className="hotel-section" style={{ marginTop: 98 }}>
        <div className="search-box rounded shadow-sm hotel-form">
          <div className="container">
            <div className="row g-3 align-items-end">

              {/* ✅ Country - Searchable Autocomplete */}
              <div className="col-md-2 position-relative" ref={countrySearchRef}>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search country..."
                  value={countrySearch}
                  onChange={handleCountrySearch}
                  onFocus={() => {
                    setFilteredCountries(countryList);
                    setShowCountrySuggestions(true);
                  }}
                />
                {showCountrySuggestions && filteredCountries.length > 0 && (
                  <div
                    className="position-absolute bg-white border w-100 shadow-sm"
                    style={{ maxHeight: "200px", overflowY: "auto", zIndex: 1000 }}
                  >
                    {filteredCountries.map((country, idx) => (
                      <div
                        key={idx}
                        className="p-2 suggestion-item"
                        style={{ cursor: "pointer" }}
                        onMouseDown={() => handleCountrySelect(country)}
                      >
                        {country.Name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* City - Plain Select */}
              <div className="col-md-2">
                <label className="form-label">City</label>
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
                  }}
                  disabled={loading}
                >
                  <option value="">-- Select City --</option>
                  {cityList.map((city, idx) => (
                    <option key={idx} value={city.CityCode || city.Code}>
                      {city.CityName || city.Name || city.City}
                    </option>
                  ))}
                </select>
              </div>

              {/* Check-In */}
              <div className="col-md-2">
                <label className="form-label">Check-In</label>
                <DatePicker
                  selected={checkIn ? new Date(checkIn) : null}
                  onChange={(date) => {
                    if (!date) return;
                    const checkInDate = date.toISOString().split("T")[0];
                    setCheckIn(checkInDate);

                    const nextDay = new Date(date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setCheckOut(nextDay.toISOString().split("T")[0]);
                  }}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  placeholderText="Select Check-In"
                />
              </div>

              {/* Check-Out */}
              <div className="col-md-2">
                <label className="form-label">Check-Out</label>
                <DatePicker
                  selected={checkOut ? new Date(checkOut) : null}
                  onChange={(date) =>
                    setCheckOut(date ? date.toISOString().split("T")[0] : "")
                  }
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  minDate={checkIn ? new Date(checkIn) : new Date()}
                  excludeDates={checkIn ? [new Date(checkIn)] : []}
                  placeholderText="Select Check-Out"
                />
              </div>

              {/* Rooms/Guests */}
              <div className="col-md-4 position-relative">
                <label className="form-label">Rooms/Guests</label>
                <div
                  className="form-control d-flex justify-content-between align-items-center"
                  onClick={() => setOpen(!open)}
                  style={{ cursor: "pointer" }}
                >
                  {rooms} Room{rooms > 1 ? "s" : ""},{" "}
                  {paxRooms.reduce((acc, r) => acc + r.Adults + r.Children, 0)} Guests
                  <span>▼</span>
                </div>

                {open && (
                  <div
                    className="border rounded p-3 bg-white shadow-sm position-absolute mt-1"
                    style={{ zIndex: 1000, width: "100%" }}
                  >
                    {paxRooms.map((room, idx) => (
                      <div key={idx} className="mb-3">
                        <h6 className="fw-bold mb-2">Room {idx + 1}</h6>

                        <div className="d-flex align-items-center gap-4 mb-2">
                          {/* Adults */}
                          <div>
                            <label className="form-label">Adults</label>
                            <div className="d-flex align-items-center">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                  const updated = [...paxRooms];
                                  if (updated[idx].Adults > 1)
                                    updated[idx].Adults -= 1;
                                  setPaxRooms(updated);
                                }}
                              >
                                -
                              </button>
                              <span className="px-3">{room.Adults}</span>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                  const updated = [...paxRooms];
                                  if (updated[idx].Adults < 8)
                                    updated[idx].Adults += 1;
                                  setPaxRooms(updated);
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div>
                            <label className="form-label">Children</label>
                            <div className="d-flex align-items-center">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                  const updated = [...paxRooms];
                                  if (updated[idx].Children > 0) {
                                    updated[idx].Children -= 1;
                                    updated[idx].ChildrenAges = updated[
                                      idx
                                    ].ChildrenAges.slice(0, updated[idx].Children);
                                  }
                                  setPaxRooms(updated);
                                }}
                              >
                                -
                              </button>
                              <span className="px-3">{room.Children}</span>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                  const updated = [...paxRooms];
                                  if (updated[idx].Children < 4) {
                                    updated[idx].Children += 1;
                                    updated[idx].ChildrenAges.push(1);
                                  }
                                  setPaxRooms(updated);
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Children Ages */}
                        {room.Children > 0 && (
                          <div>
                            <label className="form-label">Age(s) of Children</label>
                            <div className="d-flex gap-2">
                              {room.ChildrenAges.map((age, cIdx) => (
                                <select
                                  key={cIdx}
                                  className="form-control"
                                  style={{ width: "80px" }}
                                  value={age}
                                  onChange={(e) => {
                                    const updated = [...paxRooms];
                                    updated[idx].ChildrenAges[cIdx] = Number(
                                      e.target.value
                                    );
                                    setPaxRooms(updated);
                                  }}
                                >
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                    (a) => (
                                      <option key={a} value={a}>
                                        {a}
                                      </option>
                                    )
                                  )}
                                </select>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add/Remove Room */}
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => {
                          if (rooms < 5) {
                            setRooms(rooms + 1);
                            setPaxRooms([
                              ...paxRooms,
                              { Adults: 1, Children: 0, ChildrenAges: [] },
                            ]);
                          }
                        }}
                      >
                        + Add Room
                      </button>
                      {rooms > 1 && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setRooms(rooms - 1);
                            setPaxRooms(paxRooms.slice(0, -1));
                          }}
                        >
                          Remove Room
                        </button>
                      )}
                    </div>

                    <button
                      className="btn btn-dark w-100 mt-3"
                      onClick={() => setOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="col-md-2">
                <button
                  className="form-control explore-btnnew w-100"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      <HotelPopularDestination />
    </div>
  );
}

export default Hotel;