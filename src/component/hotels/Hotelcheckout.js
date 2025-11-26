// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import useCashfreePayment from "../hooks/useCashfreePayment";
// import { getUserData } from "../utils/storage";

// const HotelCheckout = () => {
//   const location = useLocation();
//   const { payload } = location.state;
//   console.log("payload in hotel checkout", payload);

//   const { startPayment } = useCashfreePayment();

//   const [guestName, setGuestName] = useState("");
//   const [middleName, setMiddleName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [title, setTitle] = useState("Mr");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [checkIn, setCheckIn] = useState("");
//   const [checkOut, setCheckOut] = useState("");
//   const [guests, setGuests] = useState(1);
//   const [hotel, setHotel] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [price, setPrice] = useState({
//     basePrice: 0,
//     discount: 0,
//     taxes: 0,
//     finalPrice: 0,
//   });

//   useEffect(() => {
//     if (payload) {
//       const details = payload.serviceDetails;

//       setHotel({
//         id: details.hotelCode || "N/A",
//         name: details.hotelName || "Hotel Name",
//         location: details.city || details.Location || "Location",
//         rating: details.rating || 0,
//         rooms: details.NoOfRooms || 1,
//         address: details.address || "Address not available",
//         hotelCode: details.hotelCode,
//         bookingCode: details.BookingCode,
//         currency: details.currency || "INR",
//         guestNationality: details.GuestNationality,
//         responseTime: details.ResponseTime,
//         isDetailedResponse: details.IsDetailedResponse,
//       });

//       setCheckIn(details.checkIn || "");
//       setCheckOut(details.checkOut || "");

//       const roomData = details.room || {};
//       const basePrice =
//         Number(details.basePrice) ||
//         Number(roomData.BasePrice) ||
//         (roomData.DayRates &&
//           roomData.DayRates[0] &&
//           roomData.DayRates[0][0]?.BasePrice) ||
//         0;

//       const taxes = Number(details.taxes) || Number(roomData.TotalTax) || 0;
//       const totalFare =
//         Number(details.totalAmount) || Number(roomData.TotalFare) || 0;

//       const discount = 0;
//       const finalPrice = totalFare > 0 ? totalFare : basePrice + taxes;

//       setPrice({
//         basePrice,
//         discount,
//         taxes,
//         finalPrice,
//         totalFare,
//       });

//       let totalGuests = 1;
//       if (details.PaxRooms && Array.isArray(details.PaxRooms)) {
//         totalGuests = details.PaxRooms.reduce(
//           (acc, room) => acc + (room.Adults || 0) + (room.Children || 0),
//           0
//         );
//       } else {
//         totalGuests = details.NoOfRooms * 2;
//       }
//       setGuests(totalGuests || 1);
//     }
//   }, [payload]);

//   const handleSubmit = async (e) => {
//     setLoading(true);
//     e.preventDefault();

//     const userdetails = await getUserData("safarix_user");
//     const nameParts = guestName.trim().split(" ");
//     const firstName = nameParts[0] || "";
//     const lastNamePart = lastName || nameParts.slice(1).join(" ") || "";

//     const bookingDetails = {
//       userId: userdetails?.id,
//       serviceType: "hotel",
//       serviceDetails: payload.serviceDetails,
//       startDate: payload.startDate,
//       endDate: payload.endDate,
//       BookingCode: hotel?.bookingCode,
//       IsVoucherBooking: false,
//       GuestNationality: hotel?.guestNationality || "IN",
//       EndUserIp: payload.serviceDetails.enduserip,
//       totalAmount: price.finalPrice,
//       HotelRoomsDetails: [
//         {
//           HotelPassenger: [
//             {
//               Title: title,
//               FirstName: firstName,
//               MiddleName: middleName,
//               LastName: lastNamePart,
//               Phoneno: phone,
//               Email: email,
//               PaxType: 1, // 1 = Adult
//               LeadPassenger: true,
//             },
//           ],
//         },
//       ],
//       IsPackageFare: false,
//       IsPackageDetailsMandatory: false,
//     };

//     console.log("✅ Final Booking Payload (for API):", bookingDetails);
//     // Call your booking API here
//     const result = await startPayment(bookingDetails);
//     console.log("payment res", result);
//     setLoading(false);
//   };

//   if (!payload) {
//     return (
//       <div className="container" style={{ marginTop: "110px" }}>
//         <div className="text-center mt-5">
//           <h4>No booking data found</h4>
//           <p>Please go back and select a room to book</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container" style={{ marginTop: "110px" }}>
//       <div className="row">
//         {/* LEFT SIDE: Hotel & Guest Info */}
//         <div className="col-md-8">
//           <div className="card shadow-sm rounded-4 p-4 mb-3">
//             <h3 className="mb-3 fw-bold">Hotel Checkout</h3>

//             {/* ✅ HOTEL INFO */}
//             <div className="card mb-3 shadow-sm border rounded-3 p-3">
//               <h5 className="fw-bold text-primary">{hotel?.name}</h5>
//               <div className="row mt-2">
//                 <div className="col-md-6">
//                   <p className="mb-1">
//                     <span className="fw-bold">⭐ Rating:</span> {hotel?.rating}{" "}
//                     Star
//                   </p>
//                   <p className="mb-1">
//                     <span className="fw-bold">📍 Location:</span>{" "}
//                     {hotel?.location}
//                   </p>
//                 </div>
//                 <div className="col-md-6">
//                   <p className="mb-1">
//                     <span className="fw-bold">🏨 Rooms:</span> {hotel?.rooms}
//                   </p>
//                   <p className="mb-1">
//                     <span className="fw-bold">🔢 Hotel Code:</span>{" "}
//                     {hotel?.hotelCode}
//                   </p>
//                 </div>
//               </div>
//               <div className="row mt-3 pt-2 border-top">
//                 <div className="col-md-6">
//                   <p className="mb-1">
//                     <span className="fw-bold">📅 Check-In:</span> {checkIn}
//                   </p>
//                 </div>
//                 <div className="col-md-6">
//                   <p className="mb-1">
//                     <span className="fw-bold">📅 Check-Out:</span> {checkOut}
//                   </p>
//                 </div>
//               </div>
//               <div className="mt-2">
//                 <span className="fw-bold">👥 Total Guests:</span> {guests}
//               </div>
//               {hotel?.guestNationality && (
//                 <div className="mt-1">
//                   <span className="fw-bold">🇮🇳 Nationality:</span>{" "}
//                   {hotel?.guestNationality}
//                 </div>
//               )}
//             </div>

//             {/* ✅ Guest Form */}
//             <form onSubmit={handleSubmit}>
//               <div className="row">
//                 <div className="col-md-3 mb-3">
//                   <label className="form-label fw-bold">Title</label>
//                   <select
//                     className="form-select"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                   >
//                     <option>Mr</option>
//                     <option>Mrs</option>
//                     <option>Ms</option>
//                   </select>
//                 </div>

//                 <div className="col-md-9 mb-3">
//                   <label className="form-label fw-bold">First Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={guestName}
//                     onChange={(e) => setGuestName(e.target.value)}
//                     required
//                     placeholder="Enter first name"
//                   />
//                 </div>
//               </div>

//               <div className="mb-3">
//                 <label className="form-label fw-bold">Middle Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={middleName}
//                   onChange={(e) => setMiddleName(e.target.value)}
//                   placeholder="Enter middle name"
//                 />
//               </div>

//               <div className="mb-3">
//                 <label className="form-label fw-bold">Last Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   required
//                   placeholder="Enter last name"
//                 />
//               </div>

//               <div className="mb-3">
//                 <label className="form-label fw-bold">📧 Email Address</label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   placeholder="Enter email address"
//                 />
//               </div>

//               <div className="mb-3">
//                 <label className="form-label fw-bold">📞 Phone</label>
//                 <input
//                   type="tel"
//                   className="form-control"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   required
//                   placeholder="Enter phone number"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 py-2 fw-bold"
//                 disabled={loading}
//               >
//                 ✅ Confirm Booking - {hotel?.currency} {price.finalPrice}
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* RIGHT SIDE: Price Summary */}
//         <div className="col-md-4">
//           <div className="card shadow-sm rounded-4 p-3">
//             <h5 className="fw-bold text-center">💰 Price Breakup</h5>
//             <div className="d-flex justify-content-between mt-3">
//               <span>Base Price</span>
//               <span>
//                 {hotel?.currency} {price.basePrice}
//               </span>
//             </div>

//             {price.discount > 0 && (
//               <div className="d-flex justify-content-between text-success mt-2">
//                 <span>Discount</span>
//                 <span>
//                   -{hotel?.currency} {price.discount}
//                 </span>
//               </div>
//             )}

//             <div className="d-flex justify-content-between mt-2">
//               <span>Taxes & Fees</span>
//               <span>
//                 {hotel?.currency} {price.taxes}
//               </span>
//             </div>

//             <hr />
//             <div className="d-flex justify-content-between fw-bold fs-5 text-primary">
//               <span>Total Amount</span>
//               <span>
//                 {hotel?.currency} {price.finalPrice}
//               </span>
//             </div>
//           </div>

//           <div className="card shadow-sm rounded-4 p-3 mt-3">
//             <h6 className="fw-bold">📋 Booking Details</h6>
//             <div className="small">
//               <p className="mb-1">
//                 <strong>Response Time:</strong> {hotel?.responseTime || "N/A"}{" "}
//                 mins
//               </p>
//               <p className="mb-0">
//                 <strong>Service Type:</strong> {payload?.serviceType || "Hotel"}
//               </p>
//             </div>
//           </div>

//           <div className="card shadow-sm rounded-4 p-3 mt-3">
//             <h6 className="fw-bold">📝 Cancellation Policy</h6>
//             <p className="text-success mb-0">✅ Free Cancellation Available</p>
//             <small className="text-muted">
//               {checkIn
//                 ? `Cancel before ${checkIn} for full refund`
//                 : "Flexible cancellation"}
//             </small>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HotelCheckout;
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";

const HotelCheckout = () => {
  const location = useLocation();
  const { payload } = location.state;
  const { startPayment } = useCashfreePayment();

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
      city,
      startDate,
      endDate,
      serviceProviderId: hotel?.hotelCode,
      serviceDetails: { ...payload.serviceDetails, startDate, endDate, city },
      BookingCode: hotel?.bookingCode,
      IsVoucherBooking: false,
      GuestNationality: hotel?.guestNationality || "IN",
      EndUserIp: payload.serviceDetails.enduserip,
      totalAmount: price.finalPrice,
      HotelRoomsDetails: hotelRoomsDetails,
    };

    console.log("✅ Final Booking Payload:", bookingDetails);

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
