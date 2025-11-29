import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8080/';
  // Ensure URL ends with a slash
  return url.endsWith('/') ? url : url + '/';
};

const API_URL = getApiUrl();

export const createRazorpayOrder = async (data) => {
    return await axios.post(`${API_URL}api/v1.0/payments/create-order`, data, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const verifyPayment = async (paymentData) => {
    return await axios.post(`${API_URL}api/v1.0/payments/verify`, paymentData, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}