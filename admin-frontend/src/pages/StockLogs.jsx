import { useEffect, useState } from "react";
import api from "../services/api";

function StockLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/stock-logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogs(res.data);
      } catch (err) {
        setError("Failed to load stock logs");
      }
    };

    fetchLogs();
  }, [token]);

  return (
    <div>
      <h2>Stock Logs</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {logs.length === 0 ? (
        <p>No stock logs found</p>
      ) : (
        logs.map((log) => (
          <div
            key={log._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>
              <strong>Product:</strong>{" "}
              {log.productId?.name || "N/A"}
            </p>
            <p>
              <strong>Variant:</strong>{" "}
              {log.variantId?.name || "N/A"}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              <span
                style={{
                  color:
                    log.type === "DECREASE" ? "red" : "green",
                }}
              >
                {log.type}
              </span>
            </p>
            <p>
              <strong>Reason:</strong> {log.reason}
            </p>
            <p>
              <strong>Order ID:</strong>{" "}
              {log.orderId?._id || "N/A"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default StockLogs;
