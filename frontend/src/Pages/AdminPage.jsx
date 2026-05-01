import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:6200";

function AdminPage() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [a, e, r] = await Promise.all([
        axios.get(`${API}/assets`),
        axios.get(`${API}/employees`),
        axios.get(`${API}/asset/requests`)
      ]);

      setAssets(a.data || []);
      setEmployees(e.data || []);
      setRequests(r.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  
  const getEmployeeName = (id) => {
    const emp = employees.find(e => String(e._id) === String(id));
    return emp ? emp.name : "-";
  };

  const getAssetName = (id) => {
    const asset = assets.find(a => String(a._id) === String(id));
    return asset ? asset.assetName : "-";
  };


  const approveRequest = async (id) => {
    try {
      await axios.put(`${API}/admin/approve/${id}`);
      alert("Request Approved");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  
  const rejectRequest = async (id) => {
    try {
      await axios.put(`${API}/admin/reject/${id}`);
      alert("Request Rejected");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    }
  };

  
  const addAsset = async () => {
    const assetName = prompt("Asset Name");
    const assetType = prompt("Asset Type");
    const serialNumber = prompt("Serial Number");

    if (!assetName || !assetType || !serialNumber) {
      return alert("All fields required");
    }

    try {
      const res = await axios.post(`${API}/asset`, {
        assetName,
        assetType,
        serialNumber,
      });

      const newAsset = {
        _id: res.data.insertedId || Date.now().toString(),
        assetName,
        assetType,
        serialNumber,
        status: "available",
        assignedTo: null,
      };

      setAssets(prev => [...prev, newAsset]);
    } catch (err) {
      console.error(err);
    }
  };

  
  const assignAsset = async (assetId, employeeId) => {
    if (!employeeId) return;

    await axios.post(`${API}/asset/assign`, {
      assetId,
      employeeId,
    });

    setAssets(prev =>
      prev.map(a =>
        a._id === assetId
          ? { ...a, assignedTo: employeeId, status: "assigned" }
          : a
      )
    );
  };


  const editAsset = async (asset) => {
    const assetName = prompt("Asset Name", asset.assetName);
    const assetType = prompt("Asset Type", asset.assetType);

    if (!assetName || !assetType) return;

    await axios.put(`${API}/asset/${asset._id}`, {
      assetName,
      assetType,
    });

    setAssets(prev =>
      prev.map(a =>
        a._id === asset._id
          ? { ...a, assetName, assetType }
          : a
      )
    );
  };

 
  const deleteAsset = async (id) => {
    if (!window.confirm("Delete this asset?")) return;

    await axios.delete(`${API}/asset/${id}`);
    setAssets(prev => prev.filter(a => a._id !== id));
  };

  return (
    <div className="d-flex">

      {/* SIDEBAR */}
      <div className="bg-dark text-white p-3 vh-100" style={{ width: 240 }}>
        <h4 className="text-center mb-4">Admin Panel</h4>

        <button className="btn btn-primary w-100 mb-2">Dashboard</button>
        <button className="btn btn-success w-100 mb-2">Assets</button>
        <button className="btn btn-warning w-100 text-dark mb-2">Requests</button>

        <hr />

        <button
          className="btn btn-danger w-100"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/admin-login";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-grow-1 p-4 bg-light">

        <h2 className="mb-4">Dashboard</h2>

        {/* STATS */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white text-center">
              <div className="card-body">
                <h5>Total Assets</h5>
                <h3>{assets.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-success text-white text-center">
              <div className="card-body">
                <h5>Employees</h5>
                <h3>{employees.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-warning text-dark text-center">
              <div className="card-body">
                <h5>Requests</h5>
                <h3>{requests.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* ASSETS */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between">
            <span>Assets</span>
            <button className="btn btn-primary" onClick={addAsset}>
              + Add Asset
            </button>
          </div>

          <div className="card-body">
            <table className="table table-striped">
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
                {assets.map(a => (
                  <tr key={a._id}>
                    <td>{a.assetName}</td>
                    <td>{a.assetType}</td>

                    <td>
                      <span className={
                        a.status === "assigned"
                          ? "badge bg-success"
                          : "badge bg-secondary"
                      }>
                        {a.status}
                      </span>
                    </td>

                    <td>
                      {a.assignedTo
                        ? getEmployeeName(a.assignedTo)
                        : "-"}
                    </td>

                    <td>
                      <select
                        className="form-select"
                        onChange={(e) =>
                          assignAsset(a._id, e.target.value)
                        }
                      >
                        <option value="">Assign</option>
                        {employees.map(e => (
                          <option key={e._id} value={e._id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => editAsset(a)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteAsset(a._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* REQUESTS */}
        <div className="card">
          <div className="card-header">Requests</div>

          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Action</th> {/* ✅ ADDED */}
                </tr>
              </thead>

              <tbody>
                {requests.map(r => (
                  <tr key={r._id}>
                    <td>{getAssetName(r.assetId)}</td>
                    <td>{getEmployeeName(r.employeeId)}</td>

                    <td>
                      <span className={
                        r.status === "approved"
                          ? "badge bg-success"
                          : r.status === "rejected"
                          ? "badge bg-danger"
                          : "badge bg-warning"
                      }>
                        {r.status}
                      </span>
                    </td>

                   
                    <td>
                      {r.status === "pending" ? (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => approveRequest(r._id)}
                          >
                            Accept
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => rejectRequest(r._id)}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-muted">Completed</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminPage;