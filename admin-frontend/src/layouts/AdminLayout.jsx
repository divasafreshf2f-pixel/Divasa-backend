import Sidebar from "../components/Sidebar";

function AdminLayout({ children }) {
  return (
    <div>
      {/* FIXED SIDEBAR */}
      <Sidebar />

      {/* CONTENT AREA */}
      <div
        style={{
          marginLeft: "220px",        // ✅ SAME AS SIDEBAR WIDTH
          minHeight: "100vh",
          padding: "20px",
          background: "#f3f4f6",
          color: "#000",
          overflowY: "auto",          // ✅ ONLY CONTENT SCROLLS
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
