import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCityList } from "../services/hotelService"; // API functions
import HotelPopularDestination from "./HotelPopularDestination";
import "./HotelBooking.css";
function Hotel() {
  const navigate = useNavigate();

  // States
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [paxRooms, setPaxRooms] = useState([
    { Adults: 2, Children: 0, ChildrenAges: [] },
  ]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Default checkin/checkout = today/tomorrow
  useEffect(() => {
    const today = new Date();

    // ✅ check-in = tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // ✅ check-out = day after tomorrow
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const formatDate = (d) => d.toISOString().split("T")[0];

    setCheckIn(formatDate(tomorrow));
    setCheckOut(formatDate(dayAfterTomorrow));
  }, []);

  // Fetch cities
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

        if (cities.length > 0 && !selectedCity) {
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

  // Handle search
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

    // Navigate with state
    navigate("/hotel-list", { state: filters });
  };

  return (
    
    <div>
      <div className="tab-section">
      <div className="container search-box rounded shadow-sm">
        <div className="row g-3 align-items-end">
          {/* City */}
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

          {/* Check-in */}
          <div className="col-md-2">
            <label className="form-label">Check-In</label>
            <input
              type="date"
              className="form-control"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          {/* Check-out */}
          <div className="col-md-2">
            <label className="form-label">Check-Out</label>
            <input
              type="date"
              className="form-control"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
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
              {paxRooms.reduce((acc, r) => acc + r.Adults + r.Children, 0)}{" "}
              Guests
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
                          { Adults: 2, Children: 0, ChildrenAges: [] },
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
            <button className="btn form-control btn-primary w-100" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>
</div>
      <HotelPopularDestination />
    </div>
  );
}

export default Hotel;
