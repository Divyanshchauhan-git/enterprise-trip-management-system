/* ==========================================================================
   ENTERPRISE TRIP MANAGEMENT SYSTEM - CENTRALIZED API CLIENT
   ========================================================================== */

export function getBaseUrl() {
  const custom = localStorage.getItem('custom_api_url');
  if (custom) return custom;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:8000';
  }
  return 'https://enterprise-trip-management-system.onrender.com';
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const baseUrl = getBaseUrl();
  let res;

  try {
    res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (netErr) {
    // If local request fails, try fallback to remote Render URL
    if (baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
      try {
        res = await fetch(`https://enterprise-trip-management-system.onrender.com${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
        });
      } catch {
        throw new Error(`Unable to connect to backend server (${baseUrl}). Please verify the backend is running.`);
      }
    } else {
      throw new Error(`Unable to connect to backend server (${baseUrl}). Please verify the backend is running.`);
    }
  }

  if (res.status === 401) {
    clearAuthSession();
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = { detail: `Server returned status ${res.status}` };
  }

  if (!res.ok) {
    const errorMsg = data.detail || (typeof data === 'string' ? data : 'API Request Failed');
    throw new Error(errorMsg);
  }
  return data;
}

// Safe GET wrapper that defaults to empty array on failure
export async function safeGetArray(endpoint) {
  try {
    const data = await apiFetch(endpoint);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`[API GET Warning] ${endpoint}:`, err.message);
    return [];
  }
}

// CRUD Helpers
export const api = {
  // Auth
  login: (email, password) => apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (username, email, password) => apiFetch('/signup', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
  googleLogin: (credential) => apiFetch('/google-login', { method: 'POST', body: JSON.stringify({ token: credential }) }),

  // Fleet Trips
  getTrips: () => safeGetArray('/trips'),
  createTrip: (tripData) => apiFetch('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
  updateTrip: (id, tripData) => apiFetch(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(tripData) }),
  deleteTrip: (id) => apiFetch(`/trips/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => safeGetArray('/customers'),
  createCustomer: (customerData) => apiFetch('/customers', { method: 'POST', body: JSON.stringify(customerData) }),
  updateCustomer: (id, customerData) => apiFetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customerData) }),
  deleteCustomer: (id) => apiFetch(`/customers/${id}`, { method: 'DELETE' }),

  // Vendors
  getVendors: () => safeGetArray('/vendors'),
  createVendor: (vendorData) => apiFetch('/vendors', { method: 'POST', body: JSON.stringify(vendorData) }),
  updateVendor: (id, vendorData) => apiFetch(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(vendorData) }),
  deleteVendor: (id) => apiFetch(`/vendors/${id}`, { method: 'DELETE' }),

  // Ship To Locations
  getShipTos: () => safeGetArray('/shipto'),
  createShipTo: (shiptoData) => apiFetch('/shipto', { method: 'POST', body: JSON.stringify(shiptoData) }),
  updateShipTo: (id, shiptoData) => apiFetch(`/shipto/${id}`, { method: 'PUT', body: JSON.stringify(shiptoData) }),
  deleteShipTo: (id) => apiFetch(`/shipto/${id}`, { method: 'DELETE' }),

  // Products & Categories
  getCategories: () => safeGetArray('/product-categories'),
  createCategory: (categoryData) => apiFetch('/product-categories', { method: 'POST', body: JSON.stringify(categoryData) }),
  deleteCategory: (id) => apiFetch(`/product-categories/${id}`, { method: 'DELETE' }),

  getProducts: () => safeGetArray('/products'),
  createProduct: (productData) => apiFetch('/products', { method: 'POST', body: JSON.stringify(productData) }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),

  // Fees & Taxes
  getFees: () => safeGetArray('/fees'),
  createFee: (feeData) => apiFetch('/fees', { method: 'POST', body: JSON.stringify(feeData) }),
  deleteFee: (id) => apiFetch(`/fees/${id}`, { method: 'DELETE' }),

  getTaxes: () => safeGetArray('/taxes'),
  createTax: (taxData) => apiFetch('/taxes', { method: 'POST', body: JSON.stringify(taxData) }),
  deleteTax: (id) => apiFetch(`/taxes/${id}`, { method: 'DELETE' }),

  // Invoice Configurations
  getInvoiceConfigs: () => safeGetArray('/invoice-configurations'),
  createInvoiceConfig: (configData) => apiFetch('/invoice-configurations', { method: 'POST', body: JSON.stringify(configData) }),
  updateInvoiceConfig: (id, configData) => apiFetch(`/invoice-configurations/${id}`, { method: 'PUT', body: JSON.stringify(configData) }),
  deleteInvoiceConfig: (id) => apiFetch(`/invoice-configurations/${id}`, { method: 'DELETE' }),

  // Freight Configurations
  getFreightConfigs: () => safeGetArray('/freight-configurations'),
  createFreightConfig: (configData) => apiFetch('/freight-configurations', { method: 'POST', body: JSON.stringify(configData) }),
  updateFreightConfig: (id, configData) => apiFetch(`/freight-configurations/${id}`, { method: 'PUT', body: JSON.stringify(configData) }),
  deleteFreightConfig: (id) => apiFetch(`/freight-configurations/${id}`, { method: 'DELETE' }),

  // Document Templates
  getTemplates: () => safeGetArray('/document-templates'),
  createTemplate: (templateData) => apiFetch('/document-templates', { method: 'POST', body: JSON.stringify(templateData) }),
  deleteTemplate: (id) => apiFetch(`/document-templates/${id}`, { method: 'DELETE' }),

  // Email Settings & Send Configurations
  getEmailSettings: () => safeGetArray('/email-settings'),
  createEmailSettings: (settingsData) => apiFetch('/email-settings', { method: 'POST', body: JSON.stringify(settingsData) }),
  deleteEmailSettings: (id) => apiFetch(`/email-settings/${id}`, { method: 'DELETE' }),

  getEmailConfigs: () => safeGetArray('/email-send-configurations'),
  createEmailConfig: (configData) => apiFetch('/email-send-configurations', { method: 'POST', body: JSON.stringify(configData) }),
  deleteEmailConfig: (id) => apiFetch(`/email-send-configurations/${id}`, { method: 'DELETE' }),

  sendEmail: (payload) => apiFetch('/send-email', { method: 'POST', body: JSON.stringify(payload) }),

  // Company Settings
  getCompanySettings: () => safeGetArray('/company-settings'),
  createCompanySettings: (companyData) => apiFetch('/company-settings', { method: 'POST', body: JSON.stringify(companyData) }),
  updateCompanySettings: (id, companyData) => apiFetch(`/company-settings/${id}`, { method: 'PUT', body: JSON.stringify(companyData) }),
  deleteCompanySettings: (id) => apiFetch(`/company-settings/${id}`, { method: 'DELETE' }),

  // PDF Generation & Download
  downloadPdf: async (endpoint, defaultFilename) => {
    const token = getToken();
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/${endpoint}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      throw new Error(`PDF Generation failed with status ${res.status}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  },
};