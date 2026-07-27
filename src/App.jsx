import "./App.css";
import Menubar from "./components/Menubar/Menubar.jsx";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import ManageCategory from "./pages/ManageCategory/ManageCategory.jsx";
import ManageUsers from "./pages/ManageUsers/ManageUsers.jsx";
import ManageItems from "./pages/ManageItems/ManageItems.jsx";
import ManageCustomers from "./pages/ManageCustomers/ManageCustomers.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login/Login.jsx";
import OrderHistory from "./pages/OrderHistory/OrderHistory.jsx";
import Analytics from "./pages/Analytics/Analytics.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import CreditManagement from "./pages/CreditManagement/CreditManagement.jsx";
import { useContext } from "react";
import { AppContext } from "./context/AppContext.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";
import ManageBranches from "./pages/ManageBranches/ManageBranches.jsx";
import ManageMachineCategory from "./pages/ManageMachineCategory/ManageMachineCategory.jsx";
import ManageMachine from "./pages/ManageMachine/ManageMachine.jsx";
import ManagePaperCategory from "./pages/ManagePaperCategory/ManagePaperCategory.jsx";
import ManagePaperGroup from "./pages/ManagePaperGroup/ManagePaperGroup.jsx";
import ManagePaper from "./pages/ManagePaper/ManagePaper.jsx";
import ManageParticular from "./pages/ManageParticular/ManageParticular.jsx";
import ManageExpenseItem from "./pages/ManageExpenseItem/ManageExpenseItem.jsx";



const App = () => {
  const location = useLocation();
  const { auth } = useContext(AppContext);

  const LoginRoute = ({ element }) => {
    if (auth.token) {
      return <Navigate to="/dashboard" replace />;
    }
    return element;
  };

  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!auth.token) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(auth.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return element;
  };

  return (
    <div className="app-container">
      {location.pathname !== "/login" && location.pathname !== "/" && (
        <Menubar />
      )}
      <div className="main-content">
        <Toaster />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          
          <Route path="/orders" element={<OrderHistory />} />

          <Route
            path="/credits"
            element={
              <ProtectedRoute
                element={<CreditManagement />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />

          {/*Admin only routes*/}
          <Route
            path="/category"
            element={
              <ProtectedRoute
                element={<ManageCategory />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute
                element={<ManageUsers />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/branches"
            element={
              <ProtectedRoute
                element={<ManageBranches />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute
                element={<ManageCustomers />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute
                element={<ManageItems />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/machine-category"
            element={
              <ProtectedRoute
                element={<ManageMachineCategory />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/machine"
            element={
              <ProtectedRoute
                element={<ManageMachine />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/paper-category"
            element={
              <ProtectedRoute
                element={<ManagePaperCategory />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/paper-group"
            element={
              <ProtectedRoute
                element={<ManagePaperGroup />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/paper"
            element={
              <ProtectedRoute
                element={<ManagePaper />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/particulars"
            element={
              <ProtectedRoute
                element={<ManageParticular />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />
          <Route
            path="/expense-item"
            element={
              <ProtectedRoute
                element={<ManageExpenseItem />}
                allowedRoles={["ROLE_ADMIN"]}
              />
            }
          />

          <Route path="/analytics" 
            element={ 
            <ProtectedRoute 
              element={ <Analytics />} 
              allowedRoles={["ROLE_ADMIN"]}
              />  }  />

          <Route path="/settings" 
          element={
            <ProtectedRoute
            element={ <Settings /> }
            allowedRoles={["ROLE_ADMIN"]}
          /> } />

          <Route path="/login" element={<LoginRoute element={<Login />} />} />
          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
