import { useEffect, useState } from "react";
import axios from "axios";

function AdminPage() {
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (data) setUser(data);
  }, []);

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
    fetchRequests();
  }, []);

  // ================= API CALLS =================
  const fetchAssets = async () => {
    const res = await axios.get("http://localhost:6200/assets");
    setAssets(res.data);
  };

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:6200/employees");
    setEmployees(res.data);
  };

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:6200/asset/requests");
    setRequests(res.data);
  };

  // ================= ASSET CRUD =================
  const addAsset = async () => {
    const assetName = prompt("Asset Name");
    const assetType = prompt("Asset Type");
    const serialNumber = prompt("Serial Number");

    await axios.post("http://localhost:6200/asset", {
      assetName,
      assetType,
      serialNumber,
    });

    fetchAssets();
  };

  const deleteAsset = async (id) => {
    await axios.delete(`http://localhost:6200/asset/${id}`);
    fetchAssets();
  };

  const editAsset = async (asset) => {
    const assetName = prompt("Asset Name", asset.assetName);
    const assetType = prompt("Asset Type", asset.assetType);

    await axios.put(`http://localhost:6200/asset/${asset._id}`, {
      assetName,
      assetType,
    });

    fetchAssets();
  };

  // ================= ASSIGN DIRECTLY =================
  const assignAsset = async (assetId, employeeId) => {
    if (!employeeId) return;

    await axios.post("http://localhost:6200/asset/assign", {
      assetId,
      employeeId,
    });

    fetchAssets();
  };

  // ================= REQUEST ACTIONS (FIXED) =================
  const acceptRequest = async (r) => {
    await axios.post("http://localhost:6200/asset/approve", {
      requestId: r._id,
      assetId: r.assetId,
      employeeId: r.employeeId,
    });

    fetchRequests();
    fetchAssets();
  };

  const rejectRequest = async (id) => {
    await axios.post("http://localhost:6200/asset/reject", {
      requestId: id,
    });

    fetchRequests();
  };

  // ================= UI =================
  if (!user) {
    return <div>Loading Admin...</div>;
  }

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div>
          <div style={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>{user.company}</p>
        </div>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/admin-login";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        <h2>Admin Dashboard</h2>

        {/* ADD ASSET */}
        <button onClick={addAsset}>+ Add Asset</button>

        {/* ASSETS */}
        <h3>Assets</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Assign</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a) => (
              <tr key={a._id}>
                <td>{a.assetName}</td>
                <td>{a.assetType}</td>
                <td>{a.status}</td>
                <td>{a.assignedTo || "-"}</td>

                <td>
                  <select
                    onChange={(e) =>
                      assignAsset(a._id, e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <button onClick={() => editAsset(a)}>Edit</button>
                  <button onClick={() => deleteAsset(a._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* REQUESTS */}
        <h3 style={{ marginTop: 30 }}>Asset Requests</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Employee ID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.assetId}</td>
                <td>{r.employeeId}</td>
                <td>{r.status}</td>

                <td>
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => acceptRequest(r)}>
                        Accept
                      </button>
                      <button onClick={() => rejectRequest(r._id)}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default AdminPage;

/* ================= STYLES ================= */
const styles = {
  container: { display: "flex", fontFamily: "Arial" },

  sidebar: {
    width: "250px",
    background: "#1f3bb3",
    color: "white",
    padding: "20px",
    height: "100vh",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    background: "white",
    color: "#1f3bb3",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 28,
    fontWeight: "bold",
  },

  main: { flex: 1, padding: "20px" },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },

  logout: {
    marginTop: "20px",
    padding: "10px",
    background: "white",
    border: "none",
    cursor: "pointer",
  },
};