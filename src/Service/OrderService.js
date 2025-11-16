import axios from "axios";

const API_URL = import.meta.env.API_URL || 'http://localhost:8080/';

export const latestOrders = async () => {
    return await axios.get(`${API_URL}api/v1.0/orders/latest`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const createOrder = async (order) => {
    return await axios.post(`${API_URL}api/v1.0/orders`, order, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const deleteOrder = async (id) => {
    return await axios.delete(`${API_URL}api/v1.0/orders/${id}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}