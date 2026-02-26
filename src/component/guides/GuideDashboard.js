import React from "react";
import "../home/UserDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faUser,
  faLock,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { GuideLogout } from "../services/guideService";
import Profile from "./guide-dashboard-pages/Profile";
import ChangePassword from "./guide-dashboard-pages/ChangePassword";
import ApplyLeave from "./guide-dashboard-pages/ApplyLeave";
import LeaveHistory from "./guide-dashboard-pages/LeaveHistory";
import BookingHistory from "./guide-dashboard-pages/BookingHistory";
import { useNavigate } from "react-router-dom";
import { clearGuideAuth } from "../utils/authStorage";
import GuideEarnings from "./guide-dashboard-pages/GuideEarnings";
import EmergencyPanel from "./guide-dashboard-pages/EmergencyPanel";

function GuideDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;
    await GuideLogout();
    dispatch(logout());
    clearGuideAuth();
    window.location.reload(true);
    navigate("/");
  };

  return (
    <div>
      <div className="user-dash">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2>GUIDE DASHBOARD</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="container client-dash mt-5 mb-5">
        <div class="row dashboard-wrapper shadow rounded">
          <div class="col-md-3 bg-light dashboard-sidebar">
            <h5 class="text-center py-3 border-bottom">Guide Panel</h5>

            <ul className="nav flex-column nav-pills" role="tablist">
              <li className="nav-item">
                <button
                  className="nav-link active"
                  data-bs-toggle="pill"
                  data-bs-target="#profile"
                  type="button"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Profile
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  data-bs-toggle="pill"
                  data-bs-target="#bookingHistory"
                  type="button"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Booking History
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  data-bs-toggle="pill"
                  data-bs-target="#applyLeave"
                  type="button"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Apply Leave
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  data-bs-toggle="pill"
                  data-bs-target="#leaveHistory"
                  type="button"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Leave History
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  data-bs-toggle="pill"
                  data-bs-target="#settings"
                  type="button"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Change Password
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link"
                  data-bs-toggle="pill"
                  data-bs-target="#earnings"
                  type="button"
                >
                  {" "}
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Earnings
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link"
                  data-bs-toggle="pill"
                  data-bs-target="#emergencypanel"
                  type="button"
                >
                  {" "}
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Emergency Panel
                </button>
              </li>

              <li className="nav-item">
                <button className="nav-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>

          <div class="col-md-9 tab-content p-4" id="v-pills-tabContent">
            <div className="tab-pane fade show active" id="profile">
              <h4>Profile</h4>
              <Profile />
            </div>

            <div className="tab-pane fade" id="bookingHistory">
              <h4>Booking History</h4>
              <BookingHistory />
            </div>

            <div className="tab-pane fade" id="applyLeave">
              <h4>Apply Leave</h4>
              <ApplyLeave />
            </div>

            <div className="tab-pane fade" id="leaveHistory">
              <h4>Leave History</h4>
              <LeaveHistory />
            </div>

            <div className="tab-pane fade" id="settings">
              <h4>Change Password</h4>
              <ChangePassword />
            </div>

            <div className="tab-pane fade" id="earnings">
              <h4>Earnings</h4>
              <GuideEarnings />
            </div>
            <div className="tab-pane fade" id="emergencypanel">
              <h4>Emergency Panel</h4>
              <EmergencyPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideDashboard;
