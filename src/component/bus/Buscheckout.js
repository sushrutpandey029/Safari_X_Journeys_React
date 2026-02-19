import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bus.css";
import { fetchBoardingPoints } from "../services/busservice";
import { getUserData } from "../utils/storage";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { bus_block } from "../services/busservice";

const BusCheckout = () => {
  const { startPayment } = useCashfreePayment();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location?.state || {};
  console.log("state in buscheckout", state);
  const traceId =
    state?.traceId || state?.bus?.TraceId || state?.bus?.traceId || null;

  const resultIndex =
    state?.resultIndex ??
    state?.bus?.ResultIndex ??
    state?.bus?.resultIndex ??
    null;

  const pricingFromSearch = state?.pricing || null;

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
  const [fieldErrors, setFieldErrors] = useState({});

  const [boardingSearch, setBoardingSearch] = useState("");
  const [droppingSearch, setDroppingSearch] = useState("");

  const [showBoardingDropdown, setShowBoardingDropdown] = useState(false);
  const [showDroppingDropdown, setShowDroppingDropdown] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [blockResponse, setBlockResponse] = useState(null);
  const [blockLoading, setBlockLoading] = useState(false);

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

  const filteredBoardingPoints = boardingPoints.filter((p) =>
    `${p.CityPointName} ${p.CityPointLocation}`
      .toLowerCase()
      .includes(boardingSearch.toLowerCase()),
  );

  const filteredDroppingPoints = droppingPoints.filter((p) =>
    `${p.CityPointName} ${p.CityPointLocation}`
      .toLowerCase()
      .includes(droppingSearch.toLowerCase()),
  );

  // --------------------------- FETCH BOARDING POINTS ------------------------------

  // const fetchBoardingPointsData = async (busData) => {
  //   try {
  //     setApiLoading(true);
  //     const TraceId = busData?.TraceId || state.traceId;
  //     const ResultIndex = busData?.ResultIndex ?? state.resultIndex;

  //     if (!TraceId || ResultIndex == null) {
  //       setError("Missing TraceId / ResultIndex");
  //       return;
  //     }

  //     const response = await fetchBoardingPoints(TraceId, ResultIndex);
  //     console.log("response of fetchboardingpoints", response);
  //     const boardingData =
  //       response?.data?.BoardingPointsDetails ||
  //       response?.BoardingPointsDetails ||
  //       response?.boardingPoints ||
  //       [];

  //     const droppingData =
  //       response?.data?.DroppingPointsDetails ||
  //       response?.DroppingPointsDetails ||
  //       response?.droppingPoints ||
  //       [];

  //     setBoardingPoints(boardingData);
  //     setDroppingPoints(droppingData);

  //     if (boardingData.length > 0) setSelectedBoarding(boardingData[0]);
  //     if (droppingData.length > 0) setSelectedDropping(droppingData[0]);
  //   } catch (err) {
  //     setError("Failed to load boarding points");
  //   } finally {
  //     setApiLoading(false);
  //   }
  // };

  const fetchBoardingPointsData = async () => {
    try {
      setApiLoading(true);
      setError(null);

      if (!traceId || resultIndex == null) {
        setError("Missing TraceId / ResultIndex");
        return;
      }

      console.log("📤 Calling Boarding API:", {
        traceId,
        resultIndex,
      });

      const response = await fetchBoardingPoints(traceId, resultIndex);

      console.log("📥 Boarding API Response:", response);

      const boardingData =
        response?.data?.BoardingPointsDetails ||
        response?.BoardingPointsDetails ||
        [];

      const droppingData =
        response?.data?.DroppingPointsDetails ||
        response?.DroppingPointsDetails ||
        [];

      setBoardingPoints(boardingData);
      setDroppingPoints(droppingData);

      if (boardingData.length > 0) {
        setSelectedBoarding(boardingData[0]);
      }

      if (droppingData.length > 0) {
        setSelectedDropping(droppingData[0]);
      }
    } catch (err) {
      console.error("Boarding API error:", err);
      setError("Failed to load boarding points");
    } finally {
      setApiLoading(false);
    }
  };

  // --------------------------- INITIALIZE ------------------------------

  // useEffect(() => {
  //   const init = async () => {
  //     const bus =
  //       state?.bus || JSON.parse(localStorage.getItem("selectedBus") || "null");
  //     const seats =
  //       state?.seats ||
  //       JSON.parse(localStorage.getItem("selectedSeats") || "[]");

  //     if (!bus) {
  //       setError("No bus details found");
  //       setLoading(false);
  //       return;
  //     }
  //     console.log("seats", seats);
  //     console.log("bus", bus);
  //     setBusDetails(bus);
  //     setSelectedSeats(seats);

  //     await fetchBoardingPointsData(bus);
  //     setLoading(false);
  //   };
  //   init();
  // }, [location]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const bus =
          state?.bus ||
          JSON.parse(localStorage.getItem("selectedBus") || "null");

        const seats =
          state?.seats ||
          JSON.parse(localStorage.getItem("selectedSeats") || "[]");

        if (!bus) {
          setError("No bus details found");
          return;
        }

        setBusDetails(bus);
        setSelectedSeats(seats);

        // ✅ CALL BOARDING API HERE
        await fetchBoardingPointsData();
      } catch (err) {
        console.error("Checkout init error:", err);
        setError("Failed to initialize checkout");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // --------------------------- MAP SEATS TO PASSENGERS ------------------------------

  useEffect(() => {
    console.log("selected seats", selectedSeats);
    if (!selectedSeats || !busDetails) return;

    const arr = selectedSeats.map((seat, i) => {
      const seatId =
        seat.SeatId ?? seat.SeatIndex ?? Number(seat.SeatName) ?? null;
      const price = seat.SeatFare ?? seat.Price ?? seat.Price?.BasePrice ?? 0;

      return {
        id: i + 1,
        seatNumber: seat.SeatName,
        firstName: "",
        lastName: "",
        age: "",
        gender: "Male",
        price,

        // REQUIRED
        fullSeatObject: seat, // <--- THIS is the key change

        seatIndex: seat.SeatIndex,
        seatName: seat.SeatName,
        idType: "",
        idNumber: "",
      };
    });

    setPassengers(arr);
  }, [selectedSeats, busDetails]);

  const handlePassengerChange = (i, f, v) => {
    const arr = [...passengers];
    arr[i][f] = v;
    setPassengers(arr);

    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[`passengers.${i}.${f}`];
      return copy;
    });
  };

  const handleContactChange = (f, v) => {
    setContactDetails((s) => ({ ...s, [f]: v }));

    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[`contact.${f}`];
      return copy;
    });
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

  const validateBookingData = () => {
    const errors = {};

    // Boarding / Dropping
    if (!selectedBoarding) errors.boarding = "Boarding point required";

    if (!selectedDropping) errors.dropping = "Dropping point required";

    // Contact
    if (!isValidEmail(contactDetails.email))
      errors["contact.email"] = "Invalid email";

    if (!isValidMobile(contactDetails.mobile))
      errors["contact.mobile"] = "Invalid mobile number";

    // Passengers
    passengers.forEach((p, i) => {
      if (!isValidName(p.firstName))
        errors[`passengers.${i}.firstName`] = "Invalid first name";

      if (!isValidName(p.lastName))
        errors[`passengers.${i}.lastName`] = "Invalid last name";

      if (!isValidAge(p.age)) errors[`passengers.${i}.age`] = "Invalid age";

      if (!isValidGender(p.gender))
        errors[`passengers.${i}.gender`] = "Gender must be Male or Female";

      // ID (MANDATORY FOR BOOK API)
      if (!isValidIdType(p.idType))
        errors[`passengers.${i}.idType`] = "Invalid ID type";

      if (!isValidIdNumber(p.idType, p.idNumber))
        errors[`passengers.${i}.idNumber`] = "Invalid ID number";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFinalSubmit = async () => {
    try {
      if (!selectedBoarding || !selectedDropping)
        return alert("Select boarding & dropping points");
      if (!validateBookingData()) {
        alert("Please fix highlighted errors");
        return;
      }

      setBlockLoading(true);

      const TokenId = busDetails?.TokenId || state.tokenId;
      const TraceId = busDetails?.TraceId || state.traceId;
      const ResultIndex = busDetails?.ResultIndex ?? state.resultIndex;

      // 🔴 BUS BLOCK PAYLOAD (MATCHES YOUR BACKEND)
      const blockPayload = {
        TokenId,
        TraceId,
        ResultIndex,
        BoardingPointId: selectedBoarding.CityPointIndex,
        DroppingPointId: selectedDropping.CityPointIndex,
        Passenger: passengers.map((p, i) => ({
          LeadPassenger: i === 0,
          Title: p.gender === "Male" ? "Mr" : "Ms",
          FirstName: p.firstName,
          LastName: p.lastName,
          Age: Number(p.age),
          Gender: p.gender === "Female" ? 2 : 1,
          Email: contactDetails.email,
          Phoneno: `+91-${contactDetails.mobile}`,
          IDType: p.idType,
          IDNumber: p.idNumber,
          Address: "NA",
          Seat: p.fullSeatObject,
        })),
        EndUserIp: "127.0.0.1",
      };

      console.log("📤 Calling BusBlock:", blockPayload);

      const res = await bus_block(blockPayload);

      if (!res?.data?.success) {
        alert(res?.data?.message || "Seat blocking failed");
        return;
      }

      // ✅ SAVE BLOCK RESULT
      setBlockResponse(res.data.data);
      localStorage.setItem("Bus_Block_Result", JSON.stringify(res.data.data));

      // ✅ OPEN CONFIRMATION MODAL
      setShowConfirmModal(true);
    } catch (err) {
      console.error("Bus block error", err);
      alert("Unable to block seats. Please try again.");
    } finally {
      setBlockLoading(false);
    }
  };

  const pricingBreakup = {
    currency: "INR",
    seatsCount: selectedSeats.length,

    // ✅ NET AMOUNT (paid to TBO)
    busCharges: Number(
      selectedSeats
        .reduce((sum, seat) => sum + (seat.Pricing?.netFare ?? 0), 0)
        .toFixed(2),
    ),

    // ✅ YOUR COMMISSION
    serviceFee: Number(
      selectedSeats
        .reduce((sum, seat) => sum + (seat.Pricing?.commissionAmount ?? 0), 0)
        .toFixed(2),
    ),

    // ✅ GST ON COMMISSION
    gst: Number(
      selectedSeats
        .reduce((sum, seat) => sum + (seat.Pricing?.gstAmount ?? 0), 0)
        .toFixed(2),
    ),

    // ✅ FINAL AMOUNT USER PAID
    totalAmount: Number(
      selectedSeats
        .reduce((sum, seat) => sum + (seat.Pricing?.finalAmount ?? 0), 0)
        .toFixed(2),
    ),

    // ✅ SEAT LEVEL (for PDF / refund)
    seatCharges: selectedSeats.map((seat) => ({
      seatIndex: seat.SeatIndex,
      seatName: seat.SeatName,
      netFare: seat.Pricing?.netFare ?? 0,
      commissionAmount: seat.Pricing?.commissionAmount ?? 0,
      gstAmount: seat.Pricing?.gstAmount ?? 0,
      finalAmount: seat.Pricing?.finalAmount ?? 0,
    })),
  };

  const handleBookNow = async () => {
    try {
      setShowConfirmModal(false);

      const userdetails = await getUserData("safarix_user");
      if (!userdetails?.id) {
        alert("User not logged in");
        return;
      }

      const TokenId = busDetails?.TokenId || state.tokenId;
      const TraceId = busDetails?.TraceId || state.traceId;
      const ResultIndex = busDetails?.ResultIndex ?? state.resultIndex;

      if (!blockResponse) {
        alert("Block data missing. Please try again.");
        return;
      }

      // ✅ FINAL BOOKING + PAYMENT PAYLOAD (INDUSTRY FORMAT)
      const bookingPayload = {
        userId: userdetails.id,
        serviceType: "bus",
        vendorType: "bus",
        vendorId: null, // ✅ (can be operatorId later)
        startDate: formatFullDate(selectedBoarding?.CityPointTime),

        // totalAmount: calculateTotalPrice(),
        totalAmount: pricingBreakup.totalAmount,

        pricing: pricingBreakup,

        insuranceSelected: insurance,

        serviceDetails: {
          TokenId,
          TraceId,
          ResultIndex,

          // 🔐 BLOCK DATA
          BlockId: blockResponse.BlockId || blockResponse.TraceId,

          BoardingPointId: selectedBoarding.CityPointIndex,
          DroppingPointId: selectedDropping.CityPointIndex,
          // ✅ SAVE PRICING AGAIN (SERVICE LEVEL)
          Pricing: pricingBreakup,
          Passenger: passengers.map((p, i) => ({
            LeadPassenger: i === 0,
            IsPrimary: i === 0,
            Title: p.gender === "Male" ? "Mr" : "Ms",
            FirstName: p.firstName,
            LastName: p.lastName,
            Age: Number(p.age),
            Gender: p.gender === "Female" ? 2 : 1,
            Email: contactDetails.email,
            Phoneno: `+91-${contactDetails.mobile}`,
            IDType: p.idType,
            IDNumber: p.idNumber,
            Address: "NA",

            // 🔴 MUST send FULL seat object
            Seat: p.fullSeatObject,
          })),

          EndUserIp: "127.0.0.1",
        },
      };

      console.log("💳 FINAL PAYMENT PAYLOAD:", bookingPayload);

      // ✅ START PAYMENT (Cashfree)
      startPayment(bookingPayload);
    } catch (err) {
      console.error("❌ Book Now Error:", err);
      alert("Unable to proceed with booking. Please try again.");
    }
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

  // ---------------------------  validations ------------------------------

  const isValidName = (name) => {
    if (!name) return false;
    if (!/^[A-Za-z][A-Za-z ]+$/.test(name)) return false;
    return name.trim().length >= 2;
  };
  const isValidAge = (age) => {
    const n = Number(age);
    return Number.isInteger(n) && n > 0 && n <= 120;
  };
  const isValidGender = (gender) => {
    return gender === "Male" || gender === "Female";
  };
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

  const ALLOWED_ID_TYPES = ["PAN", "Passport", "Voter ID"];

  const isValidIdType = (type) => ALLOWED_ID_TYPES.includes(type);

  const isValidIdNumber = (type, value) => {
    if (!value) return false;

    switch (type) {
      case "PAN":
        return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase());

      case "Passport":
        return /^[A-Z0-9]{6,}$/i.test(value);

      case "Voter ID":
        return /^[A-Z0-9]{6,}$/i.test(value);

      default:
        return false;
    }
  };

  const getSeatLabel = (seat) => {
    if (!seat) return "";

    const seatNo = seat.SeatName || seat.SeatIndex;

    // SeatType mapping (from TBO docs)
    const seatTypeMap = {
      1: "Seat",
      2: "Sleeper",
      3: "Seat / Sleeper",
      4: "Upper Berth",
      5: "Lower Berth",
    };

    let type = seatTypeMap[seat.SeatType] || "Seat";

    // Upper / Lower override
    if (seat.IsUpper) type = "Upper Berth";
    if (seat.SeatType === 2 && !seat.IsUpper) type = "Lower Berth";

    // Gender restriction
    let genderTag = "";
    if (seat.IsLadiesSeat) genderTag = " (Ladies)";
    if (seat.IsMalesSeat) genderTag = " (Male)";

    return `Seat ${seatNo} • ${type}${genderTag}`;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".position-relative")) {
        setShowBoardingDropdown(false);
        setShowDroppingDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const busCharges = selectedSeats.reduce(
    (sum, seat) => sum + (seat.Pricing?.netFare ?? 0),
    0,
  );

  const serviceAndGST = selectedSeats.reduce(
    (sum, seat) =>
      sum +
      (seat.Pricing?.commissionAmount ?? 0) +
      (seat.Pricing?.gstAmount ?? 0),
    0,
  );

  const totalPayable = busCharges + serviceAndGST;

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

              <div className="position-relative">
                <input
                  className="form-control"
                  placeholder={
                    apiLoading
                      ? "Loading boarding points..."
                      : "Search boarding point"
                  }
                  value={
                    showBoardingDropdown
                      ? boardingSearch
                      : selectedBoarding?.CityPointName || ""
                  }
                  onFocus={() => setShowBoardingDropdown(true)}
                  onChange={(e) => {
                    setBoardingSearch(e.target.value);
                    setShowBoardingDropdown(true);
                  }}
                  disabled={apiLoading}
                />

                {showBoardingDropdown && (
                  <div className="dropdown-list">
                    {filteredBoardingPoints.length > 0 ? (
                      filteredBoardingPoints.map((p) => (
                        <div
                          key={p.CityPointIndex}
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedBoarding(p);
                            setBoardingSearch("");
                            setShowBoardingDropdown(false);
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <strong>{p.CityPointName}</strong>
                            <span className="badge bg-light text-dark">
                              {formatTime(p.CityPointTime)}
                            </span>
                          </div>
                          <small className="text-muted">
                            {p.CityPointLocation}
                          </small>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-empty">
                        No boarding points found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dropping */}
            <div className="section-card">
              <h2 className="section-title">Select Dropping Point</h2>

              <div className="position-relative">
                <input
                  className="form-control"
                  // placeholder="Search dropping point"
                  placeholder={
                    apiLoading
                      ? "Loading dropping points..."
                      : "Search dropping point"
                  }
                  disabled={apiLoading}
                  value={
                    showDroppingDropdown
                      ? droppingSearch
                      : selectedDropping?.CityPointName || ""
                  }
                  onFocus={() => setShowDroppingDropdown(true)}
                  onChange={(e) => {
                    setDroppingSearch(e.target.value);
                    setShowDroppingDropdown(true);
                  }}
                />

                {showDroppingDropdown && (
                  <div className="dropdown-list">
                    {filteredDroppingPoints.length > 0 ? (
                      filteredDroppingPoints.map((p) => (
                        <div
                          key={p.CityPointIndex}
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedDropping(p);
                            setDroppingSearch("");
                            setShowDroppingDropdown(false);
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <strong>{p.CityPointName}</strong>
                            <span className="badge bg-light text-dark">
                              {formatTime(p.CityPointTime)}
                            </span>
                          </div>
                          <small className="text-muted">
                            {p.CityPointLocation}
                          </small>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-empty">
                        No dropping points found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Passengers */}
            <div className="section-card">
              <h2 className="section-title">Passenger Details</h2>

              {passengers.map((p, i) => (
                <div key={i} className="passenger-card">
                  <h4>
                    Passenger {i + 1}
                    {/* Passenger {i + 1} — {p.seatNumber} */}
                  </h4>

                  <div className="passenger-form">
                    {/* First Name */}
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        value={p.firstName}
                        onChange={(e) =>
                          handlePassengerChange(i, "firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                      />
                      {fieldErrors[`passengers.${i}.firstName`] && (
                        <small className="text-danger">
                          {fieldErrors[`passengers.${i}.firstName`]}
                        </small>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        value={p.lastName}
                        onChange={(e) =>
                          handlePassengerChange(i, "lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                      />
                      {fieldErrors[`passengers.${i}.lastName`] && (
                        <small className="text-danger">
                          {fieldErrors[`passengers.${i}.lastName`]}
                        </small>
                      )}
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
                        {fieldErrors[`passengers.${i}.age`] && (
                          <small className="text-danger">
                            {fieldErrors[`passengers.${i}.age`]}
                          </small>
                        )}
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
                        {fieldErrors[`passengers.${i}.gender`] && (
                          <small className="text-danger">
                            {fieldErrors[`passengers.${i}.gender`]}
                          </small>
                        )}
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
                        <option value="PAN">PAN</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                      {fieldErrors[`passengers.${i}.idType`] && (
                        <small className="text-danger">
                          {fieldErrors[`passengers.${i}.idType`]}
                        </small>
                      )}
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
                      {fieldErrors[`passengers.${i}.idNumber`] && (
                        <small className="text-danger">
                          {fieldErrors[`passengers.${i}.idNumber`]}
                        </small>
                      )}
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
                {fieldErrors["contact.email"] && (
                  <small className="text-danger">
                    {fieldErrors["contact.email"]}
                  </small>
                )}
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
                {fieldErrors["contact.mobile"] && (
                  <small className="text-danger">
                    {fieldErrors["contact.mobile"]}
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            {/* <div className="summary-card">
              <h3>Fare Summary</h3>

              <div className="fare-item">
                <span>Base Fare ({passengers.length})</span>
                <span>
                  ₹{passengers.reduce((t, p) => t + (Number(p.price) || 0), 0)}
                </span>
              </div>

              <div className="fare-total">
                <strong>Total</strong>
                <span>₹{calculateTotalPrice()}</span>
              </div>
            </div> */}
            <div className="summary-card">
              <h3>Fare Summary</h3>

              <div className="fare-item">
                <span>Bus Charges</span>
                <span>₹{Math.ceil(busCharges)}</span>
              </div>

              <div className="fare-item">
                <span>GST & Service Fee</span>
                <span>₹{Math.ceil(serviceAndGST)}</span>
              </div>

              <hr />

              <div className="fare-total">
                <strong>Total Amount</strong>
                <span>₹{Math.ceil(totalPayable)}</span>
              </div>
            </div>

            {/* Final Button */}
            <button
              className="continue-btn"
              onClick={handleFinalSubmit}
              disabled={apiLoading || !selectedBoarding || !selectedDropping}
            >
              {blockLoading ? "Blocking Seats..." : "Continue to Payment"}
            </button>
          </div>
        </div>
      </div>
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Booking</h3>

            <p>
              <strong>Bus:</strong> {blockResponse?.TravelName}
            </p>
            <p>
              <strong>Seats:</strong>{" "}
              {passengers.map((p) => p.seatNumber).join(", ")}
            </p>

            <p>
              <strong>Total Fare:</strong> ₹{Math.ceil(totalPayable)}
              {/* <strong>Total Fare:</strong> ₹{calculateTotalPrice()} */}
            </p>

            {blockResponse?.IsPriceChanged && (
              <p className="text-danger">
                Fare has changed. Please review before proceeding.
              </p>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)}>Cancel</button>

              <button className="confirm-btn" onClick={handleBookNow}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCheckout;
