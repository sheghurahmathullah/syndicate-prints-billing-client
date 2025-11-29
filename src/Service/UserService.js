import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8080/";
  // Ensure URL ends with a slash
  return url.endsWith('/') ? url : url + '/';
};

const API_URL = getApiUrl();

export const addUser = async (user) => {
  return await axios.post(`${API_URL}api/v1.0/admin/register`, user, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const deleteUser = async (id) => {
  return await axios.delete(`${API_URL}api/v1.0/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const fetchUsers = async () => {
  return await axios.get(`${API_URL}api/v1.0/admin/users`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const updateUser = async (id, user) => {
  return await axios.put(`${API_URL}api/v1.0/admin/users/${id}`, user, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
