import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";
import { hotel_prebook } from "../services/hotelService";
import { toast } from "react-toastify";

const HotelCheckout = () => {
  const location = useLocation();
  const payload = location.state?.payload;
  const userdetails = getUserData("safarix_user");
  const { startPayment } = useCashfreePayment();
  const navigate = useNavigate();

  console.log("payload in hotel chckout", payload);

  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [preBookResponse, setPreBookResponse] = useState(null);
  const [finalNetAmount, setFinalNetAmount] = useState(0);
  const [preBookLoading, setPreBookLoading] = useState(false);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(payload?.startDate || "");
  const [endDate, setEndDate] = useState(payload?.endDate || "");
  const [city, setCity] = useState(payload?.city || "");
  const [roomsData, setRoomsData] = useState([]); // For dynamic rooms & passengers

  const [price, setPrice] = useState({
    basePrice: 0,
    tax: 0,
    totalFare: 0,
  });

  // ✅ UNIQUE KEY PER HOTEL BOOKING
  const HOTEL_FORM_STORAGE_KEY = "hotel_form_data";

  // PreBook on load data
  const [preBookInfo, setPreBookInfo] = useState(null);
  const [validationInfo, setValidationInfo] = useState(null);
  const [initialPreBookLoading, setInitialPreBookLoading] = useState(false);
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const validatePassengers = (roomsData, validationInfo) => {
    const nameRegex = /^(?![._-])[A-Za-z ]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{7,15}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    for (let r = 0; r < roomsData.length; r++) {
      const room = roomsData[r];
      const leadAdults = room.passengers.filter(
        (p) => p.PaxType === 1 && p.LeadPassenger,
      );

      if (leadAdults.length !== 1) {
        return `Room ${r + 1}: Exactly one adult must be lead passenger`;
      }

      for (let p = 0; p < room.passengers.length; p++) {
        const pax = room.passengers[p];

        // Title
        if (!["Mr", "Mrs", "Miss", "Ms"].includes(pax.Title)) {
          return `Invalid title in Room ${r + 1}`;
        }

        // Names
        if (!nameRegex.test(pax.FirstName)) {
          return `Invalid first name in Room ${r + 1}`;
        }

        if (!nameRegex.test(pax.LastName)) {
          return `Invalid last name in Room ${r + 1}`;
        }

        // Lead passenger rules
        if (pax.LeadPassenger) {
          if (!emailRegex.test(pax.Email)) {
            return `Invalid email for lead passenger (Room ${r + 1})`;
          }

          if (!phoneRegex.test(pax.PhoneNo || "")) {
            return `Invalid phone number for lead passenger (Room ${r + 1})`;
          }
        }

        // Child age
        // Child age
        if (pax.PaxType === 2) {
          if (pax.Age === "" || pax.Age < 1 || pax.Age > 12) {
            return `Invalid child age in Room ${r + 1}`;
          }
        }

        // PAN (optional)

        const isPanMandatory = validationInfo?.PanMandatory;
        const panCountRequired = validationInfo?.PanCountRequired || 0;

        let panCount = 0;

        if (pax.PAN) panCount++;

        if (isPanMandatory && pax.LeadPassenger) {
          if (!pax.PAN) {
            return `PAN is mandatory as per hotel rules (Room ${r + 1})`;
          }

          const pan = pax.PAN.toUpperCase();
          if (!panRegex.test(pan)) {
            return `Invalid PAN format (Room ${r + 1})`;
          }
        }
      }
    }

    return null;
  };

  const handleResetHotelForm = () => {
    if (
      !window.confirm("Are you sure you want to reset passenger form data?")
    ) {
      return;
    }

    // ✅ Reinitialize passengers from original payload
    const rooms = payload?.serviceDetails?.PaxRooms || [];

    const freshRooms = rooms.map((room) => {
      const passengers = [];

      // Adults
      for (let i = 0; i < (room.Adults || 0); i++) {
        passengers.push({
          Title: "Mr",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Email: "",
          Age: "",
          PhoneNo: "",
          PAN: "",
          PaxType: 1,
          LeadPassenger: i === 0,
        });
      }

      // Children
      for (let j = 0; j < (room.Children || 0); j++) {
        passengers.push({
          Title: "Miss",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Email: "",
          Age: room.ChildrenAges?.[j] || "",
          PhoneNo: "",
          PAN: "",
          PaxType: 2,
          LeadPassenger: false,
        });
      }

      return { passengers };
    });

    // ✅ Reset state
    setRoomsData(freshRooms);

    // ✅ Remove saved data
    localStorage.removeItem(HOTEL_FORM_STORAGE_KEY);

    toast.success("Passenger form reset successfully");
  };
  useEffect(() => {
    if (!userdetails) {
      toast.info("Please login first, before proceed to booking.", {
        toastId: "login-warning",
      });
    }
  }, []);

  useEffect(() => {
    if (!payload) {
      navigate("/hotel", { replace: true });
    }
  }, [payload, navigate]);

  useEffect(() => {
    if (!payload || !payload.serviceDetails) return;

    const details = payload.serviceDetails;
    console.log("details", details);

    // HOTEL BASIC INFO
    setHotel({
      id: details.hotelCode || "N/A",
      name: details.hotelName || "N/A",
      location: details.hotelAddress || "N/A",
      rating: details.hotelRating || 0,
      rooms: details.NoOfRooms || 0,
      address: details.hotelAddress || "Address not available",
      hotelCode: details.hotelCode,
      bookingCode: details.BookingCode,
      currency: details.currency || "INR",
      guestNationality: details.GuestNationality,
      responseTime: details.ResponseTime,
      isDetailedResponse: details.IsDetailedResponse,
    });

    // ✅ CORRECT PRICE EXTRACTION
    const basePrice = Number(details?.PriceBreakUp?.[0]?.RoomRate) || 0;

    const tax = Number(details?.TotalTax) || 0;

    const totalFare = Number(details?.TotalFare) || 0;

    setPrice({
      basePrice,
      tax,
      totalFare,
    });

    // PASSENGERS
    const rooms = details.PaxRooms || [];

    const roomsWithPassengers = rooms.map((room) => {
      const passengers = [];

      for (let i = 0; i < (room.Adults || 0); i++) {
        passengers.push({
          Title: "Mr",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Email: "",
          Age: "",
          PhoneNo: "",
          PAN: "",
          PaxType: 1,
          LeadPassenger: i === 0,
        });
      }

      for (let j = 0; j < (room.Children || 0); j++) {
        passengers.push({
          Title: "Mrs",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Email: "",
          Age: room.ChildrenAges?.[j] || "",
          PhoneNo: "",
          PAN: "",
          PaxType: 2,
          LeadPassenger: false,
        });
      }

      return { passengers };
    });

    setRoomsData(roomsWithPassengers);
  }, [payload]);

  // ✅ RESTORE HOTEL FORM DATA
  useEffect(() => {
    try {
      if (!roomsData || roomsData.length === 0) return;

      const saved = localStorage.getItem(HOTEL_FORM_STORAGE_KEY);

      if (!saved) {
        console.log("No saved hotel form found");
        return;
      }

      const parsed = JSON.parse(saved);

      console.log("Restoring hotel form:", parsed);

      // restore rooms passengers safely
      if (parsed.roomsData?.length) {
        setRoomsData((prev) =>
          prev.map((room, rIndex) => ({
            ...room,
            passengers: room.passengers.map((pax, pIndex) => ({
              ...pax,
              ...(parsed.roomsData?.[rIndex]?.passengers?.[pIndex] || {}),
            })),
          })),
        );
      }

      // restore dates & city
      if (parsed.startDate) setStartDate(parsed.startDate);
      if (parsed.endDate) setEndDate(parsed.endDate);
      if (parsed.city) setCity(parsed.city);

      console.log("✅ Hotel form restored");
    } catch (err) {
      console.error("Hotel restore error:", err);
    }
  }, [roomsData.length]); // critical dependency

  // ✅ AUTO SAVE HOTEL FORM DATA
  useEffect(() => {
    try {
      if (!roomsData || roomsData.length === 0) return;

      // prevent saving empty form
      const hasData = roomsData.some((room) =>
        room.passengers.some(
          (p) => p.FirstName || p.LastName || p.Email || p.PhoneNo || p.PAN,
        ),
      );

      if (!hasData) return;

      const dataToSave = {
        roomsData,
        startDate,
        endDate,
        city,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(HOTEL_FORM_STORAGE_KEY, JSON.stringify(dataToSave));

      console.log("💾 Hotel form saved");
    } catch (err) {
      console.error("Hotel save error:", err);
    }
  }, [roomsData, startDate, endDate, city]);

  const handlePassengerChange = (roomIndex, passengerIndex, field, value) => {
    const updatedRooms = [...roomsData];
    updatedRooms[roomIndex].passengers[passengerIndex][field] = value;
    setRoomsData(updatedRooms);
  };

  const handleSubmit = async (e) => {
    if (!userdetails) {
      alert("Please login first...");

      return;
    }
    if (!preBookInfo || !validationInfo) {
      alert("Please wait, validating booking rules...");
      return;
    }

    e.preventDefault();
    const validationError = validatePassengers(roomsData, validationInfo);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setPreBookLoading(true);

      if (!hotel?.bookingCode) {
        alert("BookingCode missing");
        return;
      }

      const res = await hotel_prebook({
        BookingCode: hotel.bookingCode,
      });

      if (!res?.data?.success) {
        alert(res?.data?.message || "PreBook failed");
        return;
      }

      const preBookData = res.data.data;
      console.log("📥 PreBook Response:", preBookData);

      const hotelResult = preBookData?.HotelResult?.[0];
      console.log("hotelresult", hotelResult);
      if (!hotelResult) {
        alert("Server error, please try again.");
        return;
      }
      if (
        hotelResult.IsPriceChanged ||
        hotelResult.IsCancellationPolicyChanged
      ) {
        alert(
          "Price or cancellation policy changed. Please review and continue.",
        );
        setFinalNetAmount(hotelResult.Rooms[0].NetAmount);
        setShowConfirmModal(true);
        return;
      }

      if (!hotelResult) {
        alert("Invalid PreBook response");
        return;
      }

      const netAmount = hotelResult?.Rooms?.[0]?.NetAmount;

      if (!netAmount) {
        alert("NetAmount missing from PreBook response");
        return;
      }

      setPreBookResponse(hotelResult);
      console.log("hotes results in prebook response", hotelResult);
      setFinalNetAmount(netAmount);
      setShowConfirmModal(true);
    } catch (err) {
      console.error("❌ PreBook error:", err);
      alert("Unable to prebook hotel");
    } finally {
      setPreBookLoading(false);
    }
  };

  const handleBookNow = async () => {
    try {
      if (!userdetails?.id) {
        alert("User not logged in");
        return;
      }

      const hotelRoomsDetails = roomsData.map((room) => ({
        HotelPassenger: room.passengers.map((pax) => ({
          Title: pax.Title,
          FirstName: pax.FirstName.trim(),
          MiddleName: pax.MiddleName || "",
          LastName: pax.LastName.trim(),
          Email: pax.Email,
          Phoneno: pax.PhoneNo,
          Age: pax.Age,
          PAN: pax.PAN || undefined,
          PaxType: pax.PaxType,
          LeadPassenger: pax.LeadPassenger,
        })),
      }));

      const bookingPayload = {
        userId: userdetails.id,
        serviceType: "hotel",
        vendorType: "hotel",
        vendorId: hotel?.hotelCode,
        startDate: startDate,
        totalAmount: Math.ceil(payload?.serviceDetails?.Pricing?.finalAmount),
        BookingCode: hotel?.bookingCode,
        IsVoucherBooking: true,
        GuestNationality: hotel?.guestNationality || "IN",
        serviceDetails: {
          ...payload.serviceDetails,
          startDate,
          endDate,
          city,
          NetAmount: finalNetAmount,
        },
        HotelRoomsDetails: hotelRoomsDetails,
      };

      console.log("💳 FINAL PAYMENT PAYLOAD:", bookingPayload);

      startPayment(bookingPayload);
      localStorage.removeItem(HOTEL_FORM_STORAGE_KEY);
    } catch (err) {
      console.error("❌ Book Now error:", err);
      alert("Unable to proceed with payment");
    }
  };

  useEffect(() => {
    if (!hotel?.bookingCode) return;
    const fetchPreBookInfo = async () => {
      try {
        setInitialPreBookLoading(true);
        const res = await hotel_prebook({
          BookingCode: hotel.bookingCode,
        });

        if (!res?.data?.success) {
          console.error("Initial PreBook failed");
          return;
        }

        const data = res.data.data;
        const hotelResult = data?.HotelResult?.[0];

        if (!hotelResult) return;

        setPreBookInfo(hotelResult);
        setValidationInfo(data?.ValidationInfo || null);

        console.log("Initial PreBook Data:", hotelResult);
        console.log("Validation Info:", data?.ValidationInfo);
      } catch (err) {
        console.error("Initial PreBook error:", err);
      } finally {
        setInitialPreBookLoading(false);
      }
    };

    fetchPreBookInfo();
  }, [hotel?.bookingCode]);
  if (!payload) return null;

  if (initialPreBookLoading) {
    return (
      <div className="container text-center" style={{ marginTop: "150px" }}>
        <div className="spinner-border text-primary mb-3"></div>
        <h5>Validating hotel availability...</h5>
        <p>Please wait while we fetch latest room details.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: "110px" }}>
      <div className="row">
        {/* LEFT SIDE: Hotel Info & Passenger Form */}
        <div className="col-md-8">
          <div className="card shadow-sm rounded-4 p-4 mb-3">
            <h3 className="mb-3 fw-bold">Hotel Checkout</h3>

            {/* HOTEL INFO */}
            <div className="card shadow-sm border p-3 mb-3 rounded-3">
              <h5 className="mb-3">{hotel?.name}</h5>

              <div className="hotel-info-grid">
                <p>
                  <b>📍 Location:</b> {hotel?.location}
                </p>

                <p>
                  <b>⭐ Rating:</b> {hotel?.rating} Star
                </p>

                <p>
                  <b>🏨 Rooms:</b> {hotel?.rooms}
                </p>

                <p>
                  <b>👥 Guests:</b>{" "}
                  {roomsData.reduce((acc, r) => acc + r.passengers?.length, 0)}
                </p>

                <p>
                  <b>📅 Start Date:</b> {startDate}
                </p>

                <p>
                  <b>📅 End Date:</b> {endDate}
                </p>
              </div>
            </div>
            {/* Reset Button */}
            <div className="d-flex justify-content-end mb-3">
              {localStorage.getItem(HOTEL_FORM_STORAGE_KEY) && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleResetHotelForm}
                >
                  Reset Form
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}></form>
            {/* DYNAMIC PASSENGER FORMS */}
            <form onSubmit={handleSubmit}>
              {roomsData.map((room, roomIndex) => (
                <div key={roomIndex} className="mb-4">
                  <h5 className="fw-bold mb-3">Room {roomIndex + 1}</h5>
                  {room.passengers.map((pax, paxIndex) => (
                    <div key={paxIndex} className="border rounded-3 p-3 mb-3">
                      <h6>
                        {pax.LeadPassenger
                          ? "Lead Passenger"
                          : `Passenger ${paxIndex + 1}`}
                      </h6>

                      <div className="row mb-2">
                        <div className="col-md-3">
                          <label className="form-label">Title</label>
                          <select
                            className="form-select"
                            value={pax.Title}
                            onChange={(e) =>
                              handlePassengerChange(
                                roomIndex,
                                paxIndex,
                                "Title",
                                e.target.value,
                              )
                            }
                          >
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Miss">Miss</option>
                            <option value="Ms">Ms</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={pax.FirstName}
                            onChange={(e) =>
                              handlePassengerChange(
                                roomIndex,
                                paxIndex,
                                "FirstName",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                        <div className="col-md-5">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={pax.LastName}
                            onChange={(e) =>
                              handlePassengerChange(
                                roomIndex,
                                paxIndex,
                                "LastName",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                      </div>

                      {pax.LeadPassenger && (
                        <>
                          <div className="mb-2">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={pax.Email}
                              onChange={(e) =>
                                handlePassengerChange(
                                  roomIndex,
                                  paxIndex,
                                  "Email",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </>
                      )}
                      {validationInfo?.PanMandatory && pax.LeadPassenger && (
                        <>
                          <div className="mb-2">
                            <label className="form-label">
                              PAN{" "}
                              {hotel?.guestNationality !== "IN" && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={pax.PAN}
                              onChange={(e) =>
                                handlePassengerChange(
                                  roomIndex,
                                  paxIndex,
                                  "PAN",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </>
                      )}

                      {/* {pax.LeadPassenger && (
                        <>
                          <div className="mb-2">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={pax.Email}
                              onChange={(e) =>
                                handlePassengerChange(
                                  roomIndex,
                                  paxIndex,
                                  "Email",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>

                          <div className="mb-2">
                            <label className="form-label">
                              PAN{" "}
                              {hotel?.guestNationality !== "IN" && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={pax.PAN}
                              onChange={(e) =>
                                handlePassengerChange(
                                  roomIndex,
                                  paxIndex,
                                  "PAN",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </>
                      )} */}

                      {pax.PaxType === 2 && (
                        <div className="mb-2">
                          <label className="form-label">Age</label>
                          <input
                            type="number"
                            className="form-control"
                            min={1}
                            max={12}
                            value={pax.Age}
                            onChange={(e) =>
                              handlePassengerChange(
                                roomIndex,
                                paxIndex,
                                "Age",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                      )}

                      {pax.LeadPassenger && (
                        <div className="mb-2">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Enter mobile number"
                            value={pax.PhoneNo || ""}
                            maxLength={10}
                            onChange={(e) =>
                              handlePassengerChange(
                                roomIndex,
                                paxIndex,
                                "PhoneNo",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            maxLength={15}
                            required
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <button
                type="submit"
                className="explore-btn"
                disabled={preBookLoading || initialPreBookLoading}
              >
                {preBookLoading ? "Checking Availability..." : "Continue"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: PRICE SUMMARY */}
        <div className="col-md-4">
          {/* PRICE CARD */}
          <div className="card shadow-sm p-4 rounded-4 mb-3 price-card">
            <h5 className="fw-bold text-center mb-3">💰 Price Summary</h5>

            <div className="price-row">
              <span>Price </span>
              <span className="price-value">
                ₹{Math.ceil(payload?.serviceDetails?.Pricing?.netFare || 0)}
                {/* ₹{(price?.basePrice || 0).toFixed(2)} */}
              </span>
            </div>

            <div className="price-row">
              <span>Tax + Service Fees </span>
              <span className="price-value">
                ₹
                {Math.ceil(
                  payload?.serviceDetails?.Pricing?.commissionAmount +
                    payload?.serviceDetails?.Pricing?.gstAmount || 0,
                )}
                {/* ₹{(price?.tax || 0).toFixed(2)} */}
              </span>
            </div>

            <hr className="my-3" />

            <div className="price-row total">
              <span>Total Amount</span>
              <span>
                ₹{Math.ceil(payload?.serviceDetails?.Pricing?.finalAmount || 0)}
              </span>
              {/* <span>₹{(price?.totalFare || 0).toFixed(2)}</span> */}
            </div>
          </div>

          {/* CANCELLATION CARD */}

          {preBookInfo && (
            <div className="card shadow-sm border p-3 mb-3 rounded-3">
              <h5 className="fw-bold mb-2">ℹ️ Room Details</h5>

              {/* 🔹 Room Promotion */}
              {preBookInfo.Rooms?.[0]?.RoomPromotion?.length > 0 && (
                <div className="alert alert-success py-2">
                  🎉 <strong>Offer:</strong>{" "}
                  {preBookInfo.Rooms[0].RoomPromotion.join(", ")}
                </div>
              )}

              {/* 🔹 Supplements */}
              <h6 className="fw-bold mt-3">Supplements</h6>
              {preBookInfo.Rooms?.[0]?.Supplements?.flat()?.map((s, idx) => (
                <p key={idx} className="small mb-1">
                  <strong>{s.Description}</strong> – {s.Price} {s.Currency}
                  <span className="text-muted"> ({s.Type})</span>
                </p>
              ))}

              {/* 🔹 Cancellation Policy */}
              <h6 className="fw-bold mt-3">Cancellation Policy</h6>
              {preBookInfo.Rooms?.[0]?.CancelPolicies?.map((c, idx) => (
                <p key={idx} className="small mb-1">
                  <strong>From:</strong> {c.FromDate} →{" "}
                  <strong>{c.ChargeType}</strong> {c.CancellationCharge}
                </p>
              ))}

              {preBookInfo.Rooms?.[0]?.LastCancellationDeadline && (
                <p className="text-danger small mt-1">
                  <strong>Last Free Cancellation:</strong>{" "}
                  {preBookInfo.Rooms[0].LastCancellationDeadline}
                </p>
              )}

              {/* 🔹 Amenities */}
              {preBookInfo.Rooms?.[0]?.Amenities?.length > 0 && (
                <>
                  <h6 className="fw-bold mt-3">Amenities</h6>

                  <ul className="small mb-2">
                    {(showAllAmenities
                      ? preBookInfo.Rooms[0].Amenities
                      : preBookInfo.Rooms[0].Amenities.slice(0, 8)
                    ).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>

                  {preBookInfo.Rooms[0].Amenities.length > 8 && (
                    <button
                      type="button"
                      className="btn btn-link p-0 small"
                      onClick={() => setShowAllAmenities((prev) => !prev)}
                      style={{ color: "blue" }}
                    >
                      {showAllAmenities ? "Show less" : "Read more"}
                    </button>
                  )}
                </>
              )}

              {/* 🔹 Rate Conditions (NEW) */}
              {preBookInfo.RateConditions?.length > 0 && (
                <>
                  <h6 className="fw-bold mt-3">Hotel Policies & Conditions</h6>

                  <div className="small">
                    {preBookInfo.RateConditions.map((rule, idx) => (
                      <div
                        key={idx}
                        className="mb-2"
                        dangerouslySetInnerHTML={{
                          __html: decodeHtml(rule),
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Hotel Booking</h3>

            <p>
              <strong>Hotel:</strong> {hotel?.name}
            </p>

            <p>
              <strong>Room:</strong>{" "}
              {preBookResponse?.Rooms?.[0].Name?.[0] || "N/A"}
            </p>
            <p>
              <strong>Check-in:</strong> {startDate}
            </p>
            <p>
              <strong>Check-out:</strong> {endDate}
            </p>

            <p>
              <strong>Refundable:</strong>{" "}
              {preBookResponse?.Rooms[0]?.IsRefundable ? "Yes" : "No"}
            </p>

            <p>
              <strong>Last Cancellation Date:</strong>{" "}
              {preBookResponse?.Rooms[0]?.LastCancellationDeadline}
            </p>

            <hr />

            <h4>
              Final Price: ₹
              {Math.ceil(payload?.serviceDetails?.Pricing?.finalAmount)}
            </h4>
            {/* <h4>Final Price: ₹{finalNetAmount.toFixed()}</h4> */}

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

export default HotelCheckout;
