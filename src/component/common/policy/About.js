import React from "react";

const About= () => {
  return (
    <div className="about" style={{marginTop:"90px"}}>
      <div className="terms-container container-fluid">
        {/* Header Section */}
        <div className="terms-header">
          <h1>About Safarix Journeys</h1>
        </div>

        {/* Divider Line */}
        <div className="terms-divider"></div>

        {/* Content Section */}
        <div className="terms-content">
          <p>
            At Safarix Journeys, we believe every trip is more than just a
            journey, it’s a story waiting to be lived and remembered. Founded in
            <strong> 2025</strong> by passionate young entrepreneurs with
            extensive travel experience across India and abroad, we are
            redefining the way people explore the world.
          </p>

          <p>
            What sets us apart is our unique blend of technology and human
            touch. Using advanced <strong>AI-powered itinerary planning</strong>,
            we curate highly personalized travel experiences that adapt to your
            preferences, pace, and style. And because we value your comfort and
            cultural sensitivities, we also provide the option of male or female
            guides, ensuring that every traveler feels completely at ease.
          </p>

          <p>
            Our core values remain rooted in <strong>trust, safety, and
            personalization</strong>. Whether you dream of a wildlife safari, a
            cultural immersion, or a luxury escape, our team ensures that every
            detail is seamlessly managed, from the first step of planning to the
            last mile of your journey.
          </p>

          <h3>Why travelers choose Safarix Journeys:</h3>
          <ul>
            <li>
              <strong>Tailored Itineraries:</strong> Each journey is unique,
              built around your preferences.
            </li>
            <li>
              <strong>AI-Curated Travel:</strong> Smarter, faster, and more
              personalized trip planning.
            </li>
            <li>
              <strong>Local Expertise:</strong> Deep on-ground knowledge for
              authentic experiences.
            </li>
            <li>
              <strong>Choice of Guides:</strong> Male or female guides
              available, as per your comfort.
            </li>
            <li>
              <strong>Seamless Service:</strong> End-to-end logistics, so you
              simply enjoy.
            </li>
            <li>
              <strong>Sustainable Travel:</strong> Responsible practices that
              support communities and nature.
            </li>
          </ul>

          <p style={{ marginTop: 24, fontStyle: "italic" }}>
            At Safarix Journeys, we don’t just take you places, we help you
            discover yourself through travel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
