import { getApiUrl } from "./apiConfig";
import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
// Use relative path in production (via Vercel proxy) to avoid CORS
// Use relative path in dev (via Vite proxy) or fallback to localhost
const API_URL = getApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchEmployees = async (page = 0, size = 10) => {
  return await axios.get(`${API_URL}api/v1.0/employees/paginated?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
  });
};

export const addEmployee = async (employeeData) => {
  return await axios.post(`${API_URL}api/v1.0/employees`, employeeData, {
    headers: getAuthHeaders(),
  });
};

export const updateEmployee = async (id, employeeData) => {
  return await axios.put(`${API_URL}api/v1.0/employees/${id}`, employeeData, {
    headers: getAuthHeaders(),
  });
};

export const deleteEmployee = async (id) => {
  return await axios.delete(`${API_URL}api/v1.0/employees/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const fetchEmployeeNames = async () => {
  return await axios.get(`${API_URL}api/v1.0/employees/names`, {
    headers: getAuthHeaders(),
  });
};
