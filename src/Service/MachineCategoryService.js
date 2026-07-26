import axios from "axios";

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url || url === "/") {
    return "/";
  }
  return url.endsWith('/') ? url : url + '/';
};

const API_URL = getApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMachineCategories = async (page = 0, size = 10) => {
  return await axios.get(`${API_URL}api/v1.0/admin/getMachineCategories`, {
    headers: getAuthHeaders(),
    params: { page, size },
  });
};

export const fetchAllMachineCategories = async () => {
  return await axios.get(`${API_URL}api/v1.0/admin/getAllMachineCategoriesList`, {
    headers: getAuthHeaders(),
  });
};

export const addMachineCategory = async (categoryData) => {
  return await axios.post(`${API_URL}api/v1.0/admin/addMachineCategory`, categoryData, {
    headers: getAuthHeaders(),
  });
};

export const updateMachineCategory = async (categoryId, categoryData) => {
  return await axios.put(`${API_URL}api/v1.0/admin/updateMachineCategory/${categoryId}`, categoryData, {
    headers: getAuthHeaders(),
  });
};

export const deleteMachineCategory = async (categoryId) => {
  return await axios.delete(`${API_URL}api/v1.0/admin/deleteMachineCategory/${categoryId}`, {
    headers: getAuthHeaders(),
  });
};
