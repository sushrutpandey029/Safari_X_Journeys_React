// import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import "../home/Home.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import AuthModal from "../auth/AuthModal";

// function Header() {
//   const [showModal, setShowModal] = useState(false);
//   return (
//     <div>
//       <header>
//         <nav class="navbar navbar-expand-lg">
//           <div class="container">
//             <a class="navbar-brand" href="#">
//               LOGO
//             </a>
//             <button
//               class="navbar-toggler"
//               type="button"
//               data-bs-toggle="collapse"
//               data-bs-target="#navbarSupportedContent"
//               aria-controls="navbarSupportedContent"
//               aria-expanded="false"
//               aria-label="Toggle navigation"
//             >
//               <span class="navbar-toggler-icon"></span>
//             </button>
//             <form>
//               <div class="search-container">
//                 <div class="search-input">
//                   <i class="bi bi-search"></i>
//                   <input
//                     type="text"
//                     placeholder="Find Place And Things To Do"
//                   />
//                 </div>
//                 <div class="divider"></div>
//                 <div class="date-picker">
//                   <i class="bi bi-calendar3"></i>
//                   <span>Any Time</span>
//                   <i class="bi bi-caret-down-fill"></i>
//                 </div>
//                 <button class="explore-btn">Search</button>
//               </div>
//             </form>
//             <div class="collapse navbar-collapse" id="navbarSupportedContent">
//               <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
//                 <li class="nav-item">
//                   <a class="nav-link active" aria-current="page" href="#">
//                     Guided tours
//                   </a>
//                 </li>
//                 <li class="nav-item">
//                   <a class="nav-link" href="#">
//                     Cabs
//                   </a>
//                 </li>
//                 <li class="nav-item">
//                   <a class="nav-link" href="#">
//                     Hotels
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div class="user-icon">
//               <a href="#">
//                 <i class="bi bi-heart"></i>
//               </a>
//               <a href="#">
//                 <i class="bi bi-cart"></i>
//               </a>
//               <a href="#">
//                 <i class="bi bi-person"></i>
//               </a>
    
//             </div>
//           </div>
//         </nav>
//       </header>

//       {/* modal component */}
//       <AuthModal show={showModal} onClose={() => setShowModal(false)} />
//     </div>
//   );
// }

// export default Header;





import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../home/Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useState } from "react";
import AuthModal from "../auth/AuthModal";

function Header() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    setShowProfileMenu(false);
    // Clear local storage or cookies if needed
    localStorage.removeItem("authToken");
    alert("Logged out successfully!");
    // Redirect or update login state
  };

  return (
    <div>
      <header>
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <a className="navbar-brand" href="#">
              LOGO
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <form>
              <div className="search-container">
                <div className="search-input">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Find Place And Things To Do"
                  />
                </div>
                <div className="divider"></div>
                <div className="date-picker">
                  <i className="bi bi-calendar3"></i>
                  <span>Any Time</span>
                  <i className="bi bi-caret-down-fill"></i>
                </div>
                <button className="explore-btn">Search</button>
              </div>
            </form>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" href="#">
                    Guided tours
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Cabs
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Hotels
                  </a>
                </li>
              </ul>
            </div>

            {/* USER ICONS */}
            <div
              className="user-icon position-relative"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <a href="#">
                <i className="bi bi-heart"></i>
              </a>
              <a href="#">
                <i className="bi bi-cart"></i>
              </a>
              <div className="profile-wrapper">
                <a
                  onMouseEnter={() => setShowProfileMenu(true)}
                  className="profile-icon-link"
                >
                  <i className="bi bi-person"></i>
                </a>

                {showProfileMenu && (
                  <div className="profile-menu">
                    <div className="profile-heading">Profile</div>
                    <ul>
                      <li>
                        <i
                          className="bi bi-person-circle me-2"
                          role="button"
                          onClick={() => {
                            setShowLoginPopup(true);
                            setShowProfileMenu(false);
                          }}
                        >
                          Log in or sign up
                        </i>
                      </li>
                      <li>Updates</li>
                      <li>Appearance</li>
                      <li>Support</li>
                      <li
                        role="button"
                        className="text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2" >   Logout</i>
                      
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* LOGIN POPUP */}
              {showLoginPopup && (
                <AuthModal setShowLoginPopup={setShowLoginPopup} />
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default Header;
