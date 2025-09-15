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
    <div className="Faq" id="faq">
      <div className="container-fluid">
        <div className="main">
          <div className="row justify-content-center">
            <div className="col-sm-6">
              <h2 className="text-start mb-3"> FAQ</h2>

              <div
                className="accordion accordion-flush"
                id="accordionFlushExample"
              >
                {faqData &&
                  faqData.slice(0, visibleCount).map((item, index) => (
                    <div className="accordion-item" key={index}>
                      <h2
                        className="accordion-header"
                        id={`flush-heading-${index}`}
                      >
                        <button
                          className="accordion-button collapsed"
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
                        <div className="accordion-body">{item.answer}</div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-end mt-3 gap-3">
                {visibleCount > 5 && (
                  <span
                    onClick={handleReadLess}
                    style={{
                      color: "#ed3a3aff",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Read Less
                  </span>
                )}
                {visibleCount < faqData?.length && (
                  <span
                    onClick={handleReadMore}
                    style={{
                      color: "#0d6efd",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
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
