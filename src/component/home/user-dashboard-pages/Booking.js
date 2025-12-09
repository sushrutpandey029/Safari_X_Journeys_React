// import React, { useEffect, useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom";
// import { userBookingDetails } from "../../services/userService";
// import { getUserData } from "../../utils/storage";

// function Booking() {
//   const [bookings, setBookings] = useState([]);
//   const navigate = useNavigate();

//   const fetchDetails = async () => {
//     const userdetails = await getUserData("safarix_user");
//     try {
//       const resp = await userBookingDetails(userdetails.id);
//       console.log("resp of userdetails", resp);
//       setBookings(resp.data || []); // store API data
//     } catch (err) {
//       console.log("err in user booking details", err);
//     }
//   };

//   useEffect(() => {
//     fetchDetails();
//   }, []);
//   return (
//     <div className="container mt-4">
//       <table className="table table-hover table-bordered">
//         <thead>
//           <tr>
//             <th scope="col">Booking ID</th>
//             <th scope="col">Service Type</th>
//             <th scope="col">Status</th>
//             <th scope="col">View</th>
//           </tr>
//         </thead>
//         <tbody>
//           {bookings.length > 0 ? (
//             bookings.map((booking) => (
//               <tr key={booking.id}>
//                 <td>{booking.bookingId}</td>
//                 <td>{booking.serviceType}</td>
//                 <td
//                   className={
//                     booking.status === "failed"
//                       ? "text-danger"
//                       : booking.status === "pending"
//                       ? "text-warning"
//                       : "text-success"
//                   }
//                 >
//                   {booking.status}
//                 </td>
//                 <td>
//                   <button
//                     type="button"
//                     className="btn btn-success btn-sm"
//                     onClick={() =>
//                       navigate("/view-booking", {
//                         state: { bookingData: booking }, // send full data
//                       })
//                     }
//                   >
//                     <FontAwesomeIcon icon={faEye} /> View
//                   </button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="4" className="text-center">
//                 No bookings found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Booking;

// import React, { useEffect, useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom";
// import { userBookingDetails } from "../../services/userService";
// import { getUserData } from "../../utils/storage";

// function Booking() {
//   const [bookings, setBookings] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);

//   const navigate = useNavigate();

//   const itemsPerPage = 20; // 🔥 Show 20 bookings per page

//   const fetchDetails = async () => {
//     const userdetails = await getUserData("safarix_user");
//     try {
//       const resp = await userBookingDetails(userdetails.id);
//       setBookings(resp.data || []);
//     } catch (err) {
//       console.log("err in user booking details", err);
//     }
//   };

//   useEffect(() => {
//     fetchDetails();
//   }, []);

//   // Pagination Logic
//   const lastIndex = currentPage * itemsPerPage;
//   const firstIndex = lastIndex - itemsPerPage;
//   const currentBookings = bookings.slice(firstIndex, lastIndex);

//   const totalPages = Math.ceil(bookings.length / itemsPerPage);

//   return (
//     <div className="container mt-4">
//       <table className="table table-hover table-bordered">
//         <thead>
//           <tr>
//             <th>Booking ID</th>
//             <th>Service Type</th>
//             <th>Status</th>
//             <th>View</th>
//           </tr>
//         </thead>

//         <tbody>
//           {currentBookings.length > 0 ? (
//             currentBookings.map((booking) => (
//               <tr key={booking.id}>
//                 <td>{booking.bookingId}</td>
//                 <td>{booking.serviceType}</td>
//                 <td
//                   className={
//                     booking.status === "failed"
//                       ? "text-danger"
//                       : booking.status === "pending"
//                       ? "text-warning"
//                       : "text-success"
//                   }
//                 >
//                   {booking.status}
//                 </td>
//                 <td>
//                   <button
//                     type="button"
//                     className="btn btn-success btn-sm"
//                     onClick={() =>
//                       navigate("/view-booking", {
//                         state: { bookingData: booking },
//                       })
//                     }
//                   >
//                     <FontAwesomeIcon icon={faEye} /> View
//                   </button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="4" className="text-center">
//                 No bookings found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* Pagination Buttons */}
//       {bookings.length > 10 && (
//         <div className="d-flex justify-content-between mt-3">
//           <button
//             className="btn btn-primary"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => prev - 1)}
//           >
//             ⬅ Previous
//           </button>

//           <span className="fw-bold">
//             Page {currentPage} of {totalPages}
//           </span>

//           <button
//             className="btn btn-primary"
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((prev) => prev + 1)}
//           >
//             Next ➡
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Booking;

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { userBookingDetails } from "../../services/userService";
import { getUserData } from "../../utils/storage";
import BookingView from "./BookingView"; // <-- Import BookingView
import "bootstrap/dist/css/bootstrap.min.css";
import "./Booking.css";

function Booking() {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  const fetchDetails = async () => {
    const userdetails = await getUserData("safarix_user");
    try {
      const resp = await userBookingDetails(userdetails.id);
      setBookings(resp.data || []);
    } catch (err) {
      console.log("err in user booking details", err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentBookings = bookings.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  return (
    <div className="container mt-4">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Service Type</th>
            <th>Status</th>
            <th>View</th>
          </tr>
        </thead>

        <tbody>
          {currentBookings.length > 0 ? (
            currentBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.bookingId}</td>
                <td>{booking.serviceType}</td>
                <td
                  className={
                    booking.status === "failed"
                      ? "text-danger"
                      : booking.status === "pending"
                      ? "text-warning"
                      : "text-success"
                  }
                >
                  {booking.status}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => handleView(booking)}
                  >
                    <FontAwesomeIcon icon={faEye} /> View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Buttons */}
      {bookings.length > 10 && (
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-primary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ⬅ Previous
          </button>

          <span className="fw-bold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-primary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next ➡
          </button>
        </div>
      )}

      {/* 🔥 Booking View Modal */}
      {showModal && (
       <>
  <div
    className="modal fade show d-flex align-items-center justify-content-center"
    tabIndex="-1"
    role="dialog"
    style={{
      background: "rgba(0, 0, 1, 0.6)", // Dark blue transparent
      pointerEvents: "none", // Disable background click
    }}
  >
    <div
      className="modal-dialog modal-dialog-centered fixed-size-modal"
      role="document"
      style={{ pointerEvents: "auto" }} // Enable clicks only inside modal
    >
      <div className="modal-content" style={{ height: "100%" }}>
        <div className="modal-header bg-primary text-white">
          <button
            type="button"
            className="btn-close"
            onClick={closeModal}
          ></button>
        </div>

        <div
          className="modal-body"
          style={{ overflowY: "auto" }}
        >
          <BookingView booking={selectedBooking} closeModal={closeModal} />
        </div>
      </div>
    </div>
  </div>
</>

      )}
    </div>
  );
}

export default Booking;
