import axios from "axios";


// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
// Use relative path in production (via Vercel proxy) to avoid CORS
// Use relative path in dev (via Vite proxy) or fallback to localhost
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is "/" or empty, use relative path (for Vercel/Vite proxy)
  if (!url || url === "/") {
    return "/";
  }
  // Otherwise use the provided URL (for local dev with direct backend)
  return url.endsWith('/') ? url : url + '/';
};

const API_URL = getApiUrl();

export const fetchCustomers = async () => {
  return await axios.get(`${API_URL}api/v1.0/customers`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const fetchPaginatedCustomers = async (page = 0, size = 10) => {
  return await axios.get(`${API_URL}api/v1.0/customers/paginated?page=${page}&size=${size}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const addCustomer = async (customer) => {
  return await axios.post(`${API_URL}api/v1.0/customers`, customer, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const updateCustomer = async (customerId, customer) => {
  return await axios.put(`${API_URL}api/v1.0/customers/${customerId}`, customer, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const deleteCustomer = async (customerId) => {
  return await axios.delete(`${API_URL}api/v1.0/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};


