import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";
import { hotel_prebook } from "../services/hotelService";

const HotelCheckout = () => {
  const location = useLocation();
  const { payload } = location.state;
  const { startPayment } = useCashfreePayment();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [preBookResponse, setPreBookResponse] = useState(null);
const [finalNetAmount, setFinalNetAmount] = useState(0);
const [preBookLoading, setPreBookLoading] = useState(false);


  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState({
    basePrice: 0,
    discount: 0,
    taxes: 0,
    finalPrice: 0,
  });
  const [startDate, setStartDate] = useState(payload?.startDate || "");
  const [endDate, setEndDate] = useState(payload?.endDate || "");
  const [city, setCity] = useState(payload?.city || "");
  const [roomsData, setRoomsData] = useState([]); // For dynamic rooms & passengers

  useEffect(() => {
    if (!payload) return;

    const details = payload.serviceDetails;

    setHotel({
      id: details.hotelCode || "N/A",
      name: details.hotelName || "Hotel Name",
      location: details.city || details.Location || "Location",
      rating: details.hotelRating || 0,
      rooms: details.NoOfRooms || 1,
      address: details.hotelAddress || "Address not available",
      hotelCode: details.hotelCode,
      bookingCode: details.BookingCode,
      currency: details.currency || "INR",
      guestNationality: details.GuestNationality,
      responseTime: details.ResponseTime,
      isDetailedResponse: details.IsDetailedResponse,
    });

    const basePrice = Number(details.totalAmount) || 0;
    const taxes = 0; // Can be fetched if available
    const discount = 0;
    const finalPrice = basePrice + taxes - discount;
    setPrice({ basePrice, taxes, discount, finalPrice });

    // Prepare dynamic rooms and passengers
    const rooms = details.PaxRooms || [];
    const roomsWithPassengers = rooms.map((room, roomIndex) => {
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
          PAN: "",
          PaxType: 1, // Adult
          LeadPassenger: i === 0, // First adult is lead
        });
      }

      // Children
      for (let j = 0; j < (room.Children || 0); j++) {
        passengers.push({
          Title: "Master",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Email: "",
          Age: room.ChildrenAges ? room.ChildrenAges[j] || "" : "",
          PAN: "",
          PaxType: 2, // Child
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
    setLoading(true);

    const userdetails = await getUserData("safarix_user");

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

    const bookingDetails = {
      userId: userdetails?.id,
      serviceType: "hotel",
      vendorType: "hotel",
      vendorId: hotel?.hotelCode,
      city,
      startDate,
      endDate,
      serviceProviderId: hotel?.hotelCode,
      serviceDetails: { ...payload.serviceDetails, startDate, endDate, city },
      BookingCode: hotel?.bookingCode,
      IsVoucherBooking: true,
      GuestNationality: hotel?.guestNationality || "IN",
      EndUserIp: payload.serviceDetails.enduserip,
      totalAmount: price.finalPrice,
      HotelRoomsDetails: hotelRoomsDetails,
    };

    console.log("Final Booking Payload:", bookingDetails);

    // Call payment API
    const result = await startPayment(bookingDetails);
    console.log("Payment Response:", result);

    setLoading(false);
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
              <h5 className="fw-bold text-primary">{hotel?.name}</h5>
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
                className="btn btn-primary w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : `Confirm Booking - ₹${price.finalPrice}`}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: PRICE SUMMARY */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3 rounded-4 mb-3">
            <h5 className="fw-bold text-center">💰 Price Summary</h5>
            <div className="d-flex justify-content-between mt-3">
              <span>Base Price</span>
              <span>₹{price.basePrice}</span>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <span>Taxes</span>
              <span>₹{price.taxes}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5 text-primary">
              <span>Total</span>
              <span>₹{price.finalPrice}</span>
            </div>
          </div>

          <div className="card shadow-sm p-3 rounded-4">
            <h6 className="fw-bold">📝 Cancellation Policy</h6>
            <p className="text-success mb-0">Free Cancellation Available</p>
            <small className="text-muted">
              Cancel anytime before start date
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCheckout;
