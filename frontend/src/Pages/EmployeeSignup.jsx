  import { useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";

  function EmployeeSignup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [department, setDepartment] = useState("");

    
    const handleSubmit = async () => {
      try {
        await axios.post("http://localhost:5000/employee-signup", {
          name,
          email,
          password,
          department
        });

        alert("Employee created successfully!");
        navigate("/employee-login");

        
        setName("");
        setEmail("");
        setPassword("");  
        setDepartment("");

      } catch (err) {
        console.error(err);
        alert("Error creating employee!");
      }
    };

    return (
      <div className="container mt-5">
        <div className="card col-md-5 mx-auto shadow p-4">

          <h3 className="text-center mb-3">Employee Signup</h3>

          <input 
            className="form-control mb-3" 
            placeholder="Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input 
            className="form-control mb-3" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            className="form-control mb-3" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input 
            className="form-control mb-3" 
            placeholder="Department" 
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <button 
            className="btn btn-primary w-100"
            onClick={handleSubmit}   
          >
            Create Employee
          </button>

      
        </div>
        
      </div>
    );
  }

  export default EmployeeSignup;