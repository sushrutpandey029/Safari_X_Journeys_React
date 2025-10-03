import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const HotelCheckout = () => {
  const location = useLocation();
  const payload = location.state?.payload;

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [hotel, setHotel] = useState(null);
  const [price, setPrice] = useState({
    basePrice: 0,
    discount: 0,
    taxes: 0,
    finalPrice: 0,
  });

  useEffect(() => {
    if (payload) {
      console.log("📦 Full Payload:", payload); // Debugging ke liye
      
      const details = payload.serviceDetails;

      // ✅ CORRECT DATA EXTRACTION - HotelDetail page se jo data aa raha hai
      setHotel({
        id: details.hotelCode || "N/A",
        name: details.hotelName || "Hotel Name",
        location: details.city || details.Location || "Location",
        // ✅ Rating yahan se nahi aa raha, isliye hum serviceDetails me check karenge
        rating: details.rating || 0,
        rooms: details.NoOfRooms || 1,
        address: details.address || "Address not available",
        hotelCode: details.hotelCode,
        bookingCode: details.BookingCode,
        currency: details.currency || "INR",
        guestNationality: details.GuestNationality,
        responseTime: details.ResponseTime,
        isDetailedResponse: details.IsDetailedResponse,
      });

      // ✅ DATES
      setCheckIn(details.checkIn || "");
      setCheckOut(details.checkOut || "");

      // ✅ CORRECT PRICE EXTRACTION - HotelDetail se jo room data aa raha hai
      // HotelDetail page me room object me ye fields hain:
      // TotalFare, TotalTax, DayRates[0][0].BasePrice, etc.
      const roomData = details.room || {}; // Agar room object separately bheja gaya hai
      
      const basePrice = Number(details.basePrice) || 
                       Number(roomData.BasePrice) || 
                       (roomData.DayRates && roomData.DayRates[0] && roomData.DayRates[0][0]?.BasePrice) || 
                       0;
      
      const taxes = Number(details.taxes) || 
                   Number(roomData.TotalTax) || 
                   0;
      
      const totalFare = Number(details.totalAmount) || 
                       Number(roomData.TotalFare) || 
                       0;

      // Discount usually hotel APIs me nahi hota, isliye 0 set karo
      const discount = 0;

      const finalPrice = totalFare > 0 ? totalFare : (basePrice + taxes);

      setPrice({ 
        basePrice, 
        discount, 
        taxes, 
        finalPrice,
        totalFare 
      });

      // ✅ CORRECT GUESTS COUNT - PaxRooms se calculate karo
      let totalGuests = 1;
      
      if (details.PaxRooms && Array.isArray(details.PaxRooms)) {
        totalGuests = details.PaxRooms.reduce(
          (acc, room) => acc + (room.Adults || 0) + (room.Children || 0),
          0
        );
      } else {
        // Default fallback
        totalGuests = details.NoOfRooms * 2; // Assume 2 guests per room
      }
      
      setGuests(totalGuests || 1);

    }
  }, [payload]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingDetails = {
      hotelId: hotel?.id,
      hotelName: hotel?.name,
      hotelCode: hotel?.hotelCode,
      bookingCode: hotel?.bookingCode,
      guestName,
      email,
      checkIn,
      checkOut,
      guests,
      finalPrice: price.finalPrice,
      currency: hotel?.currency,
      serviceType: payload?.serviceType,
    };
    console.log("✅ Booking Confirmed:", bookingDetails);
    // Yaha API call karo
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
        {/* LEFT SIDE: Hotel & Guest Info */}
        <div className="col-md-8">
          <div className="card shadow-sm rounded-4 p-4 mb-3">
            <h3 className="mb-3 fw-bold">Hotel Checkout</h3>

            {/* ✅ HOTEL INFO */}
            <div className="card mb-3 shadow-sm border rounded-3 p-3">
              <h5 className="fw-bold text-primary">{hotel?.name}</h5>
              
              <div className="row mt-2">
                <div className="col-md-6">
                  <p className="mb-1">
                    <span className="fw-bold">⭐ Rating:</span> {hotel?.rating} Star
                  </p>
                  <p className="mb-1">
                    <span className="fw-bold">📍 Location:</span> {hotel?.location}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <span className="fw-bold">🏨 Rooms:</span> {hotel?.rooms}
                  </p>
                  <p className="mb-1">
                    <span className="fw-bold">🔢 Hotel Code:</span> {hotel?.hotelCode}
                  </p>
                </div>
              </div>

              <div className="row mt-3 pt-2 border-top">
                <div className="col-md-6">
                  <p className="mb-1">
                    <span className="fw-bold">📅 Check-In:</span> {checkIn}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <span className="fw-bold">📅 Check-Out:</span> {checkOut}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <span className="fw-bold">👥 Total Guests:</span> {guests}
              </div>

              {hotel?.guestNationality && (
                <div className="mt-1">
                  <span className="fw-bold">🇮🇳 Nationality:</span> {hotel?.guestNationality}
                </div>
              )}
            </div>

            {/* ✅ Guest Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">👤 Guest Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">📧 Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                ✅ Confirm Booking - {hotel?.currency} {price.finalPrice}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: Price Summary */}
        <div className="col-md-4">
          <div className="card shadow-sm rounded-4 p-3">
            <h5 className="fw-bold text-center">💰 Price Breakup</h5>
            
            <div className="d-flex justify-content-between mt-3">
              <span>Base Price</span>
              <span>{hotel?.currency} {price.basePrice}</span>
            </div>
            
            {price.discount > 0 && (
              <div className="d-flex justify-content-between text-success mt-2">
                <span>Discount</span>
                <span>-{hotel?.currency} {price.discount}</span>
              </div>
            )}
            
            <div className="d-flex justify-content-between mt-2">
              <span>Taxes & Fees</span>
              <span>{hotel?.currency} {price.taxes}</span>
            </div>
            
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5 text-primary">
              <span>Total Amount</span>
              <span>{hotel?.currency} {price.finalPrice}</span>
            </div>
          </div>

          {/* ✅ Booking Details */}
          <div className="card shadow-sm rounded-4 p-3 mt-3">
            <h6 className="fw-bold">📋 Booking Details</h6>
            <div className="small">
              <p className="mb-1"><strong>Booking Code:</strong> {hotel?.bookingCode || "N/A"}</p>
              <p className="mb-1"><strong>Response Time:</strong> {hotel?.responseTime || "N/A"} mins</p>
              <p className="mb-0"><strong>Service Type:</strong> {payload?.serviceType || "Hotel"}</p>
            </div>
          </div>

          {/* ✅ Cancellation Policy */}
          <div className="card shadow-sm rounded-4 p-3 mt-3">
            <h6 className="fw-bold">📝 Cancellation Policy</h6>
            <p className="text-success mb-0">✅ Free Cancellation Available</p>
            <small className="text-muted">
              {checkIn ? `Cancel before ${checkIn} for full refund` : 'Flexible cancellation'}
            </small>
          </div>
        </div>
      </div>

      {/* ✅ Debug Section - Production me remove kar dena */}
      <div className="mt-4 p-3 bg-light rounded">
        <details>
          <summary className="fw-bold">🔍 Debug Payload Data</summary>
          <pre className="mt-2 small">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default HotelCheckout;