import React from 'react';
import Header from '../Master/header';
import Footer from '../Master/fotter';

import useState from 'react';
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube, FaLinkedinIn, FaRegCopyright } from 'react-icons/fa6';

import { Card, Button, Row, Col } from 'react-bootstrap';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const imageList = [
  { id: 1, src: '/Images/place.jpg', title: 'First Image' },
  { id: 1, src: '/Images/place.jpg', title: 'First Image' },
  { id: 1, src: '/Images/place.jpg', title: 'First Image' },
  { id: 1, src: '/Images/place.jpg', title: 'First Image' },
  { id: 1, src: '/Images/place.jpg', title: 'First Image' },
];




const cabList = [
  { name: 'AULI', image: '/Images/cab.png' },
  { name: 'Manali', image: '/Images/cab.png' },
  { name: 'Jammau', image: '/Images/cab.png' },
  { name: 'Jaipur', image: '/Images/cab.png' },
];
const destinations = [
  { name: 'AULI', image: '/Images/place.jpg' },
  { name: 'Manali', image: '/Images/place.jpg' },
  { name: 'Jammau', image: '/Images/place.jpg' },
  { name: 'Jaipur', image: '/Images/place.jpg' },
];

const Populardestinations = [
  { name: 'leh ladakh', image: '/Images/popular.png' },
  { name: 'MaManaLinali', image: '/Images/popular.png' },
  { name: 'JaDarjeeling', image: '/Images/popular.png' },
  { name: 'Jamussoorie', image: '/Images/popular.png' },
  { name: 'Jamussoorie', image: '/Images/popular.png' },
  { name: 'Jamussoorie', image: '/Images/popular.png' },
  { name: 'Jamussoorie', image: '/Images/popular.png' },
  { name: 'Jamussoorie', image: '/Images/popular.png' },

];

const choose = [
  { name: 'AULI', image: '/Images/icon1.png' },
  { name: 'Manali', image: '/Images/icon2.png' },
  { name: 'Jammau', image: '/Images/icon3.png' },
  { name: 'Jaipur', image: '/Images/icon4.png' },
  { name: 'Jammau', image: '/Images/icon5.png' },
  { name: 'Jaipur', image: '/Images/icon6.png' },
];


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

const dataList = [
  {
    id: 1,
    name: 'Tarun kumar',
    time: '12 Hr Ago',
    image: '/Images/guide.webp',
    description: 't sodales convallis nisi odio malesuada adipiscing.'
  },
  {
    id: 2,
    name: 'Tarun kumar',
    time: '12 Hr Ago',
    image: '/Images/guide.webp',
    description: 't sodales convallis nisi odio malesuada adipiscing.'
  },
  {
    id: 3,
    name: 'Tarun kumar',
    time: '12 Hr Ago',
    image: '/Images/guide.webp',
    description: 't sodales convallis nisi odio malesuada adipiscing.'
  }
];


const blogs = [
  { name: 'AULI', image: '/Images/blog.png' },
  { name: 'Manali', image: '/Images/blog2.jpg' },
  { name: 'Jammau', image: '/Images/blog3.jpg' },
];

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

function Home() {
  return (
    <div>
      

      <div className="banner">
        <Slider {...settings}>
          <div>
            <img src="/images/banner.jpeg" className="banner-img" alt="Banner 1" />
          </div>
          <div>
            <img src="/images/banner.jpeg" className="banner-img" alt="Banner 2" />
          </div>
          <div>
            <img src="/images/banner.jpeg" className="banner-img" alt="Banner 3"/>
          </div>
        </Slider>

        <div className="text-banner text-center mt-3">
          <h2>Where Every Experience Counts!</h2>
        </div>
      </div>



      <div className="container mt-5">
        <div className="row">
          {imageList.map((img) => (
            <div className="col mb-5" key={img.id}>
              <div className="place">
                <img src={img.src} alt={img.title} />
                <p className="card-destination">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='trending-destination'>
        <div className="container">
          <div className="row">
            <div className='col-sm-9'>
              <h2 >
                Top Trending <span>Destinations</span>
              </h2>
              <p className='perra'>
                Explore The Hottest Travel Spots Around The Globe.
              </p>
            </div>
            <div className='col-sm-3 text-end'>
              <button className="explore-btn">Explore More</button></div>
          </div>
          <div className="row">
            {destinations.map(function (dest, index) {
              return (
                <div className="col-md-3" key={index}>
                  <div className="destination-card">
                    <img src={dest.image} alt={dest.name} className="img-fluid rounded" />
                    <h5 className="mt-3">{dest.name}</h5>
                    <p className="text-muted small">GUIDED TOUR / 2 HOURS</p>
                    <div className="row">
                      <div className='col-sm-6 col-6'>
                        <p>Starting From</p>
                      </div>
                      <div className='col-sm-6 col-6 text-end'>
                        <span className="text-muted text-decoration-line-through">₹42,000</span>{' '}
                        <span className="text-primary">₹8,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      <div className='best-guide'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-12'>
              <h2>Our <span>Best Guide</span></h2>
              <p className='perra'>Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada sodales convallis nisi odio malesuada adipiscing. Etiam Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada </p>
            </div>
            <div className='col-sm-3'>
              <div className='box'>
                <img
                  src="/images/guide.webp"
                  alt="Banner"
                  className="img-fluid"
                />
                <div class="details">
                  <h4>LEH LADAKH</h4>
                  <p><span class="label">Name:</span> Tarun Kumar</p>
                  <p><span class="label">Rating:</span> <span class="stars">★★★★</span></p>
                  <p><span class="label">Experience:</span> 2 Years</p>
                </div>
              </div>
            </div>
            <div className='col-sm-3'>
              <div className='box'>
                <img
                  src="/images/guide.webp"
                  alt="Banner"
                  className="img-fluid"
                />
                <div class="details">
                  <h4>LEH LADAKH</h4>
                  <p><span class="label">Name:</span> Tarun Kumar</p>
                  <p><span class="label">Rating:</span> <span class="stars">★★★★</span></p>
                  <p><span class="label">Experience:</span> 2 Years</p>
                </div>
              </div>
            </div>
            <div className='col-sm-3'>
              <div className='box'>
                <img
                  src="/images/guide.webp"
                  alt="Banner"
                  className="img-fluid"
                />
                <div class="details">
                  <h4>LEH LADAKH</h4>
                  <p><span class="label">Name:</span> Tarun Kumar</p>
                  <p><span class="label">Rating:</span> <span class="stars">★★★★</span></p>
                  <p><span class="label">Experience:</span> 2 Years</p>
                </div>
              </div>
            </div>
            <div className='col-sm-3'>
              <div className='box'>
                <img
                  src="/images/guide.webp"
                  alt="Banner"
                  className="img-fluid"
                />
                <div class="details">
                  <h4>LEH LADAKH</h4>
                  <p><span class="label">Name:</span> Tarun Kumar</p>
                  <p><span class="label">Rating:</span> <span class="stars">★★★★</span></p>
                  <p><span class="label">Experience:</span> 2 Years</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className='best-cab'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-12'>
              <h2>find the <span>best cabs </span></h2>
              <p className='perra'>
                Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada sodales convallis nisi odio malesuada adipiscing. Etiam Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada
              </p>
            </div>
            {cabList.map((cab, index) => (
              <div className="col-md-3" key={index}>
                <div className='cab-box'>
                  <img src={cab.image} alt={cab.name} className="img-fluid" />
                  <div className='d-flex'>
                    <h4>
                      Hatchback
                      <span>Starting- 800/day</span>
                    </h4>
                    <button className='explore-btn'>BOOK NOW</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      <div className="book-hotel ">
        <div className='container'>
          <div class="row">
            <div className='col-sm-12 d-flex'>
              <div className='col-sm-6'>
                <h2>
                  Book Hotel At <span> <br></br> Populer Destinations</span>
                </h2>
              </div>
              <div className='col-sm-6 text-end my-5'>
                <Button className="explore-btn">View More</Button>
              </div>
            </div>
            {Populardestinations.map((dest, index) => (
              <Col key={index} md={6} lg={3}>
                <Card className="destination-card ">
                  <Card.Img variant="top" src={dest.image} />
                  <Card.Body>
                    <div className='place-pop'>
                      <div className='col-sm-6'>
                        <Card.Title className="destination-title">{dest.name} </Card.Title>
                      </div>
                      <div className='col-sm-6'>
                        <p className="destination-properties text-end">{dest.properties} Properties</p>
                      </div>
                    </div>
                    <Card.Text className="destination-price"><a>Starting from - ₹ 10,000</a> <span>{dest.price}</span></Card.Text>

                    <Card.Text className="destination-desc">
                      Hotels, Budget Hotels, 3 Star Hotels, 4 Star Hotels, 5 Star Hotels
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </div>
        </div>
      </div>



      <div className='why-choose'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-12 mb-5 text-center'>
              <h2>why <span>Choose </span>us</h2>
            </div>
            {choose.map(function (choos, index) {
              return (
                <div className='col-sm-4'>
                  <div className='choose-box'>
                    <img src={choos.image} alt={choos.name} className="img-fluid" />
                    <h4>Small Groups</h4>
                    <p>Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada sodales
                      convallis nisi odio malesuada adipiscing. Etiam Lorem ipsum dolor sit
                      amet consectetur. Porttitor dolor malesuada </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      <div className='Testionials'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-9'>
              <h2>
                Client <span>Testimonials</span>
              </h2>
            </div>
            <div className='col-sm-3 text-end '>
              <Button className="explore-btn">Read All Review</Button>
            </div>
            <div className="card-container">
              {dataList.map((item) => (
                <div key={item.id} className="card">
                  <div className='Time d-flex'>
                    <h5 className='col-sm-6'>{item.name}</h5>
                    <div className='col-sm-6'>
                      <a className href="#">{item.time}</a>
                    </div>
                  </div>

                  <div className='col-sm-12 d-flex'>
                    <div className='col-sm-5'>
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className='col-sm-7'>
                      <p className='mb-0'>{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      <div className='Faq'>
        <div className='conatoner'>
          <div className='main'>

            <div className='row justify-content-center'>
              <div className='col-sm-6'>
                <h2 className='text-start mb-3'> FAQ</h2>
                <div class="accordion accordion-flush" id="accordionFlushExample">
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingOne">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                        Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada
                      </button>
                    </h2>
                    <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item's accordion body.</div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingTwo">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                        Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada 2
                      </button>
                    </h2>
                    <div id="flush-collapseTwo" class="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionFlushExample">
                      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the second item's accordion body. Let's imagine this being filled with some actual content.</div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingThree">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
                        Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada 3
                      </button>
                    </h2>
                    <div id="flush-collapseThree" class="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-bs-parent="#accordionFlushExample">
                      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the third item's accordion body. Nothing more exciting happening here in terms of content, but just filling up the space to make it look, at least at first glance, a bit more representative of how this would look in a real-world application.</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>



      <div className='blog'>
        <div className='container'>
          <div class="row">
            <div class="col-sm-9">
              <h2>Our Recent <span>Blogs</span></h2>
              <p className='perra'>Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada sodales convallis nisi odio Porttitor dolor malesuada sodales convallis nisi odio </p>
            </div>
            <div class="col-sm-3 text-end">
              <button class="explore-btn">Explore More</button>
            </div>
          </div>
          <div className='row'>
            {blogs.map(function (blog, index) {
              return (

                <div className='col-sm-4'>
                  <div className='blog-box'>
                    <img src={blog.image} alt={blog.name} className="img-fluid" />
                    <h5>Travel Guides</h5>
                    <h4>Lorem ipsum dolor sit amet consectetu Porttitor dolor </h4>
                    <p>Lorem ipsum dolor sit amet consectetu Porttitor dolor malesuada
                      sodales  Lorem ipsum dolor sit amet consectetu Porttitor dolor malesuada sodales </p>
                    <h6>November 25,2025</h6>
                    <button className='explore-btn'>Read More</button>
                  </div>
                </div>

              );
            })}</div>
        </div>
      </div>



      <div className='newslater'>
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
                Your <span className="text-primary">Travel Journey</span> Starts Here
              </h3>
              <p className="mb-3">Sign Up And We'll Send The Best Deals To You</p>

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

export default Home;
