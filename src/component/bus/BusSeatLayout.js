// import React from "react";
// import "./Bubus-modal-overlaySeatLayout.css";

// const BusSeatLayout = ({
//   seatLayoutData,
//   selectedSeats,
//   onSeatSelect,
// }) => {

//   if (!seatLayoutData?.seats) {
//     return <div className="seat-layout-loading">Loading seats...</div>;
//   }

//   const seats = seatLayoutData.seats;

//   // separate decks
//   const lowerDeck = seats.filter(seat => !seat.IsUpper);
//   const upperDeck = seats.filter(seat => seat.IsUpper);

//   return (
//     <div className="bus-seat-container">

//       {/* Driver section */}
//       <div className="driver-section">
//         <div className="driver-label">Driver</div>
//         <div className="steering-icon">🛞</div>
//       </div>

//       {/* LOWER DECK */}
//       <Deck
//         title="Lower Deck"
//         seats={lowerDeck}
//         selectedSeats={selectedSeats}
//         onSeatSelect={onSeatSelect}
//       />

//       {/* UPPER DECK */}
//       {upperDeck.length > 0 && (
//         <Deck
//           title="Upper Deck"
//           seats={upperDeck}
//           selectedSeats={selectedSeats}
//           onSeatSelect={onSeatSelect}
//         />
//       )}

//     </div>
//   );
// };

// const Deck = ({
//   title,
//   seats,
//   selectedSeats,
//   onSeatSelect
// }) => {

//   const maxRow = Math.max(...seats.map(s => Number(s.RowNo)));
//   const maxCol = Math.max(...seats.map(s => Number(s.ColumnNo)));

//   // split seats into rows
//   const rows = [];

//   for (let r = 0; r <= maxRow; r++) {

//     const rowSeats = seats.filter(
//       s => Number(s.RowNo) === r
//     );

//     // split left and right using column midpoint
//     const mid = Math.floor(maxCol / 2);

//     const leftSeats = rowSeats.filter(
//       s => Number(s.ColumnNo) <= mid
//     );

//     const rightSeats = rowSeats.filter(
//       s => Number(s.ColumnNo) > mid
//     );

//     rows.push({
//       leftSeats,
//       rightSeats
//     });

//   }

//   return (

//     <div className="deck-container">

//       <div className="deck-title">
//         {title}
//       </div>

//       <div className="deck-wrapper">

//         {rows.map((row, index) => (

//           <div className="seat-row" key={index}>

//             {/* LEFT SIDE */}
//             <div className="seat-group left">

//               {row.leftSeats.map(seat =>
//                 renderSeat(seat, selectedSeats, onSeatSelect)
//               )}

//             </div>

//             {/* AISLE */}
//             <div className="seat-aisle" />

//             {/* RIGHT SIDE */}
//             <div className="seat-group right">

//               {row.rightSeats.map(seat =>
//                 renderSeat(seat, selectedSeats, onSeatSelect)
//               )}

//             </div>

//           </div>

//         ))}

//       </div>

//     </div>

//   );

// };

// const renderSeat = (
//   seat,
//   selectedSeats,
//   onSeatSelect
// ) => {

//   const isSelected = selectedSeats.some(
//     s => s.SeatIndex === seat.SeatIndex
//   );

//   const isAvailable = seat.SeatStatus;
//   const isLadies = seat.IsLadiesSeat;
//   const isMale = seat.IsMalesSeat;
//   const isSleeper = seat.SeatType === 2;

//   let className = "bus-seat";

//   if (!isAvailable) className += " seat-booked";
//   else if (isSelected) className += " seat-selected";
//   else if (isLadies) className += " seat-ladies";
//   else if (isMale) className += " seat-male";
//   else className += " seat-available";

//   if (isSleeper) className += " seat-sleeper";

//   return (

//     <div
//       key={seat.SeatIndex}
//       className={className}
//       onClick={() =>
//         isAvailable && onSeatSelect(seat)
//       }
//     >

//       <div className="seat-number">
//         {seat.SeatName}
//       </div>

//       <div className="seat-price">
//         ₹{Math.round(seat.Pricing?.finalAmount || 0)}
//       </div>

//     </div>

//   );

// };




// export default BusSeatLayout;

// import React, { useState } from "react"; // useState used in BusSeatLayout for hoveredClose

// // ── inline styles (no external CSS needed) ──────────────────────────────────
// const S = {
//   overlay: {
//     position: "fixed",
//     inset: 0,
//     background: "rgba(0,0,0,0.55)",
//     backdropFilter: "blur(4px)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 1000,
//     fontFamily: "'Segoe UI', system-ui, sans-serif",
//   },
//   modal: {
//     background: "#fff",
//     borderRadius: 16,
//     width: 680,
//     maxWidth: "96vw",
//     maxHeight: "92vh",
//     display: "flex",
//     flexDirection: "column",
//     boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
//     overflow: "hidden",
//   },
//   header: {
//     padding: "16px 20px",
//     borderBottom: "1px solid #f0f0f0",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     background: "#fff",
//   },
//   routeRow: { display: "flex", alignItems: "center", gap: 10 },
//   routeCity: { fontSize: 17, fontWeight: 700, color: "#1a1a2e" },
//   routeArrow: {
//     fontSize: 13, color: "#e74c3c", fontWeight: 700, padding: "0 4px",
//   },
//   routeMeta: { fontSize: 12, color: "#888", marginTop: 3 },
//   closeBtn: {
//     border: "none", background: "none", fontSize: 20,
//     cursor: "pointer", color: "#555", lineHeight: 1, padding: 4,
//   },
//   legend: {
//     display: "flex", gap: 18, padding: "10px 20px",
//     borderBottom: "1px solid #f0f0f0", flexWrap: "wrap", background: "#fafafa",
//   },
//   legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" },
//   legendBox: (bg, border) => ({
//     width: 16, height: 16, borderRadius: 4,
//     background: bg, border: `2px solid ${border}`,
//   }),
//   body: {
//     flex: 1, overflowY: "auto", padding: "20px 24px",
//     display: "flex", gap: 24, justifyContent: "center",
//   },
//   deckPanel: {
//     background: "#f8f9fc",
//     borderRadius: 14,
//     padding: 20,
//     border: "1px solid #e8eaf0",
//     minWidth: 260,
//     flex: 1,
//   },
//   deckTitle: {
//     fontSize: 13, fontWeight: 700, color: "#e74c3c",
//     letterSpacing: 1, textTransform: "uppercase",
//     marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
//   },
//   busFront: {
//     background: "#fff",
//     border: "2px solid #e8eaf0",
//     borderRadius: "50px 50px 8px 8px",
//     padding: "8px 16px",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//     fontSize: 12,
//     color: "#888",
//     fontWeight: 600,
//   },
//   steeringIcon: { fontSize: 22 },
//   seatRow: {
//     display: "flex", alignItems: "center",
//     justifyContent: "center", marginBottom: 8,
//   },
//   seatGroup: { display: "flex", gap: 6 },
//   aisle: { width: 28, flexShrink: 0 },
//   seat: (type, selected, available) => {
//     const base = {
//       width: 44, height: 44,
//       borderRadius: 8,
//       display: "flex", flexDirection: "column",
//       alignItems: "center", justifyContent: "center",
//       fontSize: 10, fontWeight: 600,
//       cursor: available ? "pointer" : "not-allowed",
//       transition: "all 0.15s ease",
//       userSelect: "none",
//       position: "relative",
//     };
//     if (!available) return { ...base, background: "#e9eaec", border: "2px solid #d0d0d0", color: "#aaa" };
//     if (selected) return { ...base, background: "#e74c3c", border: "2px solid #c0392b", color: "#fff", transform: "scale(1.08)", boxShadow: "0 4px 12px rgba(231,76,60,0.4)" };
//     if (type === "ladies") return { ...base, background: "#fff0f5", border: "2px solid #ff69b4", color: "#c2185b" };
//     if (type === "sleeper") return { ...base, background: "#e8f5e9", border: "2px solid #4caf50", color: "#2e7d32", width: 80, borderRadius: 10 };
//     return { ...base, background: "#fff", border: "2px solid #4caf50", color: "#2e7d32" };
//   },
//   sleeperSeat: { width: 80 },
//   seatLabel: { fontSize: 11, fontWeight: 700, lineHeight: 1 },
//   seatPrice: { fontSize: 9, color: "inherit", opacity: 0.8, marginTop: 2 },
//   genderDot: (color) => ({
//     position: "absolute", top: 3, right: 3,
//     width: 6, height: 6, borderRadius: "50%", background: color,
//   }),
//   footer: {
//     padding: "14px 20px",
//     borderTop: "1px solid #f0f0f0",
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     background: "#fff",
//   },
//   selectedInfo: { fontSize: 13, color: "#555" },
//   totalAmount: { fontSize: 22, fontWeight: 800, color: "#1a1a2e" },
//   selectedNames: { fontSize: 12, color: "#e74c3c", marginTop: 2, fontWeight: 600 },
//   cancelBtn: {
//     padding: "10px 24px", border: "2px solid #ddd",
//     background: "#fff", borderRadius: 8, cursor: "pointer",
//     fontSize: 14, fontWeight: 600, color: "#555",
//     transition: "all 0.15s",
//   },
//   proceedBtn: {
//     padding: "10px 28px", border: "none",
//     background: "#e74c3c", color: "#fff",
//     borderRadius: 8, cursor: "pointer",
//     fontSize: 14, fontWeight: 700,
//     boxShadow: "0 4px 14px rgba(231,76,60,0.35)",
//     transition: "all 0.15s",
//   },
//   proceedBtnDisabled: {
//     padding: "10px 28px", border: "none",
//     background: "#f0c1bd", color: "#fff",
//     borderRadius: 8, cursor: "not-allowed",
//     fontSize: 14, fontWeight: 700,
//   },
//   noSeats: {
//     fontSize: 13, color: "#aaa", fontStyle: "italic",
//     padding: "20px 0", textAlign: "center",
//   },
//   rowNumbers: {
//     display: "flex", gap: 6, justifyContent: "center",
//     marginBottom: 6,
//   },
//   rowNumBox: {
//     width: 44, height: 16, display: "flex",
//     alignItems: "center", justifyContent: "center",
//     fontSize: 9, color: "#bbb", fontWeight: 600,
//   },
// };

// // ── Seat Component ────────────────────────────────────────────────────────────
// const Seat = ({ seat, isSelected, onSeatSelect }) => {
//   const available = seat.SeatStatus;
//   const isSleeper = seat.SeatType === 2;
//   const isLadies = seat.IsLadiesSeat;

//   const type = isLadies ? "ladies" : isSleeper ? "sleeper" : "normal";
//   const style = S.seat(type, isSelected, available);

//   const handleClick = () => {
//     if (available) onSeatSelect(seat);
//   };

//   const handleMouseEnter = (e) => {
//     if (available && !isSelected)
//       e.currentTarget.style.transform = "scale(1.05)";
//   };
//   const handleMouseLeave = (e) => {
//     if (available && !isSelected)
//       e.currentTarget.style.transform = "scale(1)";
//   };

//   return (
//     <div
//       style={style}
//       onClick={handleClick}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//       title={`Seat ${seat.SeatName} — ₹${Math.round(seat.Pricing?.finalAmount || 0)}${!available ? " (Booked)" : ""}`}
//     >
//       {isLadies && !isSelected && (
//         <div style={S.genderDot("#ff69b4")} />
//       )}
//       <div style={S.seatLabel}>{seat.SeatName}</div>
//       <div style={S.seatPrice}>₹{Math.round(seat.Pricing?.finalAmount || 0)}</div>
//     </div>
//   );
// };

// // ── Deck Component ────────────────────────────────────────────────────────────
// const Deck = ({ title, seats, selectedSeats, onSeatSelect }) => {
//   if (!seats.length) return null;

//   const maxRow = Math.max(...seats.map((s) => Number(s.RowNo)));
//   const maxCol = Math.max(...seats.map((s) => Number(s.ColumnNo)));
//   const mid = Math.floor(maxCol / 2);

//   const rows = [];
//   for (let r = 0; r <= maxRow; r++) {
//     const rowSeats = seats.filter((s) => Number(s.RowNo) === r);
//     const left = rowSeats
//       .filter((s) => Number(s.ColumnNo) <= mid)
//       .sort((a, b) => Number(a.ColumnNo) - Number(b.ColumnNo));
//     const right = rowSeats
//       .filter((s) => Number(s.ColumnNo) > mid)
//       .sort((a, b) => Number(a.ColumnNo) - Number(b.ColumnNo));
//     if (left.length || right.length) rows.push({ left, right });
//   }

//   const icon = title.toLowerCase().includes("upper") ? "🔝" : "⬇️";

//   return (
//     <div style={S.deckPanel}>
//       {/* Deck title */}
//       <div style={S.deckTitle}>
//         <span>{icon}</span> {title}
//       </div>

//       {/* Bus front */}
//       <div style={S.busFront}>
//         <span>Driver</span>
//         <span style={S.steeringIcon}>🛞</span>
//       </div>

//       {/* Seat rows */}
//       {rows.map((row, idx) => (
//         <div key={idx} style={S.seatRow}>
//           {/* Left group */}
//           <div style={{ ...S.seatGroup, justifyContent: "flex-end", minWidth: 100 }}>
//             {row.left.map((seat) => (
//               <Seat
//                 key={seat.SeatIndex}
//                 seat={seat}
//                 isSelected={selectedSeats.some((s) => s.SeatIndex === seat.SeatIndex)}
//                 onSeatSelect={onSeatSelect}
//               />
//             ))}
//           </div>

//           {/* Aisle */}
//           <div style={S.aisle} />

//           {/* Right group */}
//           <div style={{ ...S.seatGroup, justifyContent: "flex-start", minWidth: 100 }}>
//             {row.right.map((seat) => (
//               <Seat
//                 key={seat.SeatIndex}
//                 seat={seat}
//                 isSelected={selectedSeats.some((s) => s.SeatIndex === seat.SeatIndex)}
//                 onSeatSelect={onSeatSelect}
//               />
//             ))}
//           </div>
//         </div>
//       ))}

//       {/* Seat count info */}
//       <div style={{ marginTop: 12, fontSize: 11, color: "#aaa", textAlign: "center" }}>
//         {seats.filter((s) => s.SeatStatus).length} available ·{" "}
//         {seats.filter((s) => !s.SeatStatus).length} booked
//       </div>
//     </div>
//   );
// };

// // ── Main Modal Component ──────────────────────────────────────────────────────
// const BusSeatLayout = ({
//   seatLayoutData,
//   selectedSeats,
//   onSeatSelect,
//   onClose,
//   onProceed,
//   routeInfo = {},
// }) => {
//   const [hoveredClose, setHoveredClose] = useState(false);

//   if (!seatLayoutData?.seats) {
//     return (
//       <div style={S.overlay}>
//         <div style={S.modal}>
//           <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
//             Loading seats...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const seats = seatLayoutData.seats;
//   const lowerDeck = seats.filter((s) => !s.IsUpper);
//   const upperDeck = seats.filter((s) => s.IsUpper);

//   const totalAmount = selectedSeats.reduce(
//     (sum, s) => sum + (s.Pricing?.finalAmount || 0),
//     0
//   );

//   const from = routeInfo.from || "Bangalore";
//   const to = routeInfo.to || "Hyderabad";
//   const date = routeInfo.date || new Date().toLocaleDateString("en-IN");
//   const time = routeInfo.time || "";

//   return (
//     <div style={S.overlay}>
//       <div style={S.modal}>

//         {/* ── HEADER ── */}
//         <div style={S.header}>
//           <div>
//             <div style={S.routeRow}>
//               <span style={S.routeCity}>{from}</span>
//               <span style={S.routeArrow}>→</span>
//               <span style={S.routeCity}>{to}</span>
//             </div>
//             <div style={S.routeMeta}>
//               {date} {time && `• Departure: ${time}`} · Select your seats
//             </div>
//           </div>
//           <button
//             style={{
//               ...S.closeBtn,
//               color: hoveredClose ? "#e74c3c" : "#555",
//             }}
//             onMouseEnter={() => setHoveredClose(true)}
//             onMouseLeave={() => setHoveredClose(false)}
//             onClick={onClose}
//           >
//             ✕
//           </button>
//         </div>

//         {/* ── LEGEND ── */}
//         <div style={S.legend}>
//           {[
//             { label: "Available", bg: "#fff", border: "#4caf50" },
//             { label: "Selected", bg: "#e74c3c", border: "#c0392b" },
//             { label: "Booked", bg: "#e9eaec", border: "#d0d0d0" },
//             { label: "Ladies Only", bg: "#fff0f5", border: "#ff69b4" },
//             { label: "Sleeper", bg: "#e8f5e9", border: "#4caf50" },
//           ].map(({ label, bg, border }) => (
//             <div key={label} style={S.legendItem}>
//               <div style={S.legendBox(bg, border)} />
//               <span>{label}</span>
//             </div>
//           ))}
//         </div>

//         {/* ── BODY (Decks) ── */}
//         <div style={S.body}>
//           <Deck
//             title="Lower Deck"
//             seats={lowerDeck}
//             selectedSeats={selectedSeats}
//             onSeatSelect={onSeatSelect}
//           />
//           {upperDeck.length > 0 && (
//             <Deck
//               title="Upper Deck"
//               seats={upperDeck}
//               selectedSeats={selectedSeats}
//               onSeatSelect={onSeatSelect}
//             />
//           )}
//         </div>

//         {/* ── FOOTER ── */}
//         <div style={S.footer}>
//           <div>
//             <div style={S.selectedInfo}>
//               {selectedSeats.length === 0
//                 ? "No seats selected"
//                 : `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} selected`}
//             </div>
//             {selectedSeats.length > 0 && (
//               <div style={S.selectedNames}>
//                 {selectedSeats.map((s) => s.SeatName).join(", ")}
//               </div>
//             )}
//             <div style={S.totalAmount}>
//               ₹{Math.round(totalAmount).toLocaleString("en-IN")}
//             </div>
//           </div>
//           <div style={{ display: "flex", gap: 10 }}>
//             <button style={S.cancelBtn} onClick={onClose}>
//               Cancel
//             </button>
//             <button
//               style={selectedSeats.length > 0 ? S.proceedBtn : S.proceedBtnDisabled}
//               onClick={() => selectedSeats.length > 0 && onProceed?.(selectedSeats)}
//             >
//               Proceed →
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default BusSeatLayout;


// 3rd

// import React, { useState, useMemo } from "react";

// // ── Colors ────────────────────────────────────────────────────────────────────
// const C = {
//   green: "#22c55e", greenDark: "#16a34a", greenBg: "#f0fdf4",
//   red: "#ef4444",
//   pink: "#ec4899", pinkBg: "#fdf2f8",
//   blue: "#3b82f6", blueBg: "#eff6ff",
//   grey: "#d1d5db", greyDark: "#9ca3af", greyText: "#6b7280",
//   white: "#ffffff", bg: "#eef2f7", text: "#1e293b", border: "#e2e8f0",
// };

// // ── API Parser ────────────────────────────────────────────────────────────────
// /**
//  * API SeatDetails is a 2D array: outer = rows, inner = seats in that row.
//  * Each seat has: RowNo, ColumnNo, IsUpper, SeatType (1=seater,2=sleeper)
//  *
//  * SKETCH shows per visual row:
//  *   [1 seat LEFT (col 000)] | AISLE | [remaining seats RIGHT (col 001+)]
//  *
//  * We group by RowNo, split each row into left (col 000) + right (col 001+).
//  * Lower = IsUpper:false, Upper = IsUpper:true
//  */
// function parseSeatData(raw) {
//   const details =
//     raw?.SeatLayoutDetails?.SeatLayout?.SeatDetails ||
//     raw?.SeatLayout?.SeatDetails || [];

//   const flat = details.flat().filter(Boolean);
//   if (!flat.length) return { lowerRows: [], upperRows: [] };

//   const buildRows = (seats) => {
//     const map = {};
//     seats.forEach((s) => {
//       const r = String(s.RowNo);
//       if (!map[r]) map[r] = [];
//       map[r].push(s);
//     });
//     return Object.keys(map)
//       .sort((a, b) => parseInt(a) - parseInt(b))
//       .map((r) => {
//         const row = map[r].sort((a, b) => parseInt(a.ColumnNo) - parseInt(b.ColumnNo));
//         return {
//           left: row[0] ?? null,       // col 000 → left (window)
//           right: row.slice(1),          // col 001+ → right side
//         };
//       });
//   };

//   return {
//     lowerRows: buildRows(flat.filter((s) => !s.IsUpper)),
//     upperRows: buildRows(flat.filter((s) => s.IsUpper)),
//   };
// }

// // ── SVGs ──────────────────────────────────────────────────────────────────────
// const SleeperSVG = ({ clr, sold }) => (
//   <svg width="40" height="72" viewBox="0 0 40 72" fill="none">
//     <rect x="1.5" y="1.5" width="37" height="69" rx="7"
//       fill={sold ? "#f3f4f6" : "#fff"} stroke={clr} strokeWidth="2" />
//     <rect x="5" y="5" width="30" height="15" rx="4.5" fill={clr} opacity={sold ? 0.2 : 0.55} />
//     <rect x="5" y="24" width="30" height="30" rx="3" fill={clr} opacity={sold ? 0.07 : 0.12} />
//     <rect x="9" y="59" width="22" height="6" rx="3" fill={clr} opacity={sold ? 0.15 : 0.4} />
//   </svg>
// );

// const SeaterSVG = ({ clr, sold }) => (
//   <svg width="38" height="42" viewBox="0 0 38 42" fill="none">
//     <rect x="3" y="2" width="32" height="11" rx="4" fill={clr} opacity={sold ? 0.2 : 0.85} />
//     <rect x="0" y="12" width="5" height="15" rx="2.5" fill={clr} opacity={sold ? 0.15 : 0.5} />
//     <rect x="33" y="12" width="5" height="15" rx="2.5" fill={clr} opacity={sold ? 0.15 : 0.5} />
//     <rect x="5" y="12" width="28" height="17" rx="3"
//       fill={sold ? "#f3f4f6" : "#fff"} stroke={clr} strokeWidth="1.8" opacity={sold ? 0.4 : 1} />
//     <rect x="5" y="29" width="28" height="9" rx="3" fill={clr} opacity={sold ? 0.15 : 0.42} />
//   </svg>
// );

// // ── Single Seat Cell ──────────────────────────────────────────────────────────
// const SeatCell = ({ seat, isSelected, onSelect }) => {
//   const [hov, setHov] = useState(false);
//   if (!seat) return null;

//   const ok = seat.SeatStatus;
//   const sleeper = seat.SeatType === 2;
//   const ladies = seat.IsLadiesSeat;
//   const male = seat.IsMalesSeat;
//   const price = Math.round(seat.Pricing?.finalAmount ?? seat.SeatFare ?? 0);

//   let clr, border, bg;
//   if (!ok) { clr = C.greyDark; border = C.grey; bg = "#f3f4f6"; }
//   else if (isSelected) { clr = C.red; border = C.red; bg = "#fff1f1"; }
//   else if (ladies) { clr = C.pink; border = C.pink; bg = hov ? C.pinkBg : "#fff"; }
//   else if (male) { clr = C.blue; border = C.blue; bg = hov ? C.blueBg : "#fff"; }
//   else {
//     clr = hov ? C.greenDark : C.green;
//     border = hov ? C.greenDark : C.green;
//     bg = hov ? C.greenBg : "#fff";
//   }

//   const W = sleeper ? 52 : 48;
//   const H = sleeper ? 90 : 60;

//   return (
//     <div
//       onClick={() => ok && onSelect(seat)}
//       onMouseEnter={() => ok && setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       title={`${seat.SeatName} · ₹${price}${!ok ? " (Sold)" : ""}${ladies ? " · Ladies" : ""}${male ? " · Male" : ""}`}
//       style={{
//         width: W, height: H,
//         background: bg, border: `2px solid ${border}`,
//         borderRadius: sleeper ? 11 : 9,
//         display: "flex", flexDirection: "column",
//         alignItems: "center", justifyContent: "center", gap: 2,
//         cursor: ok ? "pointer" : "not-allowed",
//         transition: "all 0.12s",
//         transform: isSelected ? "scale(1.07)" : hov && ok ? "scale(1.04)" : "scale(1)",
//         boxShadow: isSelected ? `0 3px 14px ${C.red}44` : hov && ok ? `0 2px 10px ${clr}33` : "none",
//         position: "relative", flexShrink: 0, userSelect: "none", boxSizing: "border-box",
//       }}
//     >
//       {ok && !isSelected && (ladies || male) && (
//         <div style={{
//           position: "absolute", top: 4, right: 4,
//           width: 5, height: 5, borderRadius: "50%",
//           background: ladies ? C.pink : C.blue,
//         }} />
//       )}
//       {sleeper ? <SleeperSVG clr={clr} sold={!ok} /> : <SeaterSVG clr={clr} sold={!ok} />}
//       <div style={{ fontSize: 9, fontWeight: 700, color: isSelected ? C.red : C.text, lineHeight: 1.1 }}>
//         {seat.SeatName}
//       </div>
//       <div style={{ fontSize: 8, color: C.greyText, lineHeight: 1 }}>
//         {ok ? `₹${price}` : "Sold"}
//       </div>
//     </div>
//   );
// };

// // ── Bus Deck ──────────────────────────────────────────────────────────────────
// /**
//  * Renders EXACTLY like your sketch:
//  *
//  *   ┌───────────────────────────────┐
//  *   │  🛞  Driver  (lower only)     │
//  *   ├───────────────────────────────┤
//  *   │ [SLEEPER] ┊ [SEAT] [SEAT]    │  row 1
//  *   │ [SLEEPER] ┊ [SEAT] [SEAT]    │  row 2
//  *   │ [SLEEPER] ┊ [SEAT] [SEAT]    │  row 3
//  *   │   ...                        │
//  *   └───────────────────────────────┘
//  *
//  * LEFT  = col 000 (1 seat — window side)
//  * AISLE = dashed vertical line
//  * RIGHT = col 001+ (2 seats side by side — rest of bus)
//  */
// const BusDeck = ({ title, rows, selectedSeats, onSelect, accentColor, showDriver }) => {
//   if (!rows.length) return null;

//   const all = rows.flatMap((r) => [r.left, ...r.right].filter(Boolean));
//   const avail = all.filter((s) => s.SeatStatus).length;
//   const booked = all.length - avail;
//   const maxRight = Math.max(...rows.map((r) => r.right.length), 1);

//   // Determine heights
//   const leftIsSleeper = rows.find((r) => r.left)?.left?.SeatType === 2;
//   const rightIsSleeper = rows.flatMap((r) => r.right).some((s) => s.SeatType === 2);
//   const ROW_H = Math.max(leftIsSleeper ? 90 : 60, rightIsSleeper ? 90 : 60);
//   const L_W = leftIsSleeper ? 52 : 48;
//   const R_W = rightIsSleeper ? 52 : 48;
//   const GAP = 7;

//   return (
//     <div style={{
//       background: C.white, borderRadius: 20,
//       border: `2px solid ${C.border}`,
//       overflow: "hidden",
//       boxShadow: "0 6px 30px rgba(0,0,0,0.10)",
//       width: "fit-content", flexShrink: 0,
//     }}>
//       {/* Title */}
//       <div style={{
//         background: accentColor, padding: "10px 18px",
//         display: "flex", alignItems: "center", justifyContent: "space-between",
//       }}>
//         <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
//           {title.includes("Upper") ? "🔝" : "⬇️"} {title}
//         </span>
//         <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
//           {avail} avail · {booked} booked
//         </span>
//       </div>

//       <div style={{ padding: "14px 16px 20px 16px", background: "#f8faff" }}>

//         {/* Driver — only on lower deck, steering on LEFT like sketch */}
//         {showDriver && (
//           <div style={{
//             display: "flex", alignItems: "center", gap: 10,
//             background: C.white, borderRadius: 12, padding: "8px 14px",
//             marginBottom: 14, border: `1.5px solid ${C.border}`,
//           }}>
//             <div style={{
//               width: 34, height: 34, borderRadius: "50%",
//               background: "#f1f5f9", border: "2px solid #cbd5e1",
//               display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
//             }}>🛞</div>
//             <span style={{ fontSize: 12, fontWeight: 700, color: C.greyText }}>Driver</span>
//           </div>
//         )}

//         {/* Seat grid */}
//         <div style={{ display: "flex", alignItems: "flex-start" }}>

//           {/* LEFT — 1 seat (window side, sleeper/seater) */}
//           <div style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0, width: L_W }}>
//             {rows.map((row, i) => (
//               <div key={i} style={{ height: ROW_H, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 {row.left
//                   ? <SeatCell
//                     seat={row.left}
//                     isSelected={selectedSeats.some((s) =>
//                       (s.SeatIndex ?? s.SeatName) === (row.left.SeatIndex ?? row.left.SeatName)
//                     )}
//                     onSelect={onSelect}
//                   />
//                   : <div style={{ width: L_W, height: ROW_H }} />
//                 }
//               </div>
//             ))}
//           </div>

//           {/* AISLE */}
//           <div style={{
//             width: 24, flexShrink: 0, alignSelf: "stretch",
//             display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4,
//             margin: "0 8px",
//           }}>
//             <span style={{
//               fontSize: 7, fontWeight: 800, color: "#94a3b8",
//               letterSpacing: 2, writingMode: "vertical-rl",
//               textTransform: "uppercase", marginBottom: 6,
//             }}>AISLE</span>
//             <div style={{ flex: 1, borderLeft: "2px dashed #d1d5db" }} />
//           </div>

//           {/* RIGHT — 2 seats side by side */}
//           <div style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0 }}>
//             {rows.map((row, i) => (
//               <div key={i} style={{ height: ROW_H, display: "flex", gap: GAP, alignItems: "center" }}>
//                 {row.right.map((seat) => (
//                   <SeatCell
//                     key={seat.SeatIndex ?? seat.SeatName}
//                     seat={seat}
//                     isSelected={selectedSeats.some((s) =>
//                       (s.SeatIndex ?? s.SeatName) === (seat.SeatIndex ?? seat.SeatName)
//                     )}
//                     onSelect={onSelect}
//                   />
//                 ))}
//                 {/* placeholders to keep rows aligned */}
//                 {Array.from({ length: maxRight - row.right.length }).map((_, pi) => (
//                   <div key={pi} style={{ width: R_W, height: ROW_H }} />
//                 ))}
//               </div>
//             ))}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Main Modal ────────────────────────────────────────────────────────────────
// const BusSeatLayout = ({
//   seatLayoutData,
//   selectedSeats = [],
//   onSeatSelect,
//   onClose,
//   onProceed,
//   routeInfo = {},
// }) => {
//   const [closeHov, setCloseHov] = useState(false);

//   const { lowerRows, upperRows } = useMemo(
//     () => parseSeatData(seatLayoutData),
//     [seatLayoutData]
//   );

//   const total = selectedSeats.reduce(
//     (s, seat) => s + (seat.Pricing?.finalAmount ?? seat.SeatFare ?? 0), 0
//   );

//   const { from = "–", to = "–", date = "", time = "" } = routeInfo;

//   if (!seatLayoutData) return (
//     <div style={OL}><div style={ML}><p style={{ padding: 48, textAlign: "center", color: C.greyText }}>Loading…</p></div></div>
//   );

//   return (
//     <div style={OL} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
//       <div style={ML}>

//         {/* Header */}
//         <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", background: C.white }}>
//           <div>
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{from}</span>
//               <span style={{ color: C.red, fontWeight: 700, fontSize: 20 }}>→</span>
//               <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{to}</span>
//             </div>
//             <div style={{ fontSize: 12, color: C.greyText, marginTop: 3 }}>
//               {date}{time ? ` · Dep: ${time}` : ""} · Tap a seat to select
//             </div>
//           </div>
//           <button onClick={onClose} onMouseEnter={() => setCloseHov(true)} onMouseLeave={() => setCloseHov(false)}
//             style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: closeHov ? C.red : C.greyText, padding: 4 }}>✕</button>
//         </div>

//         {/* Legend */}
//         <div style={{ display: "flex", gap: 14, padding: "10px 22px", borderBottom: `1px solid ${C.border}`, background: "#fafafa", flexWrap: "wrap", alignItems: "center" }}>
//           {[
//             { label: "Available", bg: "#fff", b: C.green },
//             { label: "Selected", bg: "#fff1f1", b: C.red },
//             { label: "Booked", bg: "#f3f4f6", b: C.grey },
//             { label: "Ladies Only", bg: C.pinkBg, b: C.pink },
//             { label: "Male Only", bg: C.blueBg, b: C.blue },
//           ].map(({ label, bg, b }) => (
//             <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555" }}>
//               <div style={{ width: 16, height: 16, borderRadius: 4, background: bg, border: `2px solid ${b}`, flexShrink: 0 }} />
//               {label}
//             </div>
//           ))}
//         </div>

//         {/* Body — BOTH DECKS SIDE BY SIDE exactly like sketch */}
//         <div style={{
//           flex: 1, overflowY: "auto", overflowX: "auto",
//           padding: 24, display: "flex", gap: 20,
//           justifyContent: "center", alignItems: "flex-start",
//           background: C.bg,
//         }}>
//           {lowerRows.length > 0 && (
//             <BusDeck title="Lower Deck" rows={lowerRows} selectedSeats={selectedSeats}
//               onSelect={onSeatSelect} accentColor={C.green} showDriver={true} />
//           )}
//           {upperRows.length > 0 && (
//             <BusDeck title="Upper Deck" rows={upperRows} selectedSeats={selectedSeats}
//               onSelect={onSeatSelect} accentColor="#7c3aed" showDriver={false} />
//           )}
//           {!lowerRows.length && !upperRows.length && (
//             <div style={{ color: C.greyText, padding: 60, fontSize: 14 }}>No seat data found.</div>
//           )}
//         </div>

//         {/* Footer */}
//         <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.white }}>
//           <div>
//             <div style={{ fontSize: 12, color: C.greyText }}>
//               {selectedSeats.length === 0 ? "No seats selected" : `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} selected`}
//             </div>
//             {selectedSeats.length > 0 && (
//               <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 2 }}>
//                 {selectedSeats.map((s) => s.SeatName).join(", ")}
//               </div>
//             )}
//             <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>
//               ₹{Math.round(total).toLocaleString("en-IN")}
//             </div>
//           </div>
//           <div style={{ display: "flex", gap: 10 }}>
//             <button onClick={onClose} style={{ padding: "10px 24px", border: `2px solid ${C.border}`, background: C.white, borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#555" }}>
//               Cancel
//             </button>
//             <button
//               onClick={() => selectedSeats.length > 0 && onProceed?.(selectedSeats)}
//               style={{
//                 padding: "10px 28px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#fff",
//                 background: selectedSeats.length > 0 ? C.red : "#fca5a5",
//                 cursor: selectedSeats.length > 0 ? "pointer" : "not-allowed",
//                 boxShadow: selectedSeats.length > 0 ? "0 4px 14px rgba(239,68,68,0.3)" : "none",
//               }}>
//               Proceed →
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// const OL = {
//   position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
//   display: "flex", alignItems: "center", justifyContent: "center",
//   zIndex: 1000, fontFamily: "'Segoe UI', system-ui, sans-serif",
// };
// const ML = {
//   background: C.white, borderRadius: 18,
//   width: 940, maxWidth: "97vw", maxHeight: "93vh",
//   display: "flex", flexDirection: "column",
//   boxShadow: "0 24px 64px rgba(0,0,0,0.22)", overflow: "hidden",
// };

// export default BusSeatLayout;



import React, { useState, useMemo } from "react";

// ── Theme ────────────────────────────────────────────────────────────────────
const T = {
  green: "#10b981",
  greenGlow: "#10b98133",
  red: "#f43f5e",
  redGlow: "#f43f5e33",
  pink: "#ec4899",
  pinkGlow: "#ec489933",
  blue: "#3b82f6",
  blueGlow: "#3b82f633",
  grey: "#475569",
  greyLight: "#cbd5e1",
  greyBg: "#1e293b",
  sold: "#334155",
  soldText: "#64748b",
  bg: "#0f172a",
  card: "#1e293b",
  cardBorder: "#334155",
  upper: "#7c3aed",
  lower: "#0ea5e9",
  text: "#f1f5f9",
  subtext: "#94a3b8",
};

// ── API Parser ───────────────────────────────────────────────────────────────
function parseSeatData(raw) {
  const details =
    raw?.SeatLayoutDetails?.SeatLayout?.SeatDetails ||
    raw?.SeatLayout?.SeatDetails ||
    [];
  const flat = details.flat().filter(Boolean);
  if (!flat.length) return { lowerRows: [], upperRows: [] };

  const buildRows = (seats) => {
    const map = {};
    seats.forEach((s) => {
      const r = String(s.RowNo);
      if (!map[r]) map[r] = [];
      map[r].push(s);
    });
    return Object.keys(map)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((r) => {
        const row = map[r].sort(
          (a, b) => parseInt(a.ColumnNo) - parseInt(b.ColumnNo)
        );
        return { left: row[0] ?? null, right: row.slice(1) };
      });
  };

  return {
    lowerRows: buildRows(flat.filter((s) => !s.IsUpper)),
    upperRows: buildRows(flat.filter((s) => s.IsUpper)),
  };
}

// ── Horizontal Sleeper SVG ───────────────────────────────────────────────────
const HSleeperSVG = ({ clr, sold }) => (
  <svg width="80" height="44" viewBox="0 0 80 44" fill="none">
    <rect x="2" y="2" width="76" height="40" rx="8"
      fill={sold ? "#1e293b" : "#0f172a"} stroke={clr} strokeWidth="2" />
    <rect x="6" y="6" width="20" height="32" rx="5"
      fill={sold ? "#334155" : clr + "33"} stroke={clr} strokeWidth="1.5"
      strokeOpacity={sold ? 0.3 : 0.9} />
    <line x1="32" y1="12" x2="72" y2="12" stroke={clr} strokeWidth="1.5" strokeOpacity={sold ? 0.2 : 0.5} strokeLinecap="round" />
    <line x1="32" y1="22" x2="72" y2="22" stroke={clr} strokeWidth="1.5" strokeOpacity={sold ? 0.2 : 0.5} strokeLinecap="round" />
    <line x1="32" y1="32" x2="72" y2="32" stroke={clr} strokeWidth="1.5" strokeOpacity={sold ? 0.2 : 0.5} strokeLinecap="round" />
  </svg>
);

// ── Horizontal Seater SVG ────────────────────────────────────────────────────
const HSeaterSVG = ({ clr, sold }) => (
  <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
    <rect x="2" y="2" width="48" height="40" rx="7"
      fill={sold ? "#1e293b" : "#0f172a"} stroke={clr} strokeWidth="2" />
    <rect x="4" y="4" width="12" height="36" rx="4"
      fill={sold ? "#334155" : clr + "22"} stroke={clr} strokeWidth="1.5"
      strokeOpacity={sold ? 0.3 : 0.8} />
    <rect x="18" y="18" width="30" height="20" rx="4"
      fill={sold ? "#334155" : clr + "22"} stroke={clr} strokeWidth="1.5"
      strokeOpacity={sold ? 0.3 : 0.8} />
    <rect x="18" y="14" width="30" height="5" rx="2" fill={clr} opacity={sold ? 0.15 : 0.4} />
  </svg>
);

// ── Seat Cell ────────────────────────────────────────────────────────────────
const SeatCell = ({ seat, isSelected, onSelect }) => {
  const [hov, setHov] = useState(false);
  if (!seat) return <div style={{ width: 80, height: 44, flexShrink: 0 }} />;

  const ok = seat.SeatStatus;
  const sleeper = seat.SeatType === 2;
  const ladies = seat.IsLadiesSeat;
  const male = seat.IsMalesSeat;
  const price = Math.round(seat.Pricing?.finalAmount ?? seat.SeatFare ?? 0);

  let clr;
  if (!ok)            clr = T.grey;
  else if (isSelected) clr = T.red;
  else if (ladies)    clr = T.pink;
  else if (male)      clr = T.blue;
  else                clr = T.green;

  const W = sleeper ? 86 : 58;

  return (
    <div
      onClick={() => ok && onSelect(seat)}
      onMouseEnter={() => ok && setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${seat.SeatName} · ₹${price}${!ok ? " (Sold)" : ""}${ladies ? " · Ladies" : ""}${male ? " · Male" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: ok ? "pointer" : "not-allowed",
        transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
        transform: isSelected ? "scale(1.1)" : hov && ok ? "scale(1.05)" : "scale(1)",
        filter: isSelected
          ? `drop-shadow(0 0 8px ${T.red})`
          : hov && ok ? `drop-shadow(0 0 6px ${clr})` : "none",
        flexShrink: 0,
        userSelect: "none",
        width: W,
        position: "relative",
      }}
    >
      {ok && (ladies || male) && (
        <div style={{
          position: "absolute", top: -6, right: -6,
          width: 14, height: 14, borderRadius: "50%",
          background: ladies ? T.pink : T.blue,
          fontSize: 8, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", fontWeight: 800,
          zIndex: 2, boxShadow: `0 0 6px ${clr}`,
        }}>
          {ladies ? "L" : "M"}
        </div>
      )}
      {sleeper ? <HSleeperSVG clr={clr} sold={!ok} /> : <HSeaterSVG clr={clr} sold={!ok} />}
      <div style={{ fontSize: 10, fontWeight: 700, color: ok ? clr : T.soldText, letterSpacing: "0.03em", fontFamily: "'Courier New', monospace" }}>
        {seat.SeatName}
      </div>
      <div style={{ fontSize: 9, color: ok ? T.subtext : T.soldText, fontFamily: "'Courier New', monospace" }}>
        {ok ? `₹${price}` : "Sold"}
      </div>
    </div>
  );
};

// ── Bus Deck ─────────────────────────────────────────────────────────────────
const BusDeck = ({ title, rows, selectedSeats, onSelect, deckColor, isUpper }) => {
  if (!rows.length) return null;

  const all = rows.flatMap((r) => [r.left, ...r.right].filter(Boolean));
  const avail = all.filter((s) => s.SeatStatus).length;
  const booked = all.length - avail;
  const seatKey = (s) => s?.SeatIndex ?? s?.SeatName;

  return (
    <div style={{
      background: T.card, borderRadius: 16,
      border: `1.5px solid ${deckColor}44`, overflow: "hidden",
      boxShadow: `0 0 30px ${deckColor}18, 0 4px 24px rgba(0,0,0,0.4)`,
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${deckColor}22, ${deckColor}08)`,
        borderBottom: `1px solid ${deckColor}33`,
        padding: "14px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: deckColor, boxShadow: `0 0 10px ${deckColor}` }} />
          <span style={{ color: deckColor, fontWeight: 800, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>
            {title}
          </span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ color: T.green, fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>✓ {avail} Available</span>
          <span style={{ color: T.soldText, fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>✕ {booked} Booked</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 20px 20px 16px", overflowX: "auto" }}>
        <div style={{ position: "relative", display: "inline-block", minWidth: "100%" }}>
          {!isUpper && (
            <div style={{
              position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              border: `3px solid ${deckColor}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, background: T.bg, zIndex: 5,
              boxShadow: `0 0 12px ${deckColor}44`,
            }}>🛞</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: isUpper ? 0 : 40 }}>
            {rows.map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flexShrink: 0, position: "relative" }}>
                  {row.left
                    ? <SeatCell seat={row.left} isSelected={selectedSeats.some((s) => seatKey(s) === seatKey(row.left))} onSelect={onSelect} />
                    : <div style={{ width: 86, height: 44 }} />
                  }
                </div>
                <div style={{
                  width: 1, height: 44, flexShrink: 0, margin: "0 4px",
                  background: `repeating-linear-gradient(to bottom, ${deckColor}55 0px, ${deckColor}55 6px, transparent 6px, transparent 12px)`,
                }} />
                {row.right.map((seat) => (
                  <div key={seatKey(seat)} style={{ position: "relative" }}>
                    <SeatCell seat={seat} isSelected={selectedSeats.some((s) => seatKey(s) === seatKey(seat))} onSelect={onSelect} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Modal ───────────────────────────────────────────────────────────────
const BusSeatLayout = ({
  seatLayoutData,
  // ✅ FIX: selectedSeats & onSeatSelect are now OPTIONAL
  // If not passed from parent, component manages its own state internally
  selectedSeats: externalSelectedSeats,
  onSeatSelect: externalOnSeatSelect,
  onClose,
  onProceed,
  routeInfo = {},
}) => {
  // ✅ Internal state — used when parent does NOT pass selectedSeats
  const [internalSelectedSeats, setInternalSelectedSeats] = useState([]);

  // ✅ Use external state if provided, otherwise use internal
  const isControlled = externalSelectedSeats !== undefined;
  const selectedSeats = isControlled ? externalSelectedSeats : internalSelectedSeats;

  // ✅ Toggle seat selection — works both controlled and uncontrolled
  const handleSeatSelect = (seat) => {
    if (isControlled) {
      // Parent controls state — call their handler
      externalOnSeatSelect?.(seat);
    } else {
      // Self-controlled — toggle internally
      setInternalSelectedSeats((prev) => {
        const key = seat.SeatIndex ?? seat.SeatName;
        const exists = prev.some((s) => (s.SeatIndex ?? s.SeatName) === key);
        return exists ? prev.filter((s) => (s.SeatIndex ?? s.SeatName) !== key) : [...prev, seat];
      });
    }
  };

  const { lowerRows, upperRows } = useMemo(
    () => parseSeatData(seatLayoutData),
    [seatLayoutData]
  );

  const total = selectedSeats.reduce(
    (s, seat) => s + (seat.Pricing?.finalAmount ?? seat.SeatFare ?? 0),
    0
  );

  const { from = "–", to = "–", date = "", time = "" } = routeInfo;

  const LEGEND = [
    { label: "Available", clr: T.green },
    { label: "Selected",  clr: T.red },
    { label: "Booked",    clr: T.grey },
    { label: "Ladies",    clr: T.pink },
    { label: "Male Only", clr: T.blue },
  ];

  // ✅ Proceed handler — calls onProceed if given, else logs to console
  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    if (typeof onProceed === "function") {
      onProceed(selectedSeats);
    } else {
      // Fallback — log so you can see it works
      console.log("✅ Proceeding with seats:", selectedSeats);
      alert(`Proceeding with ${selectedSeats.length} seat(s): ${selectedSeats.map((s) => s.SeatName).join(", ")}\nTotal: ₹${Math.round(total).toLocaleString("en-IN")}`);
    }
  };

  return (
    <div style={OL} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={ML}>

        {/* ── TOP BAR */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a2744 100%)",
          borderBottom: "1px solid #334155",
          padding: "18px 28px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Courier New', monospace" }}>{from}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 20, height: 2, background: T.lower, borderRadius: 2 }} />
                <span style={{ fontSize: 16 }}>🚌</span>
                <div style={{ width: 20, height: 2, background: T.lower, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Courier New', monospace" }}>{to}</span>
            </div>
            <div style={{ color: T.subtext, fontSize: 12, fontFamily: "monospace" }}>
              {date}{time ? ` · Dep: ${time}` : ""} · Tap a seat to select
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {LEGEND.map(({ label, clr }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${clr}`, background: clr + "22", boxShadow: `0 0 6px ${clr}55` }} />
                <span style={{ color: T.subtext, fontSize: 11, fontFamily: "monospace" }}>{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#334155", border: "1px solid #475569", borderRadius: 8,
              color: T.subtext, width: 36, height: 36, cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.subtext; e.currentTarget.style.borderColor = "#475569"; }}
          >✕</button>
        </div>

        {/* ── BODY */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 24px",
          background: T.bg, display: "flex", flexDirection: "column", gap: 20,
        }}>
          {lowerRows.length > 0 && (
            <BusDeck title="Lower Deck" rows={lowerRows} selectedSeats={selectedSeats}
              onSelect={handleSeatSelect} deckColor={T.lower} isUpper={false} />
          )}
          {upperRows.length > 0 && (
            <BusDeck title="Upper Deck" rows={upperRows} selectedSeats={selectedSeats}
              onSelect={handleSeatSelect} deckColor={T.upper} isUpper={true} />
          )}
          {!lowerRows.length && !upperRows.length && (
            <div style={{ color: T.subtext, textAlign: "center", padding: 60, fontFamily: "monospace" }}>
              No seat data available.
            </div>
          )}
        </div>

        {/* ── FOOTER */}
        <div style={{
          background: "#1a2744", borderTop: "1px solid #334155",
          padding: "16px 28px", display: "flex",
          alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <div style={{ color: T.subtext, fontSize: 12, fontFamily: "monospace", marginBottom: 2 }}>
              {selectedSeats.length === 0
                ? "No seats selected"
                : `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} selected: ${selectedSeats.map((s) => s.SeatName).join(", ")}`}
            </div>
            <div style={{
              fontSize: 24, fontWeight: 900, fontFamily: "'Courier New', monospace",
              color: selectedSeats.length > 0 ? T.green : T.subtext, transition: "color 0.2s",
            }}>
              ₹{Math.round(total).toLocaleString("en-IN")}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                padding: "12px 24px", border: "1px solid #475569", borderRadius: 10,
                background: "transparent", color: T.subtext, fontSize: 14,
                fontWeight: 600, cursor: "pointer", fontFamily: "monospace",
                letterSpacing: "0.05em", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.red; e.currentTarget.style.color = T.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#475569"; e.currentTarget.style.color = T.subtext; }}
            >CANCEL</button>

            {/* ✅ FIXED Proceed Button */}
            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              style={{
                padding: "12px 32px", border: "none", borderRadius: 10,
                background: selectedSeats.length > 0
                  ? `linear-gradient(135deg, ${T.green}, #059669)`
                  : "#1e293b",
                color: selectedSeats.length > 0 ? "#fff" : T.soldText,
                fontSize: 14, fontWeight: 800,
                cursor: selectedSeats.length > 0 ? "pointer" : "not-allowed",
                letterSpacing: "0.08em", fontFamily: "'Courier New', monospace",
                boxShadow: selectedSeats.length > 0 ? `0 4px 20px ${T.greenGlow}` : "none",
                transition: "all 0.2s", textTransform: "uppercase",
              }}
            >
              Proceed →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OL = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const ML = {
  background: T.card, borderRadius: 20,
  width: 1020, maxWidth: "97vw", maxHeight: "92vh",
  display: "flex", flexDirection: "column",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px #334155",
  overflow: "hidden",
};

export default BusSeatLayout;