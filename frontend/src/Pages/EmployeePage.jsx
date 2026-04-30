import { useEffect, useState } from "react";
import axios from "axios";

function EmployeePage() {
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
   const [assignedAssets, setAssignedAssets] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (data?.role !== "employee") {
      window.location.href = "/employee-login";
      return;
    }
    setUser(data);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAssets();
      fetchAssignedAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    const res = await axios.get("http://localhost:6200/assets");
    setAssets(res.data);
  };

  const fetchAssignedAssets = async () => {
    const res = await axios.get(`http://localhost:6200/asset/assigned/${user._id}`);
    setAssignedAssets(res.data);
  };

  const requestAsset = async (id) => {
    alert("Request sent to admin (backend not implemented yet)");
  };

  if (!user) return <h3>Loading...</h3>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR ONLY EMPLOYEE */}
      <div style={styles.sidebar}>
        <div>
          <div style={styles.avatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>{user.department}</p>
        </div>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/employee-login";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h2>Employee Dashboard</h2>

        <h3>Assets</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a) => (
              <tr key={a._id}>
                <td>{a.assetName}</td>
                <td>{a.assetType}</td>
                <td>{a.status}</td>
                <td>
                  {a.status === "available" ? (
                    <button onClick={() => requestAsset(a._id)}>
                      Request
                    </button>
                  ) : (
                    "Assigned"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          <h3 style={{ marginTop: 30 }}>My Assigned Assets</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {assignedAssets.length === 0 ? (
              <tr>
                <td colSpan="3">No assets assigned</td>
              </tr>
            ) : (
              assignedAssets.map((a) => (
                <tr key={a._id}>
                  <td>{a.assetName}</td>
                  <td>{a.assetType}</td>
                  <td>{a.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeePage;

/* STYLES */
const styles = {
  container: { display: "flex", fontFamily: "Arial" },

  sidebar: {
    width: 250,
    background: "#1f3bb3",
    color: "white",
    height: "100vh",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "white",
    color: "#1f3bb3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  main: { flex: 1, padding: 20 },

  logout: {
    background: "white",
    color: "#1f3bb3",
    border: "none",
    padding: 10,
    cursor: "pointer",
  },

  table: {
    width: "100%",
    background: "white",
    borderCollapse: "collapse",
  },
};