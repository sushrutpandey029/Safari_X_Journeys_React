import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "bootstrap/dist/css/bootstrap.min.css";

import BotModal from "../common/BotModal";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";

const bots = [
  {
    icon: "/images/whats.png",
    label: "Whatsapp Chatbot",
    phone: "919821351444",
    message: "Hello, I want to know more about your services.",
    type: "whatsapp",
  },
  {
    icon: "/images/call.png",
    label: "Call Chatbot",
    phone: "919821351444",
    type: "call",
  },
  {
    icon: "/images/mail.png",
    label: "Mail Chatbot",
    email: "tomharry192999@gmail.com",
    subject: "Service Inquiry",
    body: "Hi, I'm interested in your services. Please provide more info.",
    type: "mail",
  },
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
            {bots.map((bot, index) => {
              let link = null;

              if (bot.type === "whatsapp") {
                link = `https://wa.me/${bot.phone}?text=${encodeURIComponent(
                  bot.message || ""
                )}`;
              } else if (bot.type === "call") {
                link = `tel:${bot.phone}`;
              } else if (bot.type === "mail") {
                const subject = encodeURIComponent(bot.subject || "");
                const body = encodeURIComponent(bot.body || "");
                link = `mailto:${bot.email}?subject=${subject}&body=${body}`;
              }

              return (
                <div
                  key={index}
                  className="col-6 col-md-3 d-flex justify-content-center"
                >
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="chatbot-box">
                        <img src={bot.icon} alt={bot.label} />
                        <p>{bot.label}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="chatbot-box">
                      <img src={bot.icon} alt={bot.label} />
                      <p>{bot.label}</p>
                    </div>
                  )}
                </div>
              );
            })}
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
                  <a href="/blogs" rel="noopener noreferrer">
                    Blogs
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
                  <a href="/guide-careers" rel="noopener noreferrer">
                    Guide Careers
                  </a>
                </li>
                {/* <li>
                  <a href="#faq" rel="noopener noreferrer">
                    FAQs
                  </a>
                </li> */}
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
                  <a href="/cabs" rel="noopener noreferrer">
                    Cabs
                  </a>
                </li>
                <li>
                  <a href="/places" rel="noopener noreferrer">
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

                <FaLinkedinIn />
              </div>

              <h5 className="mt-5">Payment Methods</h5>
              <div className="d-flex gap-2 flex-wrap">
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                <div className="payment-box bg-secondary p-2 rounded"></div>
                {/* Chatbot Icon */}
                {/* <div
                  className="chatbot-icon d-flex justify-content-center align-items-center"
                  onClick={toggleChat}
                >
                  <i className="bi bi-globe-americas"></i>
                </div> */}
                {/* Chat Popup */}
                {showChat && <BotModal toggleChat={toggleChat} />}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}

          <div className="footer-bottom mt-4 border-top pt-3">
  <p className="mb-2">&copy; 2025. All Rights Reserved</p>
 <div className="d-flex justify-content-center align-items-center gap-2 mt-0 text-light">
  <a href="/terms-conditions" className="text-decoration-none text-light">
    Terms & Condition
  </a>
  <span className="mx-2">|</span>
  <a href="/privacy-policy" className="text-decoration-none text-light">
    Privacy Policy
  </a>
  <span className="mx-2">|</span>
  <a href="/cancelation" className="text-decoration-none text-light">
    Cancellation
  </a>
</div>


</div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;



