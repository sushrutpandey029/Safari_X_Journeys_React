import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Flight_FareRule } from "../services/flightService";
import "./Flights.css";

const getRouteLabel = (fareRuleItem) => {
  const rule = fareRuleItem?.rules?.[0];
  if (!rule?.Origin || !rule?.Destination) return "";
  return `${rule.Origin} → ${rule.Destination}`;
};

const FlightDetail = ({ flightContext, showModal, onHide }) => {
  const navigate = useNavigate();

  const {
    TraceId,
    tripType,
    isDomestic,
    resultIndexes,
    pricingBreakdown,
    routes = {},
  } = flightContext || {};

  const [fareRules, setFareRules] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ===============================
     FETCH FARE RULES
  =============================== */
  useEffect(() => {
    if (!showModal || !TraceId) return;

    const fetchFareRules = async () => {
      setLoading(true);
      setError(null);
      setFareRules([]);
      setSelectedIndexes({});
      setActiveTab(0);

      try {
        let indexesToCall = [];

        if (tripType === "round" && isDomestic) {
          indexesToCall = [resultIndexes?.outbound, resultIndexes?.inbound];
        } else {
          indexesToCall = Array.isArray(resultIndexes)
            ? resultIndexes
            : [resultIndexes];
        }

        const responses = [];

        for (const index of indexesToCall) {
          if (!index) continue;

          const res = await Flight_FareRule({
            TraceId,
            ResultIndex: index,
          });

          responses.push({
            ResultIndex: index,
            rules: res?.data?.Response?.FareRules || [],
          });
        }

        setFareRules(responses);
      } catch (err) {
        setError("Failed to fetch fare rules");
      } finally {
        setLoading(false);
      }
    };

    fetchFareRules();
  }, [showModal, TraceId, tripType, isDomestic, resultIndexes]);

  /* ===============================
     SELECTION
  =============================== */
  const handleSelect = (tabIndex, resultIndex) => {
    setSelectedIndexes((prev) => ({
      ...prev,
      [tabIndex]: resultIndex,
    }));
  };

  const canContinue =
    tripType === "round" && isDomestic
      ? selectedIndexes[0] && selectedIndexes[1]
      : selectedIndexes[0];

  /* ===============================
     CONTINUE
  =============================== */
  const handleContinue = () => {
    navigate("/flight-checkout", {
      state: {
        TraceId,
        tripType,
        isDomestic,
        pricingBreakdown,
        passengerCount: flightContext?.passengers,
        resultIndexes:
          tripType === "round" && isDomestic
            ? {
                outbound: selectedIndexes[0],
                inbound: selectedIndexes[1],
              }
            : selectedIndexes[0],
      },
    });

    onHide();
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <Modal
      show={showModal}
      onHide={onHide}
      size="lg"
      centered
      scrollable
      className="flight-detail-modal"
    >
      {/* ================= HEADER ================= */}
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="w-100">
          <div className="modal-main-title">
            Flight Details and Fare Options
          </div>

          <div className="flight-segments-summary">
            <Badge bg="info">{tripType?.toUpperCase()}</Badge>
            {isDomestic && tripType === "round" && (
              <Badge bg="secondary">Domestic Return</Badge>
            )}
          </div>

          <div className="passenger-count-display mt-2">
            <small>Please select any one plan to continue</small>
          </div>
        </Modal.Title>
      </Modal.Header>

      {/* ================= BODY ================= */}
      <Modal.Body className="modal-body-custom">
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Fetching fare rules…</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {/* ===== DEPART / RETURN TABS ===== */}
        {!loading && fareRules.length > 1 && (
          <div className="fare-tabs mb-4 d-flex gap-2">
            {fareRules.map((item, idx) => {
              const routeLabel = getRouteLabel(item);

              return (
                <Button
                  key={idx}
                  variant={activeTab === idx ? "primary" : "outline-primary"}
                  onClick={() => setActiveTab(idx)}
                >
                  {idx === 0
                    ? `DEPART : ${routeLabel}`
                    : `RETURN : ${routeLabel}`}
                </Button>
              );
            })}
          </div>
        )}

        {/* ===== FARE RULE CARDS ===== */}
        {!loading &&
          fareRules[activeTab] &&
          (fareRules[activeTab].rules.length > 0 ? (
            fareRules[activeTab].rules.map((rule, rIdx) => (
              <div
                key={rIdx}
                className={`fare-option-card clickable-fare ${
                  selectedIndexes[activeTab] ===
                  fareRules[activeTab].ResultIndex
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleSelect(activeTab, fareRules[activeTab].ResultIndex)
                }
              >
                <div
                  className="fare-rules-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      rule.FareRuleDetail ||
                      "<p>No detailed fare rule provided.</p>",
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-muted">
              No fare rules available for this segment.
            </div>
          ))}
      </Modal.Body>

      {/* ================= FOOTER ================= */}
      <Modal.Footer className="modal-footer-custom">
        <Button
          className="book-now-main-btn"
          onClick={handleContinue}
          disabled={!canContinue || loading}
        >
          CONTINUE
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlightDetail;
