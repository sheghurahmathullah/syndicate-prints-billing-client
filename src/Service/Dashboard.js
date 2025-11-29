import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8080/';
  // Ensure URL ends with a slash
  return url.endsWith('/') ? url : url + '/';
};

const API_URL = getApiUrl();

export const fetchDashboardData = async () => {
    return await axios.get(`${API_URL}api/v1.0/dashboard`, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

