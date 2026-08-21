import "./ManageUsers.css";
import UserForm from "../../components/UserForm/UserForm.jsx";
import UsersList from "../../components/UsersList/UsersList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchUsers } from "../../Service/UserService.js";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsers();
      const allUsers = Array.isArray(response?.data) ? response.data : [];
      const onlyRoleUsers = allUsers.filter((u) => (u?.role ?? "") === "ROLE_USER");
      setUsers(onlyRoleUsers);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAddClick = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const onCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const onUpdateUser = (updated) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === updated.userId ? updated : u))
    );
    setSelectedUser(null);
    setIsFormOpen(false);
    loadUsers();
  };

  return (
    <div className="users-page fade-in">
      <div className="manage-header-card mb-3">
        <div className="header-title-box">
          <div className="header-icon-badge">
            <i className="bi bi-person-gear"></i>
          </div>
          <div className="header-text">
            <h4 className="mb-0">Manage Users</h4>
            <p className="text-muted small mb-0 d-none d-sm-block">Manage user credentials, roles, and access</p>
          </div>
        </div>
        {!isFormOpen && (
          <button className="btn-premium-add" onClick={onAddClick}>
            <i className="bi bi-person-plus-fill"></i>
            <span>Add User</span>
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="user-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-person-fill-gear text-primary"></i>{" "}
              {selectedUser ? "Edit User Account" : "Create New User"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm rounded-2" onClick={onCloseForm}>
              <i className="bi bi-x-lg me-1"></i> Close
            </button>
          </div>
          <UserForm
            setUsers={setUsers}
            selectedUser={selectedUser}
            onUpdateUser={onUpdateUser}
            onSuccess={onCloseForm}
            onCancel={onCloseForm}
          />
        </div>
      ) : (
        <div className="user-list-section fade-in">
          <div className="user-management-banner mb-3">
            <div>
              <h5 className="banner-title-text">User Management</h5>
              <p className="banner-subtitle-text">Comprehensive oversight and administration of all system users</p>
            </div>
            <div className="banner-stat-badge">
              <span className="banner-stat-label">Total Users:</span>
              <span className="banner-stat-value">{users.length}</span>
            </div>
          </div>
          <UsersList users={users} setUsers={setUsers} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
