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

export const getNextBillNumber = () =>
  axios.get(`${API_URL}api/v1.0/bills/next-bill-number`, {
    headers: getAuthHeaders(),
  });

export const createBill = (data) =>
  axios.post(`${API_URL}api/v1.0/bills`, data, {
    headers: getAuthHeaders(),
  });

export const getAllBills = (page, size, dateFilter, startDate, endDate, paymentMode, customerName) => {
  return axios.get(`${API_URL}api/v1.0/bills/get-all-bills`, {
    headers: getAuthHeaders(),
    params: {
      page,
      size,
      dateFilter,
      startDate,
      endDate,
      paymentMode,
      customerName,
    },
  });
};
