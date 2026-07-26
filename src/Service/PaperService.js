import axios from "axios";

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url || url === "/") return "/";
  return url.endsWith("/") ? url : url + "/";
};

const API_URL = getApiUrl();

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ─── PAPER CATEGORY ─────────────────────────────────────────────────── */
export const fetchPaperCategories = (page = 0, size = 10) =>
  axios.get(`${API_URL}api/v1.0/admin/getPaperCategories`, {
    headers: getAuthHeaders(),
    params: { page, size },
  });

export const fetchAllPaperCategoriesList = () =>
  axios.get(`${API_URL}api/v1.0/admin/getAllPaperCategoriesList`, {
    headers: getAuthHeaders(),
  });

export const addPaperCategory = (data) =>
  axios.post(`${API_URL}api/v1.0/admin/addPaperCategory`, data, {
    headers: getAuthHeaders(),
  });

export const updatePaperCategory = (categoryId, data) =>
  axios.put(`${API_URL}api/v1.0/admin/updatePaperCategory/${categoryId}`, data, {
    headers: getAuthHeaders(),
  });

export const deletePaperCategory = (categoryId) =>
  axios.delete(`${API_URL}api/v1.0/admin/deletePaperCategory/${categoryId}`, {
    headers: getAuthHeaders(),
  });

/* ─── PAPER GROUP ────────────────────────────────────────────────────── */
export const fetchPaperGroups = (page = 0, size = 10) =>
  axios.get(`${API_URL}api/v1.0/admin/getPaperGroups`, {
    headers: getAuthHeaders(),
    params: { page, size },
  });

export const fetchAllPaperGroupsList = () =>
  axios.get(`${API_URL}api/v1.0/admin/getAllPaperGroupsList`, {
    headers: getAuthHeaders(),
  });

export const addPaperGroup = (data) =>
  axios.post(`${API_URL}api/v1.0/admin/addPaperGroup`, data, {
    headers: getAuthHeaders(),
  });

export const updatePaperGroup = (groupId, data) =>
  axios.put(`${API_URL}api/v1.0/admin/updatePaperGroup/${groupId}`, data, {
    headers: getAuthHeaders(),
  });

export const deletePaperGroup = (groupId) =>
  axios.delete(`${API_URL}api/v1.0/admin/deletePaperGroup/${groupId}`, {
    headers: getAuthHeaders(),
  });

/* ─── PAPER ──────────────────────────────────────────────────────────── */
export const fetchPapers = (page = 0, size = 10) =>
  axios.get(`${API_URL}api/v1.0/admin/getPapers`, {
    headers: getAuthHeaders(),
    params: { page, size },
  });

export const fetchAllPapersList = () =>
  axios.get(`${API_URL}api/v1.0/admin/getAllPapersList`, {
    headers: getAuthHeaders(),
  });

export const addPaper = (data) =>
  axios.post(`${API_URL}api/v1.0/admin/addPaper`, data, {
    headers: getAuthHeaders(),
  });

export const updatePaper = (paperId, data) =>
  axios.put(`${API_URL}api/v1.0/admin/updatePaper/${paperId}`, data, {
    headers: getAuthHeaders(),
  });

export const deletePaper = (paperId) =>
  axios.delete(`${API_URL}api/v1.0/admin/deletePaper/${paperId}`, {
    headers: getAuthHeaders(),
  });
