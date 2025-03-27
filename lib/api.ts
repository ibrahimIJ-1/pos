
import axios from 'axios';
import { toast } from 'sonner';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'An error occurred';
    toast.error(message);
    
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// New API functions for invoice and reports
export const invoiceApi = {
  getInvoice: async (saleId: string) => {
    const response = await api.get(`/sales/${saleId}`);
    return response.data;
  },
  
  sendInvoiceByEmail: async (saleId: string, email: string) => {
    const response = await api.post(`/sales/${saleId}/email`, { email });
    return response.data;
  },
  
  downloadInvoice: async (saleId: string) => {
    const response = await api.get(`/sales/${saleId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export const reportsApi = {
  getSalesReport: async (params: any) => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },
  
  getInventoryReport: async (params: any) => {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },
  
  getCustomerReport: async (params: any) => {
    const response = await api.get('/reports/customers', { params });
    return response.data;
  },
  
  getProfitReport: async (params: any) => {
    const response = await api.get('/reports/profit', { params });
    return response.data;
  },
  
  exportReport: async (type: string, format: string, params: any) => {
    const response = await api.get(`/reports/${type}/export/${format}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;
