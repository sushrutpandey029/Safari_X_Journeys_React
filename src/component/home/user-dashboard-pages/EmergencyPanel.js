import React from "react";

function EmergencyPanel() {
  const emergencyContacts = [
    { name: "Safarix", number: "9821373111", icon: "🚓" },
    { name: "Police", number: "100", icon: "🚓" },
    { name: "Ambulance", number: "108", icon: "🚑" },
    { name: "Fire Brigade", number: "101", icon: "🔥" },
    { name: "Women Helpline", number: "1091", icon: "🚨" },
    { name: "Child Helpline", number: "1098", icon: "👶" },
    { name: "Road Accident Helpline", number: "1073", icon: "🛣️" },
    { name: "Mental Health Helpline", number: "1800-599-0019", icon: "🧠" },
    { name: "Cyber Crime Helpline", number: "1930", icon: "💻" },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🚨 Emergency Contacts</h2>

      <div style={styles.grid}>
        {emergencyContacts.map((contact, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.icon}>{contact.icon}</div>
            <h3>{contact.name}</h3>
            <a href={`tel:${contact.number}`} style={styles.callButton}>
              📞 Call {contact.number}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  icon: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  callButton: {
    display: "inline-block",
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#dc3545",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "bold",
  },
};

export default EmergencyPanel;
