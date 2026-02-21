import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const previousOrderIds = useRef(new Set());
  const audioRef = useRef(null);

  const token = localStorage.getItem("token");
  let role = "";

  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }

  useEffect(() => {
    audioRef.current = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
  }, []);

  const toggleSound = () => {
    if (!soundEnabled) {
      audioRef.current?.play().catch(() => {});
    }
    setSoundEnabled((prev) => !prev);
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newOrders = res.data || [];

      if (soundEnabled && previousOrderIds.current.size > 0) {
        const newFound = newOrders.some(
          (o) => !previousOrderIds.current.has(o._id)
        );

        if (newFound) {
          audioRef.current?.play().catch(() => {});
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      }

      previousOrderIds.current = new Set(newOrders.map((o) => o._id));
      setOrders(newOrders);
    } catch {
      setError("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const getNextStatuses = (status) => {
    const map = {
      new: ["packed"],
      packed: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return map[status] || [];
  };

 const updateStatus = async (orderId, status) => {
  try {
    await api.put(
      `/orders/${orderId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchOrders();
  } catch {
    alert("Failed to update order status");
  }
};



  const printPackingSlip = (order) => {
  const slipData = {
    orderId: order._id,
    date: order.createdAt,
    customerName: order.customerName,
    phone: order.customerPhone,
    address: order.customerAddress,
    items: order.items.map((i) => ({
      productName: i.productName,

      // ✅ THIS IS THE MISSING PIECE
      unit: i.unit || i.variantLabel || i.variantName || "",

      quantity: i.quantity,
      price: Number(i.price) || 0,
    })),
  };

  localStorage.setItem("packingSlip", JSON.stringify(slipData));
  window.open("/packing-slip", "_blank");
};



  const formatDateTime = (date) => new Date(date).toLocaleString();

  const statusColor = (status) => {
    const map = {
      new: "#facc15",
      packed: "#60a5fa",
      out_for_delivery: "#fb923c",
      delivered: "#22c55e",
      cancelled: "#ef4444",
    };
    return map[status] || "#ccc";
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div>
      <h2>Orders</h2>

      {/* 🔔 SOUND TOGGLE */}
      <button
        onClick={toggleSound}
        style={{
          marginBottom: 15,
          padding: "8px 12px",
          background: soundEnabled ? "#b91c1c" : "#000",
          color: "#fff",
          borderRadius: 4,
        }}
      >
        {soundEnabled ? "🔕 Disable Order Sound" : "🔔 Enable Order Sound"}
      </button>

      {/* STATUS FILTER */}
      <div style={{ marginBottom: 20 }}>
        {["all", "new", "packed", "out_for_delivery", "delivered", "cancelled"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                marginRight: 8,
                padding: "6px 10px",
                background: statusFilter === s ? "#000" : "#eee",
                color: statusFilter === s ? "#fff" : "#000",
                borderRadius: 4,
              }}
            >
              {s === "all" ? "All" : s.replace(/_/g, " ").toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* TOAST */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#16a34a",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 6,
            zIndex: 1000,
          }}
        >
          🆕 New order received
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table width="100%" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th align="left">Order ID</th>
            <th align="left">Date</th>
            <th align="left">Customer</th>
            <th align="left">Phone</th>
            <th align="left">Items</th>
            <th align="left">Status</th>
            <th align="right">Total</th>
            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((order) => (
            <>
              <tr key={order._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{order._id.slice(-6)}</td>
                <td>{formatDateTime(order.createdAt)}</td>
                <td>{order.customerName}</td>
                <td>{order.customerPhone}</td>
                <td>{order.items.length} items</td>
                <td>
                  <span
                    style={{
                      background: statusColor(order.status),
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: "bold",
                    }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td align="right">₹{order.totalAmount}</td>
                <td align="center">
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === order._id ? null : order._id
                      )
                    }
                  >
                    {expandedId === order._id ? "Hide" : "View"}
                  </button>
                </td>
              </tr>

              {expandedId === order._id && (
                <tr>
                  <td colSpan="8" style={{ background: "#fafafa", padding: 15 }}>
                   
                   <p>
  <strong>Address:</strong>{" "}
  {typeof order.customerAddress === "string"
    ? order.customerAddress
    : `${order.customerAddress?.flatNo || ""}, 
       ${order.customerAddress?.street || ""}, 
       ${order.customerAddress?.area || ""} 
       (${order.customerAddress?.addressType || ""})`}
</p>


                    <h4>Items</h4>
                    <ul style={{ marginLeft: 20 }}>
  {order.items.map((i, idx) => (
    <li key={idx} style={{ marginBottom: 12 }}>
      <strong>{i.productName}</strong>
      <br />

      {/* ✅ Variant name + unit */}
      {i.variantLabel && (
        <span style={{ color: "#555" }}>
          {i.variantLabel}
          {i.unit ? ` (${i.unit})` : ""}
        </span>
      )}
      <br />

      {/* ✅ Price calculation */}
      ₹{i.price} × {i.quantity} ={" "}
      <strong>₹{i.subtotal}</strong>
    </li>
  ))}
</ul>

{/* 🔻 ORDER SUMMARY FOOTER */}
<div
  style={{
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid #ddd",
    maxWidth: 400,
  }}
>
  <p>
    <strong>Items count:</strong>{" "}
    {order.items.reduce((sum, i) => sum + i.quantity, 0)}
  </p>

  <p>
  <strong>Items subtotal:</strong>{" "}
  ₹
  {order.items.reduce(
    (sum, i) => sum + (i.subtotal || i.price * i.quantity),
    0
  )}
</p>

<p>
  <strong>Handling charge:</strong> ₹0
</p>

<p>
  <strong>Delivery charge:</strong> ₹0
</p>


  <hr />

  <p style={{ fontSize: 16 }}>
    <strong>Grand Total:</strong>{" "}
    <span style={{ fontWeight: "bold" }}>
      ₹{order.totalAmount}
    </span>
  </p>
</div>


                    <div style={{ marginTop: 10 }}>
                      {getNextStatuses(order.status).map((next) => {
                        if (next === "cancelled" && role !== "admin") return null;
                        return (
                          <button
                            key={next}
                            onClick={() => updateStatus(order._id, next)}
                            style={{ marginRight: 10 }}
                          >
                            Mark as {next}
                          </button>
                        );
                      })}
                    </div>

<div style={{ marginTop: 12 }}>
  <button
    onClick={() => printPackingSlip(order)}
    style={{
      background: "#000",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: 4,
    }}
  >
    🖨 Print Packing Slip
  </button>
</div>


                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;
