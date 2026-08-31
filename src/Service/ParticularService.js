import { getApiUrl } from "./apiConfig";
import axios from "axios";

const API_URL = getApiUrl();

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchParticulars = (page = 0, size = 10) =>
  axios.get(`${API_URL}api/v1.0/admin/getParticulars`, {
    headers: getAuthHeaders(),
    params: { page, size },
  });

export const fetchAllParticularsList = () =>
  axios.get(`${API_URL}api/v1.0/admin/getAllParticularsList`, {
    headers: getAuthHeaders(),
  });

export const getParticularById = (particularId) =>
  axios.get(`${API_URL}api/v1.0/admin/getParticular/${particularId}`, {
    headers: getAuthHeaders(),
  });

export const addParticular = (data) =>
  axios.post(`${API_URL}api/v1.0/admin/addParticular`, data, {
    headers: getAuthHeaders(),
  });

export const updateParticular = (particularId, data) =>
  axios.put(`${API_URL}api/v1.0/admin/updateParticular/${particularId}`, data, {
    headers: getAuthHeaders(),
  });

export const updateParticularStatus = (particularId, isActive) =>
  axios.patch(
    `${API_URL}api/v1.0/admin/updateParticularStatus/${particularId}`,
    null,
    {
      headers: getAuthHeaders(),
      params: { isActive },
    }
  );

export const deleteParticular = (particularId) =>
  axios.delete(`${API_URL}api/v1.0/admin/deleteParticular/${particularId}`, {
    headers: getAuthHeaders(),
  });

export const getParticularDetailsById = (particularId) =>
  axios.get(`${API_URL}api/v1.0/admin/getParticularDetails/${particularId}`, {
    headers: getAuthHeaders(),
  });

export const getAllParticularsForBill = () =>
  axios.get(`${API_URL}api/v1.0/admin/getAllParticularsForBill`, {
    headers: getAuthHeaders(),
  });
