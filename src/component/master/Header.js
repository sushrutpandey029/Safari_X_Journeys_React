import { NavLink, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../home/Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

import AuthModal from "../auth/AuthModal";
import DriverGuideAuth from "../auth/DriverGuideAuth";
import { getUserData, removeUserData } from "../utils/storage";
import { userLogout, driverGuideLogout } from "../services/authService";

function Header() {
  const user = getUserData("safarix_user");
  const guide = getUserData("guide");
  const driver = getUserData("driver");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showDriverGuideLogin, setShowDriverGuideLogin] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileMenuRef = useRef(null);
  const location = useLocation();

  const isTransparentHeader =
    location.pathname === "/" || location.pathname === "/hotel";

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setShowProfileMenu(false);
    await userLogout();
    removeUserData("safarix_user");
    removeUserData("safarix_token");
    removeUserData("safarix_refreshtoken");
    dispatch(logout());
    window.location.reload(true);
  };

  const handleDriverLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setShowProfileMenu(false);
    await driverGuideLogout();
    removeUserData("driver");
    removeUserData("driver_token");
    removeUserData("driver_refreshtoken");
    dispatch(logout());
    window.location.reload(true);
  };

  const handleGuideLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setShowProfileMenu(false);
    await driverGuideLogout();
    removeUserData("guide");
    removeUserData("guide_token");
    removeUserData("guide_refreshtoken");
    dispatch(logout());
    window.location.reload(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isTransparentHeader) return; // scroll listener sirf home/hotel me lagega

    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTransparentHeader]);

  return (
    <div>
     <header
  className={
    isTransparentHeader
      ? isSticky
        ? "sticky-header"
        : "transparent-header"
      : "sticky-header"
  }
>
  <nav className="navbar navbar-expand-lg">
    <div className="container-fluid">
      <a className="navbar-brand" href="/">
        <img
          src="/images/Safarix-Blue-Logo.png"
          alt="Safarix Logo"
          height="50"
        />
      </a>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                {/* Flight (default active if /) */}
                <li className="nav-item">
                  <NavLink
                    to="/flight"
                    className={({ isActive }) =>
                      "nav-link" +
                      (isActive || location.pathname === "/" ? " active" : "")
                    }
                  >
                    <i className="bi bi-airplane"></i> Flight
                  </NavLink>
                </li>

                {/* Hotel */}
                <li className="nav-item">
                  <NavLink
                    to="/hotel"
                    className={({ isActive }) =>
                      "nav-link" + (isActive ? " active" : "")
                    }
                  >
                    <i className="bi bi-building"></i> Hotel
                  </NavLink>
                </li>

                {/* Guide */}
                <li className="nav-item">
                  <NavLink
                    to="/guides"
                    className={({ isActive }) =>
                      "nav-link" + (isActive ? " active" : "")
                    }
                  >
                    <i className="bi bi-person-badge"></i> Guides
                  </NavLink>
                </li>

          {/* Cab */}
          {/* <li className="nav-item">
            <NavLink
              to="/cabs"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <i className="bi bi-taxi-front"></i> Cab
            </NavLink>
          </li> */}
          {/* Bus */}
          <li className="nav-item">
            <NavLink
              to="/Bus-list"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <i className="bi bi-bus-front"></i> Buses
            </NavLink>
          </li>
        </ul>
      </div>

            <div className="plan my-3" style={{ marginRight: "14px" }}>
              <button
                className="explore-btn"
                onClick={() => navigate("/bot-modal")}
              >
                Plan My Holiday 24 x 7
              </button>
            </div>

      {/* User Icon & Profile Menu */}
      <div className="user-icon position-relative">
        <div className="profile-wrapper" ref={profileMenuRef}>
          <a
            className="profile-icon-link"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
           <img
              src="images/userprofile.png"
              alt="User Icon"
              className="user-icon-image"
            />
          </a>

                {showProfileMenu && (
                  <div className="profile-menu">
                    <div className="profile-heading">Profile</div>
                    <ul>
                      {!user && !guide && !driver && (
                        <>
                          <li
                            onClick={() => {
                              setShowUserLogin(true);
                              setShowProfileMenu(false);
                            }}
                          >
                            Login or Signup as User
                          </li>
                          <li
                            onClick={() => {
                              setShowDriverGuideLogin(true);
                              setShowProfileMenu(false);
                            }}
                          >
                            Login as Guide
                          </li>
                        </>
                      )}
                      {user && !guide && !driver && (
                        <li
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/user-dashboard");
                          }}
                        >
                          My Profile
                        </li>
                      )}
                      {guide && !user && !driver && (
                        <li
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/guide-dashboard");
                          }}
                        >
                          My Profile
                        </li>
                      )}
                      {driver && !guide && !user && (
                        <li
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/driver-dashboard");
                          }}
                        >
                          My Profile
                        </li>
                      )}

                      <li
  onClick={() => {
    setShowProfileMenu(false);
    navigate("/guide-careers");
  }}
>
  Guide Careers
</li>


                    
                      {!user && !guide && !driver && ""}
                      {user && (
                        <li
                          role="button"
                          className="text-danger"
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right me-2">Logout</i>
                        </li>
                      )}
                      {guide && (
                        <li
                          role="button"
                          className="text-danger"
                          onClick={handleGuideLogout}
                        >
                          <i className="bi bi-box-arrow-right me-2">Logout</i>
                        </li>
                      )}
                      {driver && (
                        <li
                          role="button"
                          className="text-danger"
                          onClick={handleDriverLogout}
                        >
                          <i className="bi bi-box-arrow-right me-2">Logout</i>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <AuthModal
                show={showUserLogin}
                onClose={() => setShowUserLogin(false)}
                setShowUserLogin={setShowUserLogin}
              />

              <DriverGuideAuth
                show={showDriverGuideLogin}
                onClose={() => setShowDriverGuideLogin(false)}
                setShowDriverGuideLogin={setShowDriverGuideLogin}
              />
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default Header;
