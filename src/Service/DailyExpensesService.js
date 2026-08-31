import { getApiUrl } from "./apiConfig";
import axios from "axios";

const API_URL = getApiUrl();

export const fetchExpenseItemsByType = async (type) => {
  return await axios.get(`${API_URL}api/v1.0/admin/expense/type/${type}/all`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};

export const saveDailyExpenses = async (dailyExpensesData) => {
  return await axios.post(`${API_URL}api/v1.0/admin/expense/daily-expenses`, dailyExpensesData, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};

export const updateDailyExpenses = async (dailyExpenseId, dailyExpensesData) => {
  return await axios.put(`${API_URL}api/v1.0/admin/expense/daily-expenses/${dailyExpenseId}`, dailyExpensesData, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};

export const saveMonthlyExpenses = async (monthlyExpensesData) => {
  return await axios.post(`${API_URL}api/v1.0/admin/expense/monthly-expenses`, monthlyExpensesData, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};

export const updateMonthlyExpenses = async (monthlyExpenseId, monthlyExpensesData) => {
  return await axios.put(`${API_URL}api/v1.0/admin/expense/monthly-expenses/${monthlyExpenseId}`, monthlyExpensesData, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};

export const fetchLastClosedAmount = async (branch, date) => {
  let url = `${API_URL}api/v1.0/admin/expense/daily-expenses/last-closed?date=${date}`;
  if (branch) {
    url += `&branch=${encodeURIComponent(branch)}`;
  }
  return await axios.get(url, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};
