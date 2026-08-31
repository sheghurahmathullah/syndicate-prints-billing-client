import { getApiUrl } from "./apiConfig";
import axios from "axios";

const API_URL = getApiUrl();

export const fetchBranches = async (page = 0, size = 10) => {
  return await axios.get(`${API_URL}api/v1.0/admin/branches`, {
    params: { page, size },
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const fetchAllBranchesList = async () => {
  return await axios.get(`${API_URL}api/v1.0/admin/branches/getAllBranchesList`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const addBranch = async (branchData) => {
  return await axios.post(`${API_URL}api/v1.0/admin/branches`, branchData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const updateBranch = async (id, branchData) => {
  return await axios.put(`${API_URL}api/v1.0/admin/branches/${id}`, branchData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const deleteBranch = async (id) => {
  return await axios.delete(`${API_URL}api/v1.0/admin/branches/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
