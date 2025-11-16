import "./Menubar.css";
import { assets } from "../../assets/assets.js";
import { Link, Links, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";

const Menubar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData, auth } = useContext(AppContext);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthData(null, null);
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdmin = auth.role === "ROLE_ADMIN";

  return (
    <nav className="navbar navbar-expand-lg px-2">
      <a className="navbar-brand" href="#">
        <img src={assets.logo} alt="Logo" height="50" />
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse p-2" id="navbarNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link
              id={`${isActive ? "active" : ""}`}
              className={`nav-link ${
                isActive("/dashboard") ? "fw-bold isActive" : ""
              }`}
              to="/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              id={`${isActive ? "active" : ""}`}
              className={`nav-link ${isActive("/explore") ? "fw-bold " : ""}`}
              to="/explore"
            >
              Explore
            </Link>
          </li>
          
          
          {isAdmin && (
            <>
            <li className="nav-item">
            <Link
              id={`${isActive ? "active" : ""}`}
              className={`nav-link ${isActive("/analytics") ? "fw-bold " : ""}`}
              to="/analytics"
            >
              Analytics
            </Link>
          </li>
              <li className="nav-item">
                <Link
                  id={`${isActive ? "active" : ""}`}
                  className={`nav-link ${isActive("/items") ? "fw-bold " : ""}`}
                  to="/items"
                >
                  Manage Items
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  id={`${isActive ? "active" : ""}`}
                  className={`nav-link ${
                    isActive("/category") ? "fw-bold " : ""
                  }`}
                  to="/category"
                >
                  Manage Categories
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  id={`${isActive ? "active" : ""}`}
                  className={`nav-link ${isActive("/users") ? "fw-bold " : ""}`}
                  to="/users"
                >
                  Manage Users
                </Link>
              </li>
            </>
          )}

          <li className="nav-item">
            <Link
              id={`${isActive ? "active" : ""}`}
              className={`nav-link ${isActive("/orders") ? "fw-bold " : ""}`}
              to="/orders"
            >
              Order History
            </Link>
          </li>
        </ul>
        {/*Add the dropdown for userprofile*/}
        <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
          <li className="nav-item dropdown">
            <a
              href="#"
              className="nav-link dropdown-toggle"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img src={assets.profile} alt="" height={32} width={32} />
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="navbarDropdown"
            >

              <li>
                
                
                { isAdmin && ( 
                  <> 
                <Link to="/settings" className="dropdown-item">
                  <i className="bi bi-gar"></i> Settings
                </Link>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                </>
                )}
              
                
                <a href="#!" className="dropdown-item" onClick={logout}>
                  <i className="bi bi-box-arrow-right"></i> Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Menubar;
