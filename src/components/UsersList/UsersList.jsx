import "./UsersList.css";
import { useState } from "react";
import { deleteUser } from "../../Service/UserService.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const UsersList = ({ users, setUsers, onEdit, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  const editUser = (id) => {
    const user = users.find((u) => u.userId === id);
    if (user && typeof onEdit === "function") {
      onEdit(user);
    } else {
      navigate(`/users/edit/${id}`);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const role = (user.role || "").toLowerCase();
    return name.includes(term) || email.includes(term) || role.includes(term);
  });

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.userId);
      setUsers((prevUsers) => prevUsers.filter((u) => u.userId !== userToDelete.userId));
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete user");
      setShowDeleteModal(false);
    }
  };

  const renderAvatar = (user) => {
    const initials = (user.name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";

    return (
      <div className="user-avatar-initials" title={user.name}>
        {initials}
      </div>
    );
  };

  const renderRoleBadge = (role) => {
    const r = role || "ROLE_USER";
    if (r.includes("ADMIN")) {
      return (
        <span className="data-badge badge-role-admin">
          <i className="bi bi-shield-fill-check me-1"></i> Admin
        </span>
      );
    } else if (r.includes("MANAGER")) {
      return (
        <span className="data-badge badge-role-manager">
          <i className="bi bi-person-gear me-1"></i> Manager
        </span>
      );
    } else {
      return (
        <span className="data-badge badge-role-user">
          <i className="bi bi-person-fill me-1"></i> User
        </span>
      );
    }
  };

  return (
    <div className="users-list-container fade-in">
      <div className="list-header d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <h3 className="list-title mb-0">Users Directory</h3>
          <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 small fw-semibold">
            {users.length} Total
          </span>
        </div>
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control form-control-sm search-input"
            placeholder="Search name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn-search-clear" onClick={() => setSearchTerm("")}>
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading user accounts..." />
      ) : (
        <div className="table-wrapper rounded-3 border bg-white overflow-hidden shadow-sm">
          {filteredUsers.length === 0 ? (
          <div className="empty-state p-5 text-center">
            <i className="bi bi-person-x fs-1 text-muted d-block mb-2"></i>
            <p className="mb-0 text-muted">
              {searchTerm ? "No users match your search query." : "No users found."}
            </p>
          </div>
        ) : (
          <table className="data-table w-100 align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Avatar</th>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th className="text-end" style={{ width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>{renderAvatar(user)}</td>
                  <td>
                    <span className="fw-semibold text-dark">{user.name}</span>
                  </td>
                  <td className="text-muted">{user.email}</td>
                  <td>{renderRoleBadge(user.role)}</td>
                  <td className="text-end">
                    <div className="action-buttons justify-content-end">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => editUser(user.userId)}
                        title="Edit User"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteClick(user)}
                        title="Delete User"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card scale-in">
            <div className="modal-header-danger">
              <div className="modal-icon-badge">
                <i className="bi bi-person-x-fill"></i>
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">Delete User Account</h5>
                <p className="mb-0 text-muted small">Confirm account removal</p>
              </div>
              <button
                className="btn-close-modal ms-auto"
                onClick={() => setShowDeleteModal(false)}
                title="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body-content">
              <p className="modal-message-text mb-3">
                Are you sure you want to delete the user account for{" "}
                <strong className="text-dark">{userToDelete?.name}</strong>?
              </p>

              {userToDelete && (
                <div className="user-delete-preview-card mb-3">
                  <div className="d-flex align-items-center gap-3">
                    {renderAvatar(userToDelete)}
                    <div className="overflow-hidden">
                      <h6 className="mb-0 fw-semibold text-dark text-truncate">{userToDelete.name}</h6>
                      <p className="mb-1 text-muted small text-truncate">{userToDelete.email}</p>
                      <div>{renderRoleBadge(userToDelete.role)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="warning-notice-box">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                <span className="small text-dark font-medium">
                  This action cannot be undone. System access for this user will be revoked immediately.
                </span>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="bi bi-x-circle me-1"></i> No, Cancel
              </button>
              <button
                className="btn-modal-delete"
                onClick={confirmDelete}
              >
                <i className="bi bi-trash3-fill me-1"></i> Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
