import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../Home/home.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AuthModal from "../auth/AuthModal";

function Header() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <header>
        <nav class="navbar navbar-expand-lg">
          <div class="container">
            <a class="navbar-brand" href="#">
              LOGO
            </a>
            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <form>
              <div class="search-container">
                <div class="search-input">
                  <i class="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Find Place And Things To Do"
                  />
                </div>
                <div class="divider"></div>
                <div class="date-picker">
                  <i class="bi bi-calendar3"></i>
                  <span>Any Time</span>
                  <i class="bi bi-caret-down-fill"></i>
                </div>
                <button class="explore-btn">Search</button>
              </div>
            </form>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="#">
                    Guided tours
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">
                    Cabs
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">
                    Hotels
                  </a>
                </li>
              </ul>
            </div>
            <div class="user-icon">
              <a href="#">
                <i class="bi bi-heart"></i>
              </a>
              <a href="#">
                <i class="bi bi-cart"></i>
              </a>
              <a onClick={() => setShowModal(true)} type="button">
                <i class="bi bi-person"></i>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* modal component */}
      <AuthModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default Header;
