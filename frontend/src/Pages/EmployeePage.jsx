import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:6200";

function EmployeePage() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");

  
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      try {
        setUser(JSON.parse(data));
      } catch (err) {
        console.error("Invalid user in localStorage");
      }
    }
  }, []);

 
  const fetchData = async (uid) => {
    if (!uid) return;

    try {
      const [req, ass, all] = await Promise.all([
        axios.get(`${API}/asset/requests/${uid}`),
        axios.get(`${API}/employee/assets/${uid}`),
        axios.get(`${API}/assets`)
      ]);

      setRequests(req.data || []);
      setAssets(ass.data || []);
      setAllAssets(all.data || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };

 
  useEffect(() => {
    if (!user?._id) return;

    fetchData(user._id); 

    const interval = setInterval(() => {
      fetchData(user._id);
    }, 7000); // safe refresh

    return () => clearInterval(interval);
  }, [user?._id]);

  
  const getAssetName = (id) => {
    const asset = allAssets.find(a => String(a._id) === String(id));
    return asset ? asset.assetName : "Unknown Asset";
  };

  
  const alreadyRequested = (assetId) => {
    return requests.some(r => String(r.assetId) === String(assetId));
  };

  
  const requestAsset = async () => {
    if (!selectedAsset || !user?._id) return;

    if (alreadyRequested(selectedAsset)) {
      alert("Already requested");
      return;
    }

    try {
      await axios.post(`${API}/asset/request`, {
        assetId: selectedAsset,
        employeeId: user._id,
      });

      setSelectedAsset("");
      fetchData(user._id);
    } catch (err) {
      console.error("Request error:", err.message);
    }
  };

  
  const getStatusClass = (status) => {
    if (status === "approved") return "badge bg-success";
    if (status === "rejected") return "badge bg-danger";
    return "badge bg-warning";
  };

  
  if (!user?._id) return <h3>Loading user...</h3>;

  return (
    <div className="d-flex">

      {/* SIDEBAR */}
      <div className="bg-success text-white p-3 vh-100" style={{ width: 240 }}>
        <h4 className="text-center mb-4">Employee</h4>

        <button className="btn btn-light w-100 mb-2">Dashboard</button>
        <button className="btn btn-warning w-100 mb-2">Requests</button>
        <button className="btn btn-info w-100 mb-2">Assets</button>

        <hr />

        <button
          className="btn btn-danger w-100"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/employee-login";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-grow-1 p-4 bg-light">

        <h2>Welcome, {user.name}</h2>

        {/* REQUEST SECTION */}
        <div className="card mb-4">
          <div className="card-header">Request Asset</div>

          <div className="card-body">
            <select
              className="form-select"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
            >
              <option value="">Select Asset</option>

              {allAssets
                .filter(a => a.status === "available")
                .map(a => (
                  <option key={a._id} value={a._id}>
                    {a.assetName}
                  </option>
                ))}
            </select>

            <button className="btn btn-primary mt-2" onClick={requestAsset}>
              Send Request
            </button>
          </div>
        </div>

        {/* REQUESTS */}
        <div className="card mb-4">
          <div className="card-header">My Requests</div>

          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {requests.length > 0 ? (
                  requests.map(r => (
                    <tr key={r._id}>
                      <td>{getAssetName(r.assetId)}</td>
                      <td>
                        <span className={getStatusClass(r.status)}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No requests yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ASSIGNED ASSETS */}
        <div className="card">
          <div className="card-header">Assigned Assets</div>

          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>
                {assets.length > 0 ? (
                  assets.map(a => (
                    <tr key={a._id}>
                      <td>{a.assetName}</td>
                      <td>{a.assetType}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No assets assigned
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmployeePage;