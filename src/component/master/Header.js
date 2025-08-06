import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../home/Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  console.log("data in header", user, guide, driver);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showDriverGuideLogin, setShowDriverGuideLogin] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileMenuRef = useRef(null);

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

  //driver logout furnciotn
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

  //guide logout funciton
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

  return (
    <div>
      <header>
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <a className="navbar-brand" href="/">
              <img
                src="/images/Safarix-Logo1.png"
                alt="Safarix Logo"
                height="70"
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
                <li className="nav-item">
                  <a className="nav-link active" href="/guides">
                    Guided tours
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/cabs">
                    Cabs
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/hotel">
                    Hotels
                  </a>
                </li>
              </ul>
            </div>

            <div className="plan my-3" style={{ marginRight: "60px" }}>
              <button
                className="explore-btn"
                onClick={() => navigate("/bot-modal")}
              >
                <img
                  src="/images/car-assistance.png"
                  alt="icon"
                  style={{
                    width: "30px",
                    height: "30px",
                    // marginRight: "8px",
                    verticalAlign: "middle",
                  }}
                />
                Plan My Holiday
              </button>
            </div>

            <div className="user-icon position-relative">
              <a href="#">
                <i className="bi bi-cart"></i>
              </a>
              <div className="profile-wrapper" ref={profileMenuRef}>
                <a
                  className="profile-icon-link"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <i className="bi bi-person"></i>
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
                            Log in or sign up as User
                          </li>
                          <li
                            onClick={() => {
                              setShowDriverGuideLogin(true);
                              setShowProfileMenu(false);
                            }}
                          >
                            Log in as Driver or Guide
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

                      <li>Updates</li>
                      <li>Appearance</li>
                      <li>Support</li>
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
