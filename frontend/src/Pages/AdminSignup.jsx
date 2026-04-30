import { useState } from "react";
import axios from "axios";

function AdminSignup() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // submit
  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!form.name || !form.email || !form.password || !form.company) {
      return setError("All fields are required");
    }

    try {
      const res = await axios.post("http://localhost:5000/admin-signup", form);

      setMessage("Admin created successfully - you can now login!");

      // reset form
      setForm({
        name: "",
        email: "",
        password: "",
        company: ""
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card col-md-5 mx-auto shadow p-4">

        <h3 className="text-center mb-3">Admin Signup</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="form-control mb-3"
          placeholder="Name"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="form-control mb-3"
          placeholder="Email"
        />

        <div className="input-group mb-3">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Password"
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          className="form-control mb-3"
          placeholder="Company Name"
        />

        <button
          className="btn btn-dark w-100"
          onClick={handleSubmit}
        >
          Create Admin
        </button>

      </div>
    </div>
  );
}

export default AdminSignup;