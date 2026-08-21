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

export const createBill = (billData) => {
  return axios.post(`${API_URL}api/v1.0/bills`, billData, {
    headers: getAuthHeaders(),
  });
};

export const updateBill = (id, billData) => {
  return axios.put(`${API_URL}api/v1.0/bills/${id}`, billData, {
    headers: getAuthHeaders(),
  });
};

export const checkCustomerCredit = (customerName) => {
  return axios.get(`${API_URL}api/v1.0/bills/check-credit`, {
    headers: getAuthHeaders(),
    params: { customerName },
  });
};


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

export const getCustomerWiseData = (page, size) => {
  return axios.get(`${API_URL}api/v1.0/bills/customer-wise-data`, {
    headers: getAuthHeaders(),
    params: {
      page,
      size,
    },
  });
};

export const getEmployeeWiseData = (page, size, dateFilter, startDate, endDate, employeeName) => {
  return axios.get(`${API_URL}api/v1.0/bills/employee-wise-data`, {
    headers: getAuthHeaders(),
    params: {
      page,
      size,
      dateFilter,
      startDate,
      endDate,
      employeeName,
    },
  });
};
