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
            {/* <ul
              class="nav flex-column nav-pills"
              id="v-pills-tab"
              role="tablist"
              aria-orientation="vertical"
            >
              <li class="nav-item">
                <button
                  class="nav-link active"
                  id="booking-history-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#bookingHistory"
                  type="button"
                  role="tab"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Booking History
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link active"
                  id="apply-leave-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#applyLeave"
                  type="button"
                  role="tab"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Apply Leave
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link active"
                  id="leave-history-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#leaveHistory"
                  type="button"
                  role="tab"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Leave History
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link active"
                  id="profile-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#profile"
                  type="button"
                  role="tab"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" /> Change
                  Profile
                </button>
              </li>

              <li class="nav-item">
                <button
                  class="nav-link"
                  id="settings-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#settings"
                  type="button"
                  role="tab"
                >
                  {" "}
                  <FontAwesomeIcon icon={faLock} className="me-2" /> Change
                  Password
                </button>
              </li>

              <li class="nav-item">
                <button
                  class="nav-link"
                  id="logout-tab"
                  data-bs-toggle="pill"
                  // data-bs-target="#logout"
                  type="button"
                  role="tab"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />{" "}
                  Logout
                </button>
              </li>
            </ul> */}
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
                <button className="nav-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>

          <div class="col-md-9 tab-content p-4" id="v-pills-tabContent">
            {/* <div class="tab-pane fade show active" id="profile" role="tabpanel">
              <h4>Change Profile</h4>
              <Profile />
            </div>
            <div class="tab-pane fade" id="settings" role="tabpanel">
              <h4>Change Password</h4>
              <ChangePassword />
            </div> */}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideDashboard;
