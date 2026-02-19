import React from "react";

const WhyChooseUs = () => {
  const choose = [
    {
      name: "AULI",
      image: "/Images/icon1.png",
      title: "Pan-India Expertise",
      description:
        "From Kashmir to Kanyakumari, Lakshadweep to Arunachal — we offer curated, state-wise travel packages across every region of India. You choose the vibe — we build the journey.",
    },
    {
      name: "Manali",
      image: "/Images/icon2.png",
      title: "100% Customizable Itineraries",
      description:
        "We don’t believe in “one size fits all.” Every package is tailor-made to match your interests, travel goals, budget, and timeline — solo trips, family vacations, luxury getaways, spiritual yatras, or trekking adventures.",
    },
    {
      name: "Jammu",
      image: "/Images/icon3.png",
      title: "Trusted Local Network",
      description:
        "We work with a verified team of licensed tour guides, experienced local partners, and reliable regional transport providers to ensure authentic experiences and safety throughout your journey.",
    },
    {
      name: "Jaipur",
      image: "/Images/icon4.png",
      title: "End-to-End Service",
      description:
        "The Pink City is renowned for its forts, palaces, and vibrant bazaars. A must-visit for culture and history loversFrom your first inquiry to your return home, our dedicated team handles: Flights, and transfers - Hotel bookings (eco, heritage, luxury, homestays) - Activities & sightseeing - On-ground support & emergency assistance.",
    },
    {
      name: "Kerala",
      image: "/Images/icon5.png",
      title: "Unique Stays & Experiences",
      description:
        "Stay in tribal eco-villages, heritage forts, beach cottages, forest retreats, or monasteries. We help you go beyond hotels and beyond clichés.",
    },
    {
      name: "Goa",
      image: "/Images/icon6.png",
      title: "Transparent Pricing",
      description:
        "No hidden charges. No last-minute surprises. You get clearly broken-down pricing with every package.",
    },
    {
      name: "Ladakh",
      image: "/Images/icon6.png",
      title: "Verified, Licensed Guides",
      description:
        "We onboard only certified guides authorized by the Ministry of Tourism and State Tourism Boards. Get historical context, local stories, and insider tips on every destination.",
    },
    {
      name: "Darjeeling",
      image: "/Images/icon6.png",
      title: "24x7 Support – Human, Not Bots",
      description:
        "Our team is available to you before, during, and after your trip. WhatsApp, call, or email — we’re real people who care about your journey.",
    },
  ];

  return (
    <div className="why-choose">
      <div className="container">
        <div className="row justify-content-center">

          {/* Heading Section */}
          <div className="col-sm-12 mb-5 text-center">
            <h2 className=" mb-4">
              why <span>Choose </span>us
            </h2>
            <p className="whychose">
              At Safarix Journeys Private Limited, we don’t just plan trips — we craft meaningful travel experiences. Whether you're chasing Himalayan peaks, relaxing on tranquil beaches, or immersing yourself in rich cultural heritage, we are your trusted companion for discovering Incredible India — your way.
            </p>
          </div>

          {/* Choose Cards */}
          {choose.map((choos, index) => (
            <div key={index} className="col-12 col-md-3 mb-4">
              <div className="choose-box">
                <img
                  src={choos.image}
                  alt={choos.name}
                  className="img-fluid"
                />
                <h4 className="why">{choos.title}</h4>
                <p>{choos.description}</p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;