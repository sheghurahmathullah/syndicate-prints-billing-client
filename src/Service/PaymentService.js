import axios from "axios";

const API_URL = import.meta.env.API_URL || 'http://localhost:8080/';

export const createRazorpayOrder = async (data) => {
    return await axios.post(`${API_URL}api/v1.0/payments/create-order`, data, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const verifyPayment = async (paymentData) => {
    return await axios.post(`${API_URL}api/v1.0/payments/verify`, paymentData, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}