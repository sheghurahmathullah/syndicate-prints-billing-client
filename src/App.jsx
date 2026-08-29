import "./App.css";
import Menubar from "./components/Menubar/Menubar.jsx";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import ManageCategory from "./pages/ManageCategory/ManageCategory.jsx";
import ManageUsers from "./pages/ManageUsers/ManageUsers.jsx";
import ManageItems from "./pages/ManageItems/ManageItems.jsx";
import ManageCustomers from "./pages/ManageCustomers/ManageCustomers.jsx";
import CustomerView from "./pages/CustomerView/CustomerView.jsx";
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
import ManageEmployee from "./pages/ManageEmployee/ManageEmployee.jsx";
import EmployeeView from "./pages/EmployeeView/EmployeeView.jsx";
import ManageExpenseItem from "./pages/ManageExpenseItem/ManageExpenseItem.jsx";
import AddDailyExpenses from "./pages/AddDailyExpenses/AddDailyExpenses.jsx";
import AddMonthlyExpenses from "./pages/AddMonthlyExpenses/AddMonthlyExpenses.jsx";
import CreateBill from "./pages/Bills/CreateBill.jsx";
import ViewBills from "./pages/Bills/ViewBills.jsx";
import TodayBills from "./pages/Bills/TodayBills.jsx";
import DailyExpenseReport from "./pages/Reports/DailyExpenseReport.jsx";
import ManagePageAccess from "./pages/ManagePageAccess/ManagePageAccess.jsx";

const LoginRoute = ({ element }) => {
  const { auth } = useContext(AppContext);
  if (auth.token) {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
};

const ProtectedRoute = ({ element, allowedRoles, pageIdentifier }) => {
  const { auth, pageAccessRules } = useContext(AppContext);
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Dynamic Page Access Check
  if (pageIdentifier && pageAccessRules && pageAccessRules.length > 0) {
    const rule = pageAccessRules.find(r => r.page === pageIdentifier);
    if (rule) {
      const roleKey = auth.role === "ROLE_ADMIN" ? "admin" 
                    : auth.role === "ROLE_MANAGER" ? "manager" 
                    : "employee";
      
      // Admin always has access unless explicitly disabled in DB, but as per user "admin can access all the pages"
      if (auth.role === "ROLE_ADMIN" || rule[roleKey]) {
         // allow
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return element;
};

const App = () => {
  const location = useLocation();

  return (
    <div className="app-container">
      {location.pathname !== "/login" && location.pathname !== "/" && (
        <Menubar />
      )}
      <div className="main-content">
        <Toaster />
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={<Dashboard />}
                pageIdentifier="DASHBOARD"
              />
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute
                element={<Explore />}
                pageIdentifier="EXPLORE"
              />
            }
          />
          
          {/* Bills Route (Accessible to all authenticated users) */}
          <Route
            path="/bills/create"
            element={
              <ProtectedRoute
                element={<CreateBill />}
                pageIdentifier="BILLS_CREATE"
              />
            }
          />

          <Route
            path="/bills/edit/:id"
            element={
              <ProtectedRoute
                element={<CreateBill />}
                pageIdentifier="BILLS_EDIT"
              />
            }
          />
          
          <Route
            path="/bills/all"
            element={
              <ProtectedRoute
                element={<ViewBills />}
                pageIdentifier="BILLS_ALL"
              />
            }
          />
          
          <Route
            path="/bills/today"
            element={
              <ProtectedRoute
                element={<TodayBills />}
                pageIdentifier="BILLS_TODAY"
              />
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute
                element={<OrderHistory />}
                pageIdentifier="ORDERS"
              />
            }
          />

          <Route
            path="/credits"
            element={
              <ProtectedRoute
                element={<CreditManagement />}
                pageIdentifier="CREDITS"
              />
            }
          />
          <Route
            path="/credit-management"
            element={
              <ProtectedRoute
                element={<CreditManagement />}
                pageIdentifier="CREDITS"
              />
            }
          />

          {/*Admin only routes*/}
          <Route
            path="/category"
            element={
              <ProtectedRoute
                element={<ManageCategory />}
                pageIdentifier="CATEGORY"
              />
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute
                element={<ManageUsers />}
                pageIdentifier="USERS"
              />
            }
          />
          <Route
            path="/branches"
            element={
              <ProtectedRoute
                element={<ManageBranches />}
                pageIdentifier="BRANCHES"
              />
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute
                element={<ManageCustomers />}
                pageIdentifier="CUSTOMERS"
              />
            }
          />
          <Route
            path="/customer-view"
            element={
              <ProtectedRoute
                element={<CustomerView />}
                pageIdentifier="CUSTOMER_VIEW"
              />
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute
                element={<ManageItems />}
                pageIdentifier="ITEMS"
              />
            }
          />
          <Route
            path="/machine-category"
            element={
              <ProtectedRoute
                element={<ManageMachineCategory />}
                pageIdentifier="MACHINE_CATEGORY"
              />
            }
          />
          <Route
            path="/machine"
            element={
              <ProtectedRoute
                element={<ManageMachine />}
                pageIdentifier="MACHINE"
              />
            }
          />
          <Route
            path="/paper-category"
            element={
              <ProtectedRoute
                element={<ManagePaperCategory />}
                pageIdentifier="PAPER_CATEGORY"
              />
            }
          />
          <Route
            path="/paper-group"
            element={
              <ProtectedRoute
                element={<ManagePaperGroup />}
                pageIdentifier="PAPER_GROUP"
              />
            }
          />
          <Route
            path="/paper"
            element={
              <ProtectedRoute
                element={<ManagePaper />}
                pageIdentifier="PAPER"
              />
            }
          />
          <Route
            path="/particulars"
            element={
              <ProtectedRoute
                element={<ManageParticular />}
                pageIdentifier="PARTICULARS"
              />
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute
                element={<ManageEmployee />}
                pageIdentifier="EMPLOYEES"
              />
            }
          />
          <Route
            path="/employee-view"
            element={
              <ProtectedRoute
                element={<EmployeeView />}
                pageIdentifier="EMPLOYEE_VIEW"
              />
            }
          />
          <Route
            path="/expense-item"
            element={
              <ProtectedRoute
                element={<ManageExpenseItem />}
                pageIdentifier="EXPENSE_ITEM"
              />
            }
          />
          <Route
            path="/daily-expenses"
            element={
              <ProtectedRoute
                element={<AddDailyExpenses />}
                pageIdentifier="DAILY_EXPENSES"
              />
            }
          />
          <Route
            path="/monthly-expense"
            element={
              <ProtectedRoute
                element={<AddMonthlyExpenses />}
                pageIdentifier="MONTHLY_EXPENSE"
              />
            }
          />

          <Route
            path="/reports/daily-expense"
            element={
              <ProtectedRoute
                element={<DailyExpenseReport />}
                pageIdentifier="REPORTS_DAILY_EXPENSE"
              />
            }
          />

          <Route
            path="/manage-page-access"
            element={
              <ProtectedRoute
                element={<ManagePageAccess />}
                pageIdentifier="MANAGE_PAGE_ACCESS"
              />
            }
          />

          <Route
            path="/analytics" 
            element={ 
              <ProtectedRoute 
                element={<Analytics />} 
                pageIdentifier="ANALYTICS"
              />
            }
          />

          <Route
            path="/settings" 
            element={
              <ProtectedRoute
                element={<Settings />}
                pageIdentifier="SETTINGS"
              />
            }
          />

          <Route path="/login" element={<LoginRoute element={<Login />} />} />
          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
