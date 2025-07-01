import React from "react";
import "./UserDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faUser,
  faLock,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

import ChangePassword from "./user-dashboard-pages/ChangePassword";
import Profile from "./user-dashboard-pages/Profile";
import Booking from "./user-dashboard-pages/Booking";
import { userLogout } from "../services/authService";

function UserDashboard() {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;
    await userLogout();
    localStorage.removeItem("safarix_user");
    localStorage.removeItem("safarix_token");
    localStorage.removeItem("safarix_refreshtoken");
    dispatch(logout());
    window.location.reload(true);
  };

  return (
    <div>
      <div className="user-dash">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2>USER DASHBOARD</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="container client-dash mt-5 mb-5">
        <div class="row dashboard-wrapper shadow rounded">
          <div class="col-md-3 bg-light dashboard-sidebar">
            <h5 class="text-center py-3 border-bottom">User Panel</h5>
            <ul
              class="nav flex-column nav-pills"
              id="v-pills-tab"
              role="tablist"
              aria-orientation="vertical"
            >
              <li class="nav-item">
                <button
                  class="nav-link active"
                  id="dashboard-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#dashboard"
                  type="button"
                  role="tab"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />{" "}
                  Booking
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
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
            </ul>
          </div>

          <div class="col-md-9 tab-content p-4" id="v-pills-tabContent">
            <div
              class="tab-pane fade show active"
              id="dashboard"
              role="tabpanel"
            >
              <h4>Booking</h4>
              <Booking />
            </div>
            <div class="tab-pane fade" id="profile" role="tabpanel">
              <h4>Change Profile</h4>
              <Profile />
            </div>
            <div class="tab-pane fade" id="settings" role="tabpanel">
              <h4>Change Password</h4>
              <ChangePassword />
            </div>
            {/* <div
              class="tab-pane fade"
              id="logout"
              role="tabpanel"
              onClick={handleLogout}
            >
              <h4>Logout</h4>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
