import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "react-bootstrap/Button";
import "./About.css";
const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <img
      src="/images/right.svg"
      alt="Previous"
      className="custom-arrow right-arrow right-arrow"
      onClick={onClick}
    />
  );
};
const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <img
      src="/images/left.svg"
      alt="Next"
      className="custom-arrow left-arrow"
      onClick={onClick}
    />
  );
};

const settings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: false,
  autoplaySpeed: 2500,
  arrows: true,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
};

const dataList = [
  {
    id: 1,
    name: "Tarun kumar",
    time: "12 Hr Ago",
    image: "/Images/guide.webp",
    description: "t sodales convallis nisi odio malesuada adipiscing.",
  },
  {
    id: 2,
    name: "Tarun kumar",
    time: "12 Hr Ago",
    image: "/Images/guide.webp",
    description: "t sodales convallis nisi odio malesuada adipiscing.",
  },
  {
    id: 3,
    name: "Tarun kumar",
    time: "12 Hr Ago",
    image: "/Images/guide.webp",
    description: "t sodales convallis nisi odio malesuada adipiscing.",
  },
];

const imagePaths = [
  "/images/banner.jpeg",
  "/images/banner.jpeg",
  "/images/banner.jpeg",
  "/images/banner.jpeg",
];
function About() {
  return (
    <div>
      <div className="banner">
        <Slider {...settings}>
          <div>
            <img
              src="/images/banner.jpeg"
              className="banner-img"
              alt="Banner 1"
            />
          </div>
          <div>
            <img
              src="/images/banner.jpeg"
              className="banner-img"
              alt="Banner 2"
            />
          </div>
          <div>
            <img
              src="/images/banner.jpeg"
              className="banner-img"
              alt="Banner 3"
            />
          </div>
        </Slider>

        <div className="text-banner text-center mt-3">
          <h2>Where Every Experience Counts!</h2>
        </div>
      </div>

      <div className="about">
        <div className="container my-5">
          <div className="row">
            <h4 className="mt-3">About Us</h4>
            {/* Left Side - col-sm-4 */}
            <div className="col-sm-4">
              <p>
                Welcome to our platform! We are passionate about providing the
                best experience for our users. Our mission is to deliver
                high-quality content and services that make your journey
                enjoyable and meaningful.
              </p>
            </div>

            {/* Right Side - col-sm-8 */}
            <div className="col-sm-8">
              <p className="offset-sm-2">
                Welcome to our platform! We are passionate about providing the
                best experience for our users. Our mission is to deliver
                high-quality content and services that make your journey
                enjoyable and meaningful.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-box">
        <div className="container my-5">
          <div className="row">
            {/* Left Side: Image */}
            <div className="col-sm-6">
              <img
                src="/images/banner.jpeg"
                alt="Guide"
                className="img-fluid rounded shadow"
              />
            </div>

            {/* Right Side: 3 Vertical Boxes */}
            <div className="col-sm-6 d-flex flex-column justify-content-between">
              <div className="mb-3" style={{ height: "173px" }}>
                <div className="border rounded p-2 h-100 d-flex align-items-center bg-light">
                  Box 1 Content
                </div>
              </div>
              <div className="mb-3" style={{ height: "173px" }}>
                <div className="border rounded p-2 h-100 d-flex align-items-center bg-light">
                  Box 2 Content
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="Team">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 d-flex">
                <div className="col-sm-6">
                  <h3>
                    Top Trending <span className="dest"> Destination</span>
                  </h3>
                </div>
                <div className="col-sm-6">
                  <p>
                    Line 249:23: The href attribute requires a valid value to be
                    accessible. Provide a valid, navigable address as the href
                    value. If you cannot provide a valid href, but still need
                    the element to resemble a link, use a button and change it
                    with appropriate styles. Learn more:
                    https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="safari-x">
        <div className="container my-5">
          <div className="row">
            {imagePaths.map((src, idx) => (
              <div className="col-md-3 mb-4" key={idx}>
                <div className="card h-100 shadow rounded-4">
                  <img
                    src={src}
                    className="card-img-top rounded-top-4"
                    alt={`Banner ${idx + 1}`}
                  />
                  <div className="card-body">
                    <h5 className="card-title fw-bold">Lorem ipsum dolor</h5>
                    <p className="card-text">
                      Lorem ipsum dolor sit amet consectetur. Scelerisque nibh
                      ultrices at Lorem ipsum dolor sit.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="Testionials">
        <div className="container">
          <div className="row">
            <div className="col-sm-9">
              <h2>
                Client <span>Testimonials</span>
              </h2>
            </div>
            <div className="col-sm-3 text-end ">
              <Button className="explore-btn">Read All Review</Button>
            </div>
            <div className="card-container">
              {dataList.map((item) => (
                <div key={item.id} className="card">
                  <div className="Time d-flex">
                    <h5 className="col-sm-6">{item.name}</h5>
                    <div className="col-sm-6">
                      <a className href="#">
                        {item.time}
                      </a>
                    </div>
                  </div>

                  <div className="col-sm-12 d-flex">
                    <div className="col-sm-5">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="col-sm-7">
                      <p className="mb-0">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="Faq">
        <div className="conatoner">
          <div className="main">
            <div className="row justify-content-center">
              <div className="col-sm-6">
                <h2 className="text-start mb-3"> FAQ</h2>
                <div
                  class="accordion accordion-flush"
                  id="accordionFlushExample"
                >
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingOne">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseOne"
                        aria-expanded="false"
                        aria-controls="flush-collapseOne"
                      >
                        Lorem ipsum dolor sit amet consectetur. Porttitor dolor
                        malesuada
                      </button>
                    </h2>
                    <div
                      id="flush-collapseOne"
                      class="accordion-collapse collapse"
                      aria-labelledby="flush-headingOne"
                      data-bs-parent="#accordionFlushExample"
                    >
                      <div class="accordion-body">
                        Placeholder content for this accordion, which is
                        intended to demonstrate the{" "}
                        <code>.accordion-flush</code> class. This is the first
                        item's accordion body.
                      </div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingTwo">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseTwo"
                        aria-expanded="false"
                        aria-controls="flush-collapseTwo"
                      >
                        Lorem ipsum dolor sit amet consectetur. Porttitor dolor
                        malesuada 2
                      </button>
                    </h2>
                    <div
                      id="flush-collapseTwo"
                      class="accordion-collapse collapse"
                      aria-labelledby="flush-headingTwo"
                      data-bs-parent="#accordionFlushExample"
                    >
                      <div class="accordion-body">
                        Placeholder content for this accordion, which is
                        intended to demonstrate the{" "}
                        <code>.accordion-flush</code> class. This is the second
                        item's accordion body. Let's imagine this being filled
                        with some actual content.
                      </div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingThree">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseThree"
                        aria-expanded="false"
                        aria-controls="flush-collapseThree"
                      >
                        Lorem ipsum dolor sit amet consectetur. Porttitor dolor
                        malesuada 3
                      </button>
                    </h2>
                    <div
                      id="flush-collapseThree"
                      class="accordion-collapse collapse"
                      aria-labelledby="flush-headingThree"
                      data-bs-parent="#accordionFlushExample"
                    >
                      <div class="accordion-body">
                        Placeholder content for this accordion, which is
                        intended to demonstrate the{" "}
                        <code>.accordion-flush</code> class. This is the third
                        item's accordion body. Nothing more exciting happening
                        here in terms of content, but just filling up the space
                        to make it look, at least at first glance, a bit more
                        representative of how this would look in a real-world
                        application.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="newslater">
        <div className="container my-5">
          <div className="row  rounded-4 overflow-hidden ">
            {/* Left Image Section */}
            <div className="col-md-6 p-0">
              <img
                src="/images/banner.jpeg"
                alt="Travel"
                className="img-fluid h-100 w-100 object-cover"
              />
            </div>

            {/* Right Content Section */}
            <div className="col-md-6 d-flex newsletter-box flex-column justify-content-center align-items-start p-4">
              <h3 className="fw-bold mb-2">
                Your <span className="text-primary">Travel Journey</span> Starts
                Here
              </h3>
              <p className="mb-3">
                Sign Up And We'll Send The Best Deals To You
              </p>

              <form>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="form-control me-2 rounded-pill"
                />
                <button className="explore-btn" type="submit">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
