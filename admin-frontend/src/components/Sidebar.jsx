import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Sidebar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let role = "";

  try {
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.role;
    }
  } catch (err) {
    localStorage.removeItem("token");
    navigate("/");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        position: "fixed",           // ✅ FIXED sidebar
        top: 0,
        left: 0,
        background: "#111827",
        color: "#ffffff",
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ marginBottom: "30px" }}>Divasa Admin</h3>

      <Link style={linkStyle} to="/dashboard">Dashboard</Link>
      <Link style={linkStyle} to="/products">Products</Link>
      <Link style={linkStyle} to="/orders">Orders</Link>

      {role === "admin" && (
        <Link style={linkStyle} to="/stock-logs">Stock Logs</Link>
      )}

      {/* PUSH LOGOUT TO BOTTOM */}
      <div style={{ marginTop: "auto" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            background: "#ef4444",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const linkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "15px",
  display: "block",
  marginBottom: "16px",
};

export default Sidebar;
