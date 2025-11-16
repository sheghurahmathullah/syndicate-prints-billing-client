import axios from "axios";

const API_URL = import.meta.env.API_URL || 'http://localhost:8080/';

export const addItem = async (item) => {
    return await axios.post(`${API_URL}api/v1.0/admin/items`, item, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const deleteItem = async (itemId) => {
    return await axios.delete(`${API_URL}api/v1.0/admin/items/${itemId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const fetchItems = async () => {
    return await axios.get(`${API_URL}api/v1.0/items`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}