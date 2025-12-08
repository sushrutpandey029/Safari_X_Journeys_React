import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bus.css";
import { fetchBoardingPoints } from "../services/busservice";
import { getUserData } from "../utils/storage";
import useCashfreePayment from "../hooks/useCashfreePayment";

const BusCheckout = () => {
  const { startPayment } = useCashfreePayment();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location?.state || {};

  const [busDetails, setBusDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [selectedDropping, setSelectedDropping] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    email: "",
    mobile: "",
  });
  const [insurance, setInsurance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);

  const BOOK_ENDPOINT = "https://busbe.tektravels.com/BusService.svc/rest/Book";

  // --------------------------- UTILS ------------------------------

  const formatTime = (d) =>
    d
      ? new Date(d).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "--:--";

  const formatFullDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const diff = new Date(end) - new Date(start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  // --------------------------- FETCH BOARDING POINTS ------------------------------

  const fetchBoardingPointsData = async (busData) => {
    try {
      setApiLoading(true);
      const TokenId = busData?.TokenId || state.tokenId;
      const TraceId = busData?.TraceId || state.traceId;
      const ResultIndex = busData?.ResultIndex ?? state.resultIndex;

      if (!TokenId || !TraceId || ResultIndex == null) {
        setError("Missing TokenId / TraceId / ResultIndex");
        return;
      }

      const response = await fetchBoardingPoints(TokenId, TraceId, ResultIndex);
      console.log("response of fetchboardingpoints", response);
      const boardingData =
        response?.data?.BoardingPointsDetails ||
        response?.BoardingPointsDetails ||
        response?.boardingPoints ||
        [];

      const droppingData =
        response?.data?.DroppingPointsDetails ||
        response?.DroppingPointsDetails ||
        response?.droppingPoints ||
        [];

      setBoardingPoints(boardingData);
      setDroppingPoints(droppingData);

      if (boardingData.length > 0) setSelectedBoarding(boardingData[0]);
      if (droppingData.length > 0) setSelectedDropping(droppingData[0]);
    } catch (err) {
      setError("Failed to load boarding points");
    } finally {
      setApiLoading(false);
    }
  };

  // --------------------------- INITIALIZE ------------------------------

  useEffect(() => {
    const init = async () => {
      const bus =
        state?.bus || JSON.parse(localStorage.getItem("selectedBus") || "null");
      const seats =
        state?.seats ||
        JSON.parse(localStorage.getItem("selectedSeats") || "[]");

      if (!bus) {
        setError("No bus details found");
        setLoading(false);
        return;
      }
      console.log("seats", seats);
      console.log("bus", bus);
      setBusDetails(bus);
      setSelectedSeats(seats);

      await fetchBoardingPointsData(bus);
      setLoading(false);
    };
    init();
  }, [location]);

  // --------------------------- MAP SEATS TO PASSENGERS ------------------------------

  useEffect(() => {
    console.log("selected seats", selectedSeats);
    if (!selectedSeats || !busDetails) return;

    const arr = selectedSeats.map((seat, i) => ({
      id: i + 1,
      seatNumber: seat.number || seat.seatNumber,
      name: "",
      age: "",
      gender: "Male",
      price: seat.price,
      seatIndex: seat.seatIndex ?? seat.SeatIndex ?? 0,
      idType: "",
      idNumber: "",
    }));

    setPassengers(arr);
  }, [selectedSeats, busDetails]);

  const handlePassengerChange = (i, f, v) => {
    const arr = [...passengers];
    arr[i][f] = v;
    setPassengers(arr);
  };

  const handleContactChange = (f, v) => {
    setContactDetails((s) => ({ ...s, [f]: v }));
  };

  const calculateTotalPrice = () => {
    return (
      passengers.reduce((t, p) => t + (Number(p.price) || 0), 0) +
      (insurance ? 15 : 0)
    );
  };

  // --------------------------- NAME SPLIT ------------------------------

  const splitName = (full) => {
    const parts = full.trim().split(/\s+/);
    return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
  };

  // --------------------------- FINAL SUBMIT ------------------------------

  const handleFinalSubmit = async () => {
    if (!selectedBoarding || !selectedDropping)
      return alert("Select boarding & dropping points");
    if (!contactDetails.email || !contactDetails.mobile)
      return alert("Enter contact details");
    if (passengers.some((p) => !p.name || !p.age))
      return alert("Enter passenger details");
    if (passengers.some((p) => !p.idType || !p.idNumber))
      return alert("Enter ID type & ID number");

    const userdetails = await getUserData("safarix_user");

    const TokenId = busDetails?.TokenId || state.tokenId;
    const TraceId = busDetails?.TraceId || state.traceId;
    const ResultIndex = busDetails?.ResultIndex ?? state.resultIndex;

    const Passenger = passengers.map((p, i) => {
      const { firstName, lastName } = splitName(p.name);

      return {
        Title: p.gender === "Male" ? "Mr" : "Ms",
        FirstName: firstName,
        LastName: lastName,
        Age: Number(p.age),
        Gender: p.gender === "Female" ? 2 : 1,
        Email: contactDetails.email,
        PhoneNo: contactDetails.mobile,
        IDType: p.idType,
        IDNumber: p.idNumber,
        Address: "NA",
        Seat: {
          SeatIndex: p.seatIndex,
        },
        Price: {
          BasePrice: Number(p.price),
          Tax: 0,
        },
      };
    });
    console.log("selected boarding", selectedBoarding);
    const payload = {
      userId: userdetails?.id,
      serviceType: "bus",
      vendorType: "bus",
      vendorId: null,
      // EndUserIp: "127.0.0.1",
      // TokenId,
      // TraceId,
      // ResultIndex,
      // BoardingPointId: selectedBoarding.CityPointIndex,
      // DropingPointId: selectedDropping.CityPointIndex,
      // Passenger,
      startDate: selectedBoarding.CityPointTime,
      totalAmount: calculateTotalPrice(),
      serviceDetails: {
        ResultIndex,
        TokenId,
        TraceId,
        Passenger,
        EndUserIp: "127.0.0.1",
        BoardingPointId: selectedBoarding.CityPointIndex,
        DroppingPointId: selectedDropping.CityPointIndex,
      },
    };

    console.log("FINAL BOOK PAYLOAD:", payload);
    const result = startPayment(payload);

    // Save payload for payment page
    // localStorage.setItem("Bus_Book_Payload", JSON.stringify(payload));

    // navigate("/payment", { state: { payload, total: calculateTotalPrice() } });
  };

  // --------------------------- UI HELPERS ------------------------------

  const getBusName = () =>
    busDetails?.travelName ||
    busDetails?.busName ||
    busDetails?.BusName ||
    "Bus";

  const getBusType = () =>
    busDetails?.busType || busDetails?.BusType || "AC Sleeper";

  const getRouteInfo = () =>
    `${busDetails?.from || busDetails?.origin} → ${
      busDetails?.to || busDetails?.destination
    }`;

  // --------------------------- UI ------------------------------

  if (loading) {
    return (
      <div className="bus-checkout" style={{ marginTop: "100px" }}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bus-checkout" style={{ marginTop: "100px" }}>
      <div className="checkout-container">
        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* HEADER */}
        <div className="checkout-header">
          <div className="header-content">
            <h1>{getBusName()}</h1>
            <div className="bus-meta">
              <span className="bus-type">{getBusType()}</span>
              <span className="route-info">{getRouteInfo()}</span>
            </div>
            <div className="journey-date">
              {formatFullDate(selectedBoarding?.CityPointTime)}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="checkout-content">
          {/* LEFT */}
          <div className="left-column">
            {/* Boarding */}
            <div className="section-card">
              <h2 className="section-title">Select Boarding Point</h2>
              <div className="points-list">
                {boardingPoints.map((p) => (
                  <div
                    key={p.CityPointIndex}
                    className={`point-item ${
                      selectedBoarding?.CityPointIndex === p.CityPointIndex
                        ? "selected"
                        : ""
                    }`}
                  >
                    <label className="point-radio">
                      <input
                        type="radio"
                        name="boarding"
                        checked={
                          selectedBoarding?.CityPointIndex === p.CityPointIndex
                        }
                        onChange={() => setSelectedBoarding(p)}
                      />
                      <span className="radiomark"></span>
                      <div className="point-content">
                        <div className="point-time-badge">
                          {formatTime(p.CityPointTime)}
                        </div>
                        <div>
                          <h4>{p.CityPointName}</h4>
                          <p>{p.CityPointLocation}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropping */}
            <div className="section-card">
              <h2 className="section-title">Select Dropping Point</h2>
              <div className="points-list">
                {droppingPoints.map((p) => (
                  <div
                    key={p.CityPointIndex}
                    className={`point-item ${
                      selectedDropping?.CityPointIndex === p.CityPointIndex
                        ? "selected"
                        : ""
                    }`}
                  >
                    <label className="point-radio">
                      <input
                        type="radio"
                        name="dropping"
                        checked={
                          selectedDropping?.CityPointIndex === p.CityPointIndex
                        }
                        onChange={() => setSelectedDropping(p)}
                      />
                      <span className="radiomark"></span>
                      <div className="point-content">
                        <div className="point-time-badge">
                          {formatTime(p.CityPointTime)}
                        </div>
                        <div>
                          <h4>{p.CityPointName}</h4>
                          <p>{p.CityPointLocation}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Passengers */}
            <div className="section-card">
              <h2 className="section-title">Passenger Details</h2>

              {passengers.map((p, i) => (
                <div key={i} className="passenger-card">
                  <h4>
                    Passenger {i + 1} — {p.seatNumber}
                  </h4>

                  <div className="passenger-form">
                    {/* Name */}
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        value={p.name}
                        onChange={(e) =>
                          handlePassengerChange(i, "name", e.target.value)
                        }
                        placeholder="Enter full name"
                      />
                    </div>

                    {/* Age & Gender */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Age</label>
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) =>
                            handlePassengerChange(i, "age", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          value={p.gender}
                          onChange={(e) =>
                            handlePassengerChange(i, "gender", e.target.value)
                          }
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    {/* ID Type */}
                    <div className="form-group">
                      <label>ID Proof Type</label>
                      <select
                        value={p.idType}
                        onChange={(e) =>
                          handlePassengerChange(i, "idType", e.target.value)
                        }
                      >
                        <option value="">Select ID</option>
                        <option value="Aadhar">Aadhar</option>
                        <option value="PAN">PAN</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>

                    {/* ID Number */}
                    <div className="form-group">
                      <label>ID Number</label>
                      <input
                        value={p.idNumber}
                        onChange={(e) =>
                          handlePassengerChange(i, "idNumber", e.target.value)
                        }
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="section-card">
              <h2 className="section-title">Contact Details</h2>

              <div className="form-group">
                <label>Email</label>
                <input
                  value={contactDetails.email}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Mobile</label>
                <input
                  maxLength="10"
                  value={contactDetails.mobile}
                  onChange={(e) =>
                    handleContactChange("mobile", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            <div className="summary-card">
              <h3>Fare Summary</h3>

              <div className="fare-item">
                <span>Base Fare ({passengers.length})</span>
                <span>
                  ₹{passengers.reduce((t, p) => t + (Number(p.price) || 0), 0)}
                </span>
              </div>

              <div className="fare-item">
                <label>
                  <input
                    type="checkbox"
                    checked={insurance}
                    onChange={(e) => setInsurance(e.target.checked)}
                  />
                  Insurance ₹15
                </label>
              </div>

              <div className="fare-total">
                <strong>Total</strong>
                <span>₹{calculateTotalPrice()}</span>
              </div>
            </div>

            {/* Final Button */}
            <button
              className="continue-btn"
              onClick={handleFinalSubmit}
              disabled={apiLoading}
            >
              {apiLoading ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCheckout;
