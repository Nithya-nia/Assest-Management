import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 



  const handleLogin = async () => {
    
    if (!email || !password) {
      return alert("Please enter email and password");
    }

    try {
      const res = await axios.post("http://localhost:5000/employee-login", {
        email,
        password
      });

    if (res.data && res.data.token) {
  localStorage.setItem("token", res.data.token);

  
  localStorage.setItem("user", JSON.stringify(res.data.user));

  navigate("/employee-page");
}
        

       else {
        alert(res.data.message);
      }

    }catch (err) {
  console.error(err.response || err);
  alert("Error during login!");
}
  };

  return (
    <div className="container mt-5">
      <div className="card col-md-5 mx-auto shadow p-4">

        <h3 className="text-center mb-3">Employee Login</h3>

        <input
        name="email"
        type="email"
          className="form-control mb-3"
          placeholder="Email"
         autoComplete="off"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
  onInput={(e) => setEmail(e.target.value)}
        />

        <input
        name="password"
        placeholder="Password"
        autoComplete="off"
          type="password"
          className="form-control mb-3"
          placeholder="Password"
         
          value={password}
         onChange={(e) => setPassword(e.target.value)}
         onInput={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn btn-success w-100"
          onClick={handleLogin}
        >
          Login
        </button>

        <div className="mt-3 text-center">
          <Link to="/employee-signup">
            Don't have an account? Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}

export default EmployeeLogin;