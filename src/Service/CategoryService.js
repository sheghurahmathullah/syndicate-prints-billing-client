import axios from "axios";

const API_URL = import.meta.env.API_URL || 'http://localhost:8080/';

export const addCategory = async (category) => {
    return await axios.post(`${API_URL}api/v1.0/admin/categories`, category, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const deleteCategory = async (categoryId) => {
    return await axios.delete(`${API_URL}api/v1.0/admin/categories/${categoryId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const fetchCategories = async () => {
    return await axios.get(`${API_URL}api/v1.0/categories`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}
