import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      return alert("Enter email & password");
    }

    try {
      const res = await axios.post("http://localhost:5000/admin-login", {
        email,
        password
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.user) {
        // ✅ FIX: store user properly
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/admin-page");
      } else {
        alert(res.data.message);
      }

    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Admin Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.btn}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" },
  card: { padding: 30, background: "#fff", borderRadius: 10, boxShadow: "0 0 10px #ccc" },
  input: { width: "100%", padding: 10, margin: "10px 0" },
  btn: { width: "100%", padding: 10, background: "#1f3bb3", color: "white", border: "none" }
};

export default AdminLogin;