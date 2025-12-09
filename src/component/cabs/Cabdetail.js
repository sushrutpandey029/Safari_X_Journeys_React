import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaRupeeSign } from "react-icons/fa";
import {
  MdAirlineSeatReclineNormal,
  MdOutlineLocalGasStation,
} from "react-icons/md";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BiUserCircle } from "react-icons/bi";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../services/apiEndpoints";
import useCashfreePayment from "../hooks/useCashfreePayment";

const Cabdetail = () => {
  const location = useLocation();
  const { cab } = location.state;

  const { startPayment } = useCashfreePayment();

  async function handlePayNow() {
    const result = await startPayment({
      userId: 2,
      serviceType: "cab",
      serviceProviderId: "TP_CAB_9922",
      serviceName: "Cab mumbai",
      serviceDetails: { nothing: "" }, // full JSON snapshot from 3rd party
      startDate: "2025-08-18",
      endDate: "2025-08-20",
      totalAmount: 499,
      currency: "INR",
    });

    console.log("payment res", result);
  }

  return (
    <div className="CabDetial">
      <div className="container py-5">
        <nav className="mb-3">
          <small>
            <a href="/">Home</a> / <a href="/cabs">Cabs</a> /{" "}
            <span>Booking page</span>
          </small>
        </nav>

        <div className="row">
          <div className="col-lg-8 mb-6">
            <div className="d-flex gap-3 mb-4">
              <img
                src={`${BASE_URL}/cab/images/${cab.imagePath}`}
                className="img-fluid rounded border"
                alt="Dzire front"
                width="180"
                height="120"
              />
              {/* <img
                src="https://i.ibb.co/JvMx0Cr/swift-2.jpg"
                className="img-fluid rounded border"
                alt="Dzire back"
                width="180"
                height="120"
              /> */}
            </div>

            <h5 className="fw-bold">{cab.cabtype}</h5>
            <p className="text-muted mb-1">
              {cab.cabtype} <span className="mx-2">•</span> AC{" "}
              <span className="mx-2">•</span> {cab.cabseats} Seats{" "}
              <span className="mx-2">•</span> 65 Kms Included
            </p>

            <ul className="list-unstyled mt-3">
              <li className="mb-2">
                <MdAirlineSeatReclineNormal className="me-2 text-primary" />
                <strong>Km Fare:</strong> ₹{cab.price_per_km}/Km
              </li>
              <li className="mb-2">
                <MdOutlineLocalGasStation className="me-2 text-success" />
                <strong>Fuel Type:</strong> CNG with refill breaks
              </li>
              <li className="mb-2">
                <AiOutlineClockCircle className="me-2 text-warning" />
                <strong>Cancellation:</strong>{" "}
                <span className="text-success">
                  Free till 1 hour before departure
                </span>
              </li>
              <li className="mb-2">
                <BiUserCircle className="me-2 text-info" />
                <strong>Amenities:</strong> Driver in uniform & route expert
              </li>
            </ul>
          </div>

          <div className="col-lg-4">
            <div className="p-4 shadow rounded bg-white">
              <h6 className="text-muted">Total Amount</h6>
              <h3 className="fw-bold">
                <FaRupeeSign size={18} />
                2309
              </h3>
              <small className="text-muted">inc of tolls and taxes</small>

              <div className="mt-4">
                <label htmlFor="coupon" className="form-label">
                  Enter Coupon code
                </label>
                <div className="d-flex">
                  <input
                    id="coupon"
                    type="text"
                    className="form-control me-2"
                    placeholder="Coupon code"
                  />
                  <button className="btn btn-outline-primary rounded-5">
                    Apply
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary w-100 mt-4 rounded-5"
                onClick={handlePayNow}
              >
                Pay ₹4500
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-8">
            <h4 className="fw-bold text-primary">Plan Your Trip</h4>
            <p className="text-muted">
              Choose your destination, pick a date, and we’ll take care of the
              rest. Whether you're heading to the hills or the beaches, book
              your cab now!
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3">
            <h5 className="mb-3">Box One</h5>
            <div className="border rounded p-3">
              <p>This is the content of the first box.</p>
            </div>
          </div>

          <div className="col-sm-3">
            <h5 className="mb-3">Box Two</h5>
            <div className="border rounded p-3">
              <p>This is the content of the second box.</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-8">
            <div className="border rounded p-4 mt-3">
              <h5 className="fw-bold mb-4">TRIP DETAILS</h5>

              {/* Pick-up Address */}
              <div className="mb-3">
                <label className="form-label">
                  Pick-Up Address{" "}
                  <small className="text-muted">
                    (This Will Help Our Driver Reach You On Time)
                  </small>
                </label>
                <input type="text" className="form-control" />
              </div>

              {/* Drop-off Address */}
              <div className="mb-4">
                <label className="form-label">
                  Drop-Off Address{" "}
                  <small className="text-muted">
                    (Optional - This Will Help You Avoid Any Extra Charges After
                    Trip)
                  </small>
                </label>
                <input type="text" className="form-control" />
              </div>

              {/* Traveller Info */}
              <h6 className="fw-bold mt-4 mb-3">
                Confirm Traveller Information
              </h6>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" />
                </div>

                <div className="col-md-6">
                  <label className="form-label d-block">Gender</label>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="male"
                    />
                    <label className="form-check-label" htmlFor="male">
                      Male
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="female"
                    />
                    <label className="form-check-label" htmlFor="female">
                      Female
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="other"
                    />
                    <label className="form-check-label" htmlFor="other">
                      Other
                    </label>
                  </div>
                </div>
              </div>

              {/* Email and Contact */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">
                    Email Id{" "}
                    <small className="text-muted">
                      (your booking confirmation will be sent here)
                    </small>
                  </label>
                  <input type="email" className="form-control" />
                </div>

                <div className="col-md-6">
                  <label className="form-label d-block">Contact Number</label>
                  <div className="d-flex">
                    <select
                      className="form-select me-2"
                      style={{ maxWidth: "100px" }}
                    >
                      <option value="+91">+91</option>
                    </select>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p classNam e="small">
                By Proceeding To Book, I Agree To Safari X{" "}
                <a href="#">Privacy Policy</a>, <a href="#">User Agreement</a>{" "}
                And <a href="#">Terms Of Service</a>
              </p>

              {/* Checkbox */}
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="billingSame"
                />
                <label className="form-check-label" htmlFor="billingSame">
                  use pickup location as billing address
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cabdetail;
