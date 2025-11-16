import axios from "axios";

const API_URL = import.meta.env.API_URL || 'http://localhost:8080/';

export const fetchDashboardData = async () => {
    return await axios.get(`${API_URL}api/v1.0/dashboard`, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

