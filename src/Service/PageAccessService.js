import { getApiUrl } from "./apiConfig";
const API_URL = getApiUrl();
const BASE_URL = `${API_URL}api/v1.0/page-access`;

export const createPageAccess = async (data, token) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create page access");
  return response.json();
};

export const getActivePageAccesses = async (token) => {
  const response = await fetch(`${BASE_URL}/active-list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch active page accesses");
  return response.json();
};

export const updatePageAccess = async (id, data, token) => {
  const response = await fetch(`${BASE_URL}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update page access");
  return response.json();
};

export const togglePageAccess = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}/toggle`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to toggle page access");
  return response.json();
};

export const toggleRoleAccess = async (id, role, token) => {
  const response = await fetch(`${BASE_URL}/${id}/toggle-role/${role}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to toggle ${role} access`);
  return response.json();
};
