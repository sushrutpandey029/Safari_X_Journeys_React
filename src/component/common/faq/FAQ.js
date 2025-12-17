import React, { useState, useEffect } from "react";
import { fetchFaqList } from "../../services/commonService";

function FAQ() {
  const [faqData, setFaqData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); // Initially show 5

  const getFaqList = async () => {
    try {
      const response = await fetchFaqList();
      setFaqData(response.data);
    } catch (error) {
      console.log("error in fetching faq list", error?.response);
    }
  };

  useEffect(() => {
    getFaqList();
  }, []);

  const handleReadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, faqData.length));
  };

  const handleReadLess = () => {
    setVisibleCount((prev) => Math.max(prev - 5, 5));
  };

  return (
    <div className="modern-faq-section" id="faq">
      <div className="container">
        <div className="row align-items-center">
  
          {/* LEFT SIDE – 40% */}
          <div className="col-md-5">
            <h2 className="faq-title-left">Frequently <span>Asked</span> <br/> Questions</h2>
  
            <img
              src="/images/faq.png"  
              alt="faq"
              className="faq-gif"
            />
          </div>
  
          {/* RIGHT SIDE – 60% */}
          <div className="col-md-7">
            <div className="modern-faq">
  
              <div className="accordion modern-accordion" id="accordionFlushExample">
                {faqData &&
                  faqData.slice(0, visibleCount).map((item, index) => (
                    <div className="accordion-item modern-item" key={index}>
                      <h2 className="accordion-header" id={`flush-heading-${index}`}>
                        <button
                          className="accordion-button collapsed modern-btn"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#flush-collapse-${index}`}
                          aria-expanded="false"
                          aria-controls={`flush-collapse-${index}`}
                        >
                          {item.question}
                        </button>
                      </h2>
  
                      <div
                        id={`flush-collapse-${index}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`flush-heading-${index}`}
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="accordion-body modern-body">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
  
              {/* Read More / Less Buttons */}
              <div className="d-flex justify-content-end mt-3 gap-3">
                {visibleCount > 5 && (
                  <span className="faq-less" onClick={handleReadLess}>
                    Read Less
                  </span>
                )}
                {visibleCount < faqData?.length && (
                  <span className="faq-more" onClick={handleReadMore}>
                    Read More
                  </span>
                )}
              </div>
  
            </div>
          </div>
  
        </div>
      </div>
    </div>
  );
  
}

export default FAQ;
