import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { userBookingDetails } from "../../services/userService";
import { getUserData } from "../../utils/storage";

function Booking() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  const fetchDetails = async () => {
    const userdetails = await getUserData("safarix_user");
    try {
      const resp = await userBookingDetails(userdetails.id);
     
      setBookings(resp.data || []); // store API data
    } catch (err) {
      console.log("err in user booking details", err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);
  return (
    <div className="container mt-4">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">Booking ID</th>
            <th scope="col">Service Type</th>
            <th scope="col">Status</th>
            <th scope="col">View</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
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
                    onClick={() =>
                      navigate("/view-booking", {
                        state: { bookingData: booking }, // send full data
                      })
                    }
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
    </div>
  );
}

export default Booking;
