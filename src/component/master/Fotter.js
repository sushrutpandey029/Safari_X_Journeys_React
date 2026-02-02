import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../home/Home.css";
import { useNavigate } from "react-router-dom";

import BotModal from "../common/BotModal";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";

const bots = [
  {
    icon: "/Images/phone-call.png",
    label: "Call",
    phone: "9821351111",
    type: "call",
  },
  {
    icon: "/Images/whatsapp.png",
    label: "Whatsapp",
    phone: "9821351111",
    message: "Hello, I want to know more about your services.",
    type: "whatsapp",
  },
  {
    icon: "/Images/gmail.png",
    label: "Mail",
    email: "tomharry192999@gmail.com",
    subject: "Service Inquiry",
    body: "Hi, I'm interested in your services. Please provide more info.",
    type: "mail",
  },
];

function Footer() {
  const navigate = useNavigate(); // ✅ FIXED
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <>
      {/* ================= BOT SECTION ================= */}
      <div className="foot">
        <div className="container">
          <div className="row justify-content-center">
            {bots.map((bot, index) => {
              let link = "";

              if (bot.type === "whatsapp") {
                link = `https://wa.me/${bot.phone}?text=${encodeURIComponent(
                  bot.message || ""
                )}`;
              } else if (bot.type === "call") {
                link = `tel:${bot.phone}`;
              } else if (bot.type === "mail") {
                link = `mailto:${bot.email}?subject=${encodeURIComponent(
                  bot.subject || ""
                )}&body=${encodeURIComponent(bot.body || "")}`;
              }

              return (
                <div
                  key={index}
                  className="col-6 col-md-3 d-flex justify-content-center"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="chatbot-box text-center">
                      <img src={bot.icon} alt={bot.label} />
                      <p>{bot.label}</p>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="container">
          <div className="row">

            <div className="col-sm-6 col-md-3 mb-4">
              <h5>Safarix</h5>
              <ul className="list-unstyled">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/blogs">Blogs</a></li>
              </ul>
            </div>

            <div className="col-sm-6 col-md-3 mb-4">
              <h5>Support</h5>
              <ul className="list-unstyled">
                <li><a href="/contact-us">Contact Us</a></li>
                <li><a href="/guide-careers">Guide Careers</a></li>
              </ul>
            </div>

            <div className="col-sm-6 col-md-3 mb-4">
              <h5>Services</h5>
              <ul className="list-unstyled">
                <li><a href="/flight">Flight</a></li>
                <li><a href="/hotel">Hotels</a></li>
                <li><a href="/guides">Guide</a></li>
                <li><a href="/Bus-list">Bus</a></li>
              </ul>
            </div>

            <div className="col-sm-6 col-md-3 mb-4">
              <h5>SAFARIX JOURNEYS PRIVATE LIMITED</h5>

              {/* Social Icons */}
              <div className="d-flex gap-2 mb-3">
                <a href="https://www.facebook.com/profile.php?id=61584561766143" target="_blank" rel="noreferrer"><FaFacebookF /></a>
                <a href="https://www.instagram.com/safarixjourneys" target="_blank" rel="noreferrer"><FaInstagram /></a>
                <a href="https://twitter.com/safarixjourneys" target="_blank" rel="noreferrer"><FaXTwitter /></a>
                <a href="https://www.linkedin.com/in/aditya-baghel-b420b4396/" target="_blank" rel="noreferrer"><FaLinkedinIn /></a>
              </div>

              {/* Payment */}
              <h6>Payment Methods</h6>
              <div className="d-flex gap-2 flex-wrap mb-2">
                <img src="/Images/upi.jpg" alt="UPI" height="30" />
                <img src="/Images/visa.jpg" alt="Visa" height="30" />
                <img src="/Images/mastercard.jpg" alt="MasterCard" height="30" />
                <img src="/Images/rupay.jpg" alt="Rupay" height="30" />
              </div>

              <small className="text-white">
                Your payment is protected with <strong>256-bit SSL encryption</strong>.
              </small>
            </div>
          </div>

          {/* ================= FOOTER BOTTOM ================= */}
          <div className="footer-bottom text-center border-top pt-3 mt-4">
            <p>© 2025. All Rights Reserved</p>

            <div className="d-block justify-content-center gap-2 mb-3">
              <a href="/terms-conditions">Terms & Condition</a> |&nbsp;
              <a href="/privacy-policy">Privacy Policy</a> |&nbsp;
              <a href="/cancelation">Cancellation</a>
            </div>

            <button
              className="arix-chat"
              onClick={() => navigate("/bot-modal")}
            >
              <img
                src="/logo/Safarix Fav Icon.svg"
                alt="Arix Chatbot"
                style={{
                  width: "65px",
                  height: "65px",
                  objectFit: "contain",
                }}
              />
              <span>Ask Arix...</span>
            </button>
          </div>
        </div>

        {showChat && <BotModal toggleChat={toggleChat} />}
      </footer>
    </>
  );
}

export default Footer;
