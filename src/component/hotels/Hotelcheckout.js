import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";
import { hotel_prebook } from "../services/hotelService";

const HotelCheckout = () => {
  const location = useLocation();
  const { payload } = location.state;
  console.log("data from previous page on checkout", payload);
  const { startPayment } = useCashfreePayment();

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
  useEffect(() => {
    if (!payload || !payload.serviceDetails) return;

    const details = payload.serviceDetails;

    // HOTEL BASIC INFO
    setHotel({
      id: details.hotelCode || "N/A",
      name: details.hotelName || "Hotel Name",
      location: details.city || details.Location || "Location",
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
          PAN: "",
          PaxType: 1,
          LeadPassenger: i === 0,
        });
      }

      for (let j = 0; j < (room.Children || 0); j++) {
        passengers.push({
          Title: "Master",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Email: "",
          Age: room.ChildrenAges?.[j] || "",
          PAN: "",
          PaxType: 2,
          LeadPassenger: false,
        });
      }

      return { passengers };
    });

    setRoomsData(roomsWithPassengers);
  }, [payload]);

  const handlePassengerChange = (roomIndex, passengerIndex, field, value) => {
    const updatedRooms = [...roomsData];
    updatedRooms[roomIndex].passengers[passengerIndex][field] = value;
    setRoomsData(updatedRooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      console.log("hotelresult", JSON.stringify(hotelResult, null, 2));

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
      const userdetails = await getUserData("safarix_user");
      if (!userdetails?.id) {
        alert("User not logged in");
        return;
      }

      const hotelRoomsDetails = roomsData.map((room) => ({
        HotelPassenger: room.passengers.map((pax) => ({
          Title: pax.Title,
          FirstName: pax.FirstName,
          MiddleName: pax.MiddleName,
          LastName: pax.LastName,
          Email: pax.Email,
          Age: pax.Age,
          PAN: pax.PAN,
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

        // totalAmount: finalNetAmount,
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
    } catch (err) {
      console.error("❌ Book Now error:", err);
      alert("Unable to proceed with payment");
    }
  };

  if (!payload) {
    return (
      <div className="container" style={{ marginTop: "110px" }}>
        <div className="text-center mt-5">
          <h4>No booking data found</h4>
          <p>Please go back and select a room to book</p>
        </div>
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
                                e.target.value
                              )
                            }
                          >
                            <option>Mr</option>
                            <option>Mrs</option>
                            <option>Ms</option>
                            <option>Master</option>
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
                                e.target.value
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
                                e.target.value
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
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label">Age</label>
                            <input
                              type="number"
                              className="form-control"
                              value={pax.Age}
                              onChange={(e) =>
                                handlePassengerChange(
                                  roomIndex,
                                  paxIndex,
                                  "Age",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label">PAN</label>
                            <input
                              type="text"
                              className="form-control"
                              value={pax.PAN}
                              onChange={(e) =>
                                handlePassengerChange(
                                  roomIndex,
                                  paxIndex,
                                  "PAN",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </>
                      )}

                      {!pax.LeadPassenger && (
                        <div className="mb-2">
                          <label className="form-label">Age</label>
                          <input
                            type="number"
                            className="form-control"
                            value={pax.Age}
                            onChange={(e) =>
                              handlePassengerChange(
                                roomIndex,
                                paxIndex,
                                "Age",
                                e.target.value
                              )
                            }
                            readOnly={pax.PaxType === 2}
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
                disabled={preBookLoading}
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
                    payload?.serviceDetails?.Pricing?.gstAmount || 0
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
          <div className="card shadow-sm p-3 rounded-4">
            <h6 className="fw-bold mb-2">📝 Cancellation Policy</h6>
            <p className="text-success mb-1">✔ Free Cancellation Available</p>
            <small className="text-muted">
              Cancel anytime before check-in date.
            </small>
          </div>
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
              {preBookResponse?.IsRefundable ? "Yes" : "No"}
            </p>

            <p>
              <strong>Last Cancellation:</strong>{" "}
              {preBookResponse?.LastCancellationDeadline}
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
