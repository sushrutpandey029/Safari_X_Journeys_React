import React from "react";

const WhyChooseUs = () => {
  const choose = [
    { name: "AULI", image: "/Images/icon1.png" },
    { name: "Manali", image: "/Images/icon2.png" },
    { name: "Jammau", image: "/Images/icon3.png" },
    { name: "Jaipur", image: "/Images/icon4.png" },
    { name: "Jammau", image: "/Images/icon5.png" },
    { name: "Jaipur", image: "/Images/icon6.png" },
  ];
  return (
    <div className="why-choose">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 mb-5 text-center">
            <h2>
              why <span>Choose </span>us
            </h2>
          </div>
          {choose.map(function (choos, index) {
            return (
              <div className="col-sm-4">
                <div className="choose-box">
                  <img
                    src={choos.image}
                    alt={choos.name}
                    className="img-fluid"
                  />
                  <h4>Small Groups</h4>
                  <p>
                    Lorem ipsum dolor sit amet consectetur. Porttitor dolor
                    malesuada sodales convallis nisi odio malesuada adipiscing.
                    Etiam Lorem ipsum dolor sit amet consectetur. Porttitor
                    dolor malesuada{" "}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
