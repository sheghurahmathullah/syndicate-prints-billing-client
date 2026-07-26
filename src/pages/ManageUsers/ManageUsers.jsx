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
    setIsFormOpen(false); // Close form after update
    loadUsers(); // Optional, depending on if we just want to update local state or fetch fresh list
  };

  return (
    <div className="users-page text-dark">
      <div className="users-header">
        <div>
          <h2>Manage Users</h2>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary add-user-btn" onClick={onAddClick}>
            <i className="bi bi-person-plus-fill"></i> Add User
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="user-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>
              <i className="bi bi-person-plus-fill"></i>{" "}
              {selectedUser ? "Edit User" : "Add New User"}
            </h3>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
          <UserForm
            setUsers={setUsers}
            selectedUser={selectedUser}
            onUpdateUser={onUpdateUser}
          />
        </div>
      ) : (
        <div className="user-list-section fade-in">
          <div className="user-banner position-relative text-center text-white mb-4 rounded px-4 py-4" style={{ backgroundColor: '#002142' }}>
            <div className="position-absolute top-0 end-0 m-3 px-3 py-2 badge bg-light text-dark shadow-sm fw-bold">
              Total Users: {users.length}
            </div>
            <h3 className="fw-bold mb-2 text-uppercase tracking-wider">User Management</h3>
            <p className="mb-0 text-white-50 small">Comprehensive oversight and administration of all system users</p>
          </div>
          <UsersList users={users} setUsers={setUsers} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
