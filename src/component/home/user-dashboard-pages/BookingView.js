// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import {
//   getUserHotelBookingDetails,
//   cancelHotelBooking,
//   getHotelCancelStatus,
// } from "../../services/hotelService";

// function BookingView() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const booking = location.state?.bookingData;
//   const {
//     bookingId,
//     serviceType,
//     status,
//     totalAmount,
//     currency,
//     serviceDetails,
//     bookingPayments,
//     vendorResponse,
//     HotelRoomsDetails,
//   } = booking;

//   const [bookingDetailData, setBookingDetailData] = useState(null);
//   const localBookingId = booking.bookingId;

//   console.log("booking in bookingview", booking);
//   const [cancelLoading, setCancelLoading] = useState(false);

//   const getBookingDetails = async () => {
//     const bookingId = vendorResponse?.BookResult?.BookingId;
//     const confirmationNo = vendorResponse?.BookResult?.ConfirmationNo;
//     const traceId = vendorResponse?.BookResult?.TraceId;
//     const guestName = vendorResponse?.BookResult?.GuestName;

//     let payload = {
//       EndUserIp: "192.168.1.11",
//     };

//     if (bookingId) payload.BookingId = bookingId;
//     else if (confirmationNo && guestName) {
//       const [firstName, ...last] = guestName.split(" ");
//       payload.ConfirmationNo = confirmationNo;
//       payload.FirstName = firstName;
//       payload.LastName = last.join(" ");
//     } else if (traceId) payload.TraceId = traceId;
//     else return console.error("❌ Missing identifier!");

//     try {
//       const resp = await getUserHotelBookingDetails(payload);
//       console.log(
//         "Booking details response:",
//         resp?.data?.GetBookingDetailResult
//       );

//       setBookingDetailData(resp?.data?.GetBookingDetailResult);
//     } catch (err) {
//       console.error("❌ Error fetching booking details:", err);
//     }
//   };

//   useEffect(() => {
//     getBookingDetails();
//   }, []);

//   if (!booking) {
//     return (
//       <div className="container mt-5 text-center">
//         <h5>No booking data found</h5>
//         <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   // ---------------- PDF Generator ----------------
//   const handleDownloadInvoice = () => {
//     const doc = new jsPDF();

//     // Header
//     doc.setFontSize(18);
//     doc.text(`${serviceType.toUpperCase()} Booking Invoice`, 14, 20);
//     doc.setFontSize(12);
//     doc.text(`Booking ID: ${bookingId}`, 14, 30);
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);

//     // ---------------- HOTEL INVOICE ----------------
//     if (serviceType === "hotel") {
//       autoTable(doc, {
//         startY: 45,
//         head: [["Field", "Value"]],
//         body: [
//           ["Hotel Name", bookingDetailData?.HotelName],
//           ["Hotel Address", bookingDetailData?.AddressLine1],
//           ["City", bookingDetailData?.City],
//           ["Booking Status", bookingDetailData?.HotelBookingStatus],
//           [
//             "Booking Date",
//             new Date(bookingDetailData?.BookingDate).toLocaleString(),
//           ],
//           [
//             "Check-in",
//             new Date(bookingDetailData?.CheckInDate).toLocaleString(),
//           ],
//           [
//             "Check-out",
//             new Date(bookingDetailData?.CheckOutDate).toLocaleString(),
//           ],
//           ["Net Amount", bookingDetailData?.NetAmount],
//         ],
//       });

//       // Guest Details Table
//       autoTable(doc, {
//         startY: doc.lastAutoTable.finalY + 10,
//         head: [
//           [
//             "Title",
//             "First Name",
//             "Middle Name",
//             "Last Name",
//             "Email",
//             "Phone",
//             "Age",
//           ],
//         ],
//         body:
//           HotelRoomsDetails?.flatMap((room) =>
//             room.HotelPassenger?.map((pax) => [
//               pax.Title,
//               pax.FirstName,
//               pax.MiddleName || "-",
//               pax.LastName,
//               pax.Email || "-",
//               pax.Phoneno || "-",
//               pax.Age || "-",
//             ])
//           ) || [],
//       });

//       // Vendor Info
//       autoTable(doc, {
//         startY: doc.lastAutoTable.finalY + 10,
//         head: [["Vendor Info", "Value"]],
//         body: [
//           ["TBO Booking ID", vendorResponse?.BookResult?.BookingId || "N/A"],
//           ["Booking Ref No", vendorResponse?.BookResult?.BookingRefNo || "N/A"],
//           [
//             "Confirmation No",
//             vendorResponse?.BookResult?.ConfirmationNo || "N/A",
//           ],
//           [
//             "Hotel Booking Status",
//             vendorResponse?.BookResult?.HotelBookingStatus || "N/A",
//           ],
//           ["Trace ID", vendorResponse?.BookResult?.TraceId || "N/A"],
//         ],
//       });
//     }

//     // ---------------- GUIDE INVOICE ----------------
//     else if (serviceType === "guide") {
//       autoTable(doc, {
//         startY: 45,
//         head: [["Field", "Value"]],
//         body: [
//           ["Guide Name", serviceDetails?.guideName || "N/A"],
//           ["Email", serviceDetails?.guideEmail || "N/A"],
//           ["Phone", serviceDetails?.guidePhone || "N/A"],
//           ["Selected Date", serviceDetails?.selectedDate || "N/A"],
//           ["Location", serviceDetails?.location || "N/A"],
//           [
//             "Available Days",
//             Array.isArray(serviceDetails?.availableDays)
//               ? serviceDetails.availableDays.join(", ")
//               : "N/A",
//           ],
//           [
//             "Charges Per Day",
//             `${currency} ${serviceDetails?.chargesPerDay || 0}`,
//           ],
//           ["Payment Method", bookingPayments?.[0]?.paymentMethod || "N/A"],
//           ["Payment Status", bookingPayments?.[0]?.paymentStatus || "N/A"],
//         ],
//       });

//       // Vendor Info (if available)
//       if (vendorResponse) {
//         autoTable(doc, {
//           startY: doc.lastAutoTable.finalY + 10,
//           head: [["Vendor Info", "Value"]],
//           body: [
//             ["Booking Reference", vendorResponse?.bookingRef || "N/A"],
//             ["Confirmation Code", vendorResponse?.confirmationCode || "N/A"],
//             ["Guide Status", vendorResponse?.status || "N/A"],
//           ],
//         });
//       }
//     }

//     // Footer
//     doc.text(
//       "Thank you for booking with Safarix!",
//       14,
//       doc.lastAutoTable.finalY + 20
//     );

//     // Save PDF
//     doc.save(`Invoice_${serviceType}_${bookingId}.pdf`);
//   };

//   // ---------------- Cancel Booking ----------------

//   const handleCancelBooking = async () => {
//     // 🛑 Ask confirmation first
//     const confirmCancel = window.confirm(
//       "⚠️ Are you sure you want to cancel this booking?\n\nThis action cannot be undone."
//     );

//     if (!confirmCancel) return; // ❌ User cancelled the action

//     setCancelLoading(true);

//     if (!vendorResponse?.BookResult?.BookingId) {
//       setCancelLoading(false);
//       return alert("❌ Booking ID is missing — cannot cancel.");
//     }

//     const payload = {
//       // bookingId: vendorResponse.BookResult.BookingId,
//       bookingId: localBookingId,
//       Remarks: "Customer requested cancellation", // 🔥 static reason
//     };

//     try {
//       // 1️⃣ Call Cancel API
//       const cancelResp = await cancelHotelBooking(payload);
//       console.log("Cancel response:", cancelResp.data);

//       if (!cancelResp.data?.data?.HotelChangeRequestResult?.ChangeRequestId) {
//         return alert("❌ Cancellation failed — No Change Request ID returned");
//       }

//       const changeRequestId =
//         cancelResp.data.data.HotelChangeRequestResult.ChangeRequestId;

//       alert(`⏳ Cancellation request sent. Checking status...`);

//       // 2️⃣ Polling Cancel Status Every 5 Seconds
//       const checkStatus = async () => {
//         const statusResp = await getHotelCancelStatus({
//           // EndUserIp: "192.168.1.11",
//           ChangeRequestId: changeRequestId,
//         });

//         console.log("Status response:", statusResp.data);

//         const status =
//           statusResp.data?.data?.HotelChangeRequestStatusResult
//             .ChangeRequestStatus;

//         if (!status) return;

//         if (status === 1 || status === 3) {
//           alert("✔ Booking cancellation confirmed.");
//           window.location.reload();
//         } else if (status === 2) {
//           alert("❌ Cancellation failed or rejected.");
//         } else {
//           // pending → retry
//           setTimeout(checkStatus, 5000);
//         }
//       };

//       checkStatus();
//     } catch (error) {
//       console.error(error.response);
//       alert(`Failed to process cancellation. ${error?.response?.data.message}`);
//     } finally {
//       setCancelLoading(false);
//     }
//   };

//   // ---------------- UI Renderer ----------------
//   const renderBookingDetails = () => {
//     switch (serviceType) {
//       case "hotel":
//         return (
//           <>
//             <tr>
//               <th>Hotel Booking Status</th>
//               <td>{bookingDetailData?.HotelBookingStatus || status}</td>
//             </tr>
//             <tr>
//               <th>Booking Date</th>
//               <td>
//                 {bookingDetailData?.BookingDate
//                   ? new Date(bookingDetailData.BookingDate).toLocaleString()
//                   : "N/A"}
//               </td>
//             </tr>
//             <tr>
//               <th>Hotel Name</th>
//               <td>
//                 {bookingDetailData?.HotelName || serviceDetails?.hotelName}
//               </td>
//             </tr>
//             <tr>
//               <th>Address</th>
//               <td>{bookingDetailData?.AddressLine1}</td>
//             </tr>
//             <tr>
//               <th>Cancellation Deadline</th>
//               <td>
//                 {bookingDetailData?.LastCancellationDate
//                   ? new Date(
//                       bookingDetailData?.LastCancellationDate
//                     ).toLocaleString()
//                   : "N/A"}
//               </td>
//             </tr>

//             {/* <tr>
//               <th>Hotel Name</th>
//               <td>{serviceDetails?.hotelName || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Hotel Address</th>
//               <td>{serviceDetails?.hotelAddress || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Check-In</th>
//               <td>{serviceDetails?.checkIn || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Check-Out</th>
//               <td>{serviceDetails?.checkOut || "N/A"}</td>
//             </tr>
//             <tr className="table-primary">
//               <th colSpan={2}>Guest Details</th>
//             </tr>
//             {HotelRoomsDetails?.map((room, roomIndex) =>
//               room.HotelPassenger?.map((pax, paxIndex) => (
//                 <tr key={`${roomIndex}-${paxIndex}`}>
//                   <td colSpan={2}>
//                     {pax.Title} {pax.FirstName} {pax.MiddleName || ""}{" "}
//                     {pax.LastName} | Email: {pax.Email || "N/A"} | Phone:{" "}
//                     {pax.Phoneno || "N/A"} | Age: {pax.Age || "N/A"}
//                   </td>
//                 </tr>
//               ))
//             )} */}
//           </>
//         );

//       case "guide":
//         return (
//           <>
//             <tr>
//               <th>Guide Name</th>
//               <td>{serviceDetails?.guideName || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Email</th>
//               <td>{serviceDetails?.guideEmail || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Phone</th>
//               <td>{serviceDetails?.guidePhone || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Selected Date</th>
//               <td>{serviceDetails?.selectedDate || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Available Days</th>
//               <td>
//                 {Array.isArray(serviceDetails?.availableDays)
//                   ? serviceDetails.availableDays.join(", ")
//                   : "N/A"}
//               </td>
//             </tr>
//             <tr>
//               <th>Location</th>
//               <td>{serviceDetails?.location || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Charges Per Day</th>
//               <td>
//                 {currency} {serviceDetails?.chargesPerDay || "N/A"}
//               </td>
//             </tr>
//           </>
//         );

//       default:
//         return (
//           <tr>
//             <td colSpan={2}>Unknown service type</td>
//           </tr>
//         );
//     }
//   };

//   return (
//     <div className="container" style={{ marginTop: "130px" }}>
//       <h4 className="mb-3 text-capitalize">{serviceType} Booking Details</h4>

//       <table className="table table-bordered">
//         <tbody>
//           <tr>
//             <th>Booking ID</th>
//             <td>{bookingId}</td>
//           </tr>
//           <tr>
//             <th>Status</th>
//             <td>{status}</td>
//           </tr>
//           <tr>
//             <th>Total Amount</th>
//             <td>
//               {currency} {totalAmount}
//             </td>
//           </tr>

//           {renderBookingDetails()}

//           <tr>
//             <th>Payment Method</th>
//             <td>{bookingPayments?.[0]?.paymentMethod || "N/A"}</td>
//           </tr>
//           <tr>
//             <th>Payment Status</th>
//             <td>{bookingPayments?.[0]?.paymentStatus || "N/A"}</td>
//           </tr>
//         </tbody>
//       </table>

//       <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
//         Back to Bookings
//       </button>

//       {status === "confirmed" ? (
//         <>
//           <button
//             className="btn btn-success mt-3 ms-3"
//             onClick={handleDownloadInvoice}
//           >
//             Download Invoice (PDF)
//           </button>
//           <button
//             className="btn btn-danger mt-3 ms-3"
//             onClick={handleCancelBooking}
//           >
//             Cancel Booking
//           </button>
//         </>
//       ) : (
//         <p className="text-danger mt-3">
//           Invoice not available — booking status: {status}
//         </p>
//       )}
//     </div>
//   );
// }

// export default BookingView;

// BookingView.jsx

// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// import HotelView from "./hotel/HotelView";
// import FlightView from "./flight/FlightView";
// import GuideView from "./guide/GuideView";
// import BusView from "./bus/BusView";

// export default function BookingView() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const booking = location.state?.bookingData;

//   if (!booking)
//     return (
//       <div className="container mt-5 text-center">
//         <h5>No booking data found</h5>
//         <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
//           Go Back
//         </button>
//       </div>
//     );

//   const { serviceType } = booking;

//   const renderComponent = () => {
//     switch (serviceType) {
//       case "hotel":
//         return <HotelView booking={booking} />;
//       case "flight":
//         return <FlightView booking={booking} />;
//       case "guide":
//         return <GuideView booking={booking} />;
//       case "bus":
//         return <BusView booking={booking} />;
//       default:
//         return <h3>Service type not supported yet!</h3>;
//     }
//   };

//   return (
//     <div className="container" style={{ marginTop: "130px" }}>
//       <h4 className="mb-4 text-capitalize">{serviceType} Booking Details</h4>

//       {renderComponent()}
//     </div>
//   );
// }

import React from "react";

import HotelView from "./hotel/HotelView";
import FlightView from "./flight/FlightView";
import GuideView from "./guide/GuideView";
import BusView from "./bus/BusView";

export default function BookingView({ booking }) {
  if (!booking)
    return (
      <div className="container mt-5 text-center">
        <h5>No booking data found</h5>
      </div>
    );

  const { serviceType } = booking;

  const renderComponent = () => {
    switch (serviceType) {
      case "hotel":
        return <HotelView booking={booking} />;
      case "flight":
        return <FlightView booking={booking} />;
      case "guide":
        return <GuideView booking={booking} />;
      case "bus":
        return <BusView booking={booking} />;
      default:
        return <h3>Service type not supported yet!</h3>;
    }
  };

  return (
    <div className="container-fluid">
      <h5 className="mb-3 text-capitalize fw-bold">
        {serviceType} Booking Details
      </h5>
      {renderComponent()}
    </div>
  );
}
