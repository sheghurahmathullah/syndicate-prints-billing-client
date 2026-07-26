import "./UsersList.css";
import { useState } from "react";
import { deleteUser } from "../../Service/UserService.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UsersList = ({ users, setUsers, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const editUser = (id) => {
    const user = users.find((u) => u.userId === id);
    console.log("editing user", user);
    if (user && typeof onEdit === "function") {
      onEdit(user);
    } else {
      navigate(`/users/edit/${id}`);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteByUserId = async (id) => {
    try {
      await deleteUser(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== id));
      toast.success("User deleted");
    } catch (e) {
      console.error(e);
      toast.error("Unable to deleting user");
    }
  };

  return (
    <div className="users-list-container">
      <div className="search-box">
        <div className="input-group">
          <input
            type="text"
            name="keyword"
            id="keyword"
            placeholder="Search users by name..."
            className="form-control search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <span className="search-icon">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>
      <div className="row g-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.userId} className="col-12">
              <div className="user-card row-layout-card">
                <div className="d-flex align-items-center justify-content-between w-100 px-2 py-1">
                  <div className="user-info-name">
                    <h5 className="mb-0 fw-bold">{user.name}</h5>
                  </div>
                  <div className="user-info-email">
                    <p className="mb-0 text-muted">{user.email}</p>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => editUser(user.userId)}
                      title="Edit User"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => deleteByUserId(user.userId)}
                      title="Delete User"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="empty-state">
              <i className="bi bi-person-x"></i>
              <p>No users found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
