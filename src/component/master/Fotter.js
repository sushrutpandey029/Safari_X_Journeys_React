import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "bootstrap/dist/css/bootstrap.min.css";

import BotModal from "../common/BotModal";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaLinkedinIn,
  FaRegCopyright,
} from "react-icons/fa6";

const bots = [
  { icon: "/images/whats.png", label: "Whatsapp Chatbot" },
  { icon: "/images/call.png", label: "Calls Chatbot" },
  { icon: "/images/mail.png", label: "Mail Chatbot" },
  { icon: "/images/chat.png", label: "Message Chatbot" },
];
function Footer() {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div>
      <div className="foot">
        <div className="container">
          <div className="row justify-content-center">
            {bots.map((bot, index) => (
              <div
                key={index}
                className="col-6 col-md-3 d-flex justify-content-center"
              >
                <div className="chatbot-box">
                  <img src={bot.icon} alt={bot.label} />
                  <p>{bot.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer>
        <div className="container">
          <div className="row text-start">
            <div className="col-sm-6 col-md-3 mb-4">
              <h5>Safari X</h5>
              <ul>
                <li>
                  <a href="/" target="_self" rel="noopener noreferrer">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" target="_self" rel="noopener noreferrer">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    Blogs
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    Media Centre
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    LOGO
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-sm-6 col-md-3 mb-4">
              <h5>Support</h5>
              <ul>
                <li>
                  <a
                    href="/contact-us"
                    target="_self"
                    rel="noopener noreferrer"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    Safari X Travel Resources
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    Pre-Departure Info
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    Safety Updates
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-sm-6 col-md-3 mb-4">
              <h5>Services</h5>
              <ul>
                <li>
                  <a href="/guides" rel="noopener noreferrer">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="/hotel" rel="noopener noreferrer">
                    Hotels
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    Cabs
                  </a>
                </li>
                <li>
                  <a href="#" rel="noopener noreferrer">
                    Destinations
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-sm-6 col-md-3 mb-4">
              <h5>Safari X Nation</h5>
              <div className="d-flex gap-2 mb-3">
                <FaFacebookF />
                <FaInstagram />
                <FaXTwitter />
                <FaYoutube />
                <FaLinkedinIn />
                <FaRegCopyright />
              </div>

              <h5 className="mt-5">Payment Methods</h5>
              <div className="d-flex gap-2 flex-wrap">
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                {/* Chatbot Icon */}
                <div
                  className="chatbot-icon d-flex justify-content-center align-items-center"
                  onClick={toggleChat}
                >
                  <i className="bi bi-globe-americas"></i>
                </div>
                {/* Chat Popup */}
                {showChat && <BotModal toggleChat={toggleChat}/>}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}

          <div className="footer-bottom mt-4 border-top pt-3 ">
            <p className="mb-2">&copy; 2025. All Rights Reserved</p>
            <div className="d-flex justify-content-center gap-3 mt-0">
              <span>Terms & Condition</span>
              <span>Privacy Policy</span>
              <span>Manage Cookie</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
