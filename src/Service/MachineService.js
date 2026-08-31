import { getApiUrl } from "./apiConfig";
import axios from "axios";

const API_URL = getApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMachines = async (page = 0, size = 10) => {
  return await axios.get(`${API_URL}api/v1.0/admin/getMachines`, {
    headers: getAuthHeaders(),
    params: { page, size },
  });
};

export const fetchAllMachines = async () => {
  return await axios.get(`${API_URL}api/v1.0/admin/getAllMachinesList`, {
    headers: getAuthHeaders(),
  });
};

export const addMachine = async (machineData) => {
  return await axios.post(`${API_URL}api/v1.0/admin/addMachine`, machineData, {
    headers: getAuthHeaders(),
  });
};

export const updateMachine = async (machineId, machineData) => {
  return await axios.put(`${API_URL}api/v1.0/admin/updateMachine/${machineId}`, machineData, {
    headers: getAuthHeaders(),
  });
};

export const updateMachineStatus = async (machineId, isActive) => {
  return await axios.patch(`${API_URL}api/v1.0/admin/updateMachineStatus/${machineId}`, null, {
    headers: getAuthHeaders(),
    params: { isActive },
  });
};

export const deleteMachine = async (machineId) => {
  return await axios.delete(`${API_URL}api/v1.0/admin/deleteMachine/${machineId}`, {
    headers: getAuthHeaders(),
  });
};
