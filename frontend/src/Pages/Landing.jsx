import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">

        <h1 className="mb-3">Assest Management System</h1>
        <p className="text-muted">Manage  Assests Efficiently</p>

        <div className="row mt-5">

         
          <div className="col-md-6">
            <div className="card shadow p-4 hover-card">
              <h4>Admin</h4>
              <p>Manage employees, Assests</p>

              <button 
                className="btn btn-dark w-100"
                onClick={() => navigate("/admin-signup")}
              >
                Signup as Admin
              </button>
            </div>
          </div>

          {/* Employee Card */}
          <div className="col-md-6">
            <div className="card shadow p-4 hover-card">
              <h4>Employee</h4>
              <p>Assests</p>

              <button 
                className="btn btn-primary w-100"
                onClick={() => navigate("/employee-login")}
              >
                Login as Employee
              </button>
            </div>
          </div>

        </div>
      </div>

     
      
    </div>
  );
}

export default Landing;