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

export const addExpenseItem = async (expenseItem) => {
    return await axios.post(`${API_URL}api/v1.0/admin/expense/add-expense-items`, expenseItem, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const updateExpenseItem = async (expenseItemId, expenseItem) => {
    return await axios.put(`${API_URL}api/v1.0/admin/expense/update/expense-items/${expenseItemId}`, expenseItem, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const deleteExpenseItem = async (expenseItemId) => {
    return await axios.delete(`${API_URL}api/v1.0/admin/expense/delete/${expenseItemId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const fetchExpenseItems = async (page = 0, size = 10, sortBy = "name", type = null, name = null) => {
    const params = { page, size, sortBy };
    if (type) params.type = type;
    if (name) params.name = name;
    
    return await axios.get(`${API_URL}api/v1.0/admin/expense/expense-items-all`, {
        params,
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
}

export const fetchExpenseItemById = async (expenseItemId) => {
    return await axios.get(`${API_URL}api/v1.0/admin/expense/expense-items/${expenseItemId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const fetchDailyReports = async (startDate, endDate, branch) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (branch) params.branch = branch;
    
    return await axios.get(`${API_URL}api/v1.0/admin/expense/daily-reports`, {
        params,
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
}

export const downloadDailyExpensePdf = async (dailyExpenseId) => {
    return await axios.get(`${API_URL}api/v1.0/admin/expense/daily-reports/${dailyExpenseId}/pdf`, {
        responseType: 'blob',
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
}
