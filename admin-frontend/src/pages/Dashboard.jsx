import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

function Dashboard() {
  const token = localStorage.getItem("token");
  let role = "";

  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }

  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    packed: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchOrdersSummary();
  }, []);

  const fetchOrdersSummary = async () => {
    try {
      const res = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = res.data || [];

      const summary = {
        total: orders.length,
        new: 0,
        packed: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders.forEach((o) => {
        if (summary[o.status] !== undefined) {
          summary[o.status]++;
        }
      });

      setCounts(summary);
    } catch (err) {
      console.error("Failed to load dashboard stats");
    }
  };

  const cardStyle = (bg) => ({
    background: bg,
    color: "#000",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "180px",
    flex: 1,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  });

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
      }}
    >
      <h1>Dashboard</h1>

      <p>
        Logged in as: <strong>{role}</strong>
      </p>

      {/* 🔹 SUMMARY CARDS */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "nowwrap",
          marginTop: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={cardStyle("#e5e7eb")}>
          <h3>Total Orders</h3>
          <h2>{counts.total}</h2>
        </div>

        <div style={cardStyle("#fef3c7")}>
          <h3>NEW</h3>
          <h2>{counts.new}</h2>
        </div>

        <div style={cardStyle("#dbeafe")}>
          <h3>Packed</h3>
          <h2>{counts.packed}</h2>
        </div>

        <div style={cardStyle("#fde68a")}>
          <h3>Out for Delivery</h3>
          <h2>{counts.out_for_delivery}</h2>
        </div>

        <div style={cardStyle("#dcfce7")}>
          <h3>Delivered</h3>
          <h2>{counts.delivered}</h2>
        </div>

        <div style={cardStyle("#fee2e2")}>
          <h3>Cancelled</h3>
          <h2>{counts.cancelled}</h2>
        </div>
      </div>

      <p>Welcome to Divasa Fresh Admin Panel.</p>

      <p>
        Use the sidebar to manage products, orders and stock.
      </p>
    </div>
  );
}

export default Dashboard;
