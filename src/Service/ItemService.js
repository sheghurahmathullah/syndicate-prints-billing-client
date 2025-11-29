import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8080/';
  // Ensure URL ends with a slash
  return url.endsWith('/') ? url : url + '/';
};

const API_URL = getApiUrl();

export const addItem = async (item) => {
    return await axios.post(`${API_URL}api/v1.0/admin/items`, item, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const deleteItem = async (itemId) => {
    return await axios.delete(`${API_URL}api/v1.0/admin/items/${itemId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const fetchItems = async () => {
    return await axios.get(`${API_URL}api/v1.0/items`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}