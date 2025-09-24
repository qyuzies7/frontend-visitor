import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// --- PUBLIC ENDPOINTS ---
export const getVisitTypes = () => axios.get(`${API_BASE}/public/visit-types`);
export const getStations = () => axios.get(`${API_BASE}/public/stations`);
export const submitVisitorCard = (data) => axios.post(`${API_BASE}/public/visitor-cards`, data);
export const getVisitorCard = (id) => axios.get(`${API_BASE}/public/visitor-cards/${id}`);
export const checkStatus = (data) => axios.post(`${API_BASE}/public/check-status`, data);
export const getVisitorCardDetail = (id) => axios.get(`${API_BASE}/public/visitor-cards/${id}/detail`);
export const getStatusLogs = () => axios.get(`${API_BASE}/public/status-logs`);
export const cancelApplication = (data) => axios.post(`${API_BASE}/public/cancel-application`, data);
export const resubmitApplication = (data) => axios.post(`${API_BASE}/public/resubmit-application`, data);

// --- ADMIN ENDPOINTS ---
export const adminLogin = (data) => axios.post(`${API_BASE}/admin/login`, data);
export const adminLogout = () => axios.post(`${API_BASE}/admin/logout`);
export const getAdminMe = () => axios.get(`${API_BASE}/admin/me`);

// Dashboard
export const getActiveVisitors = () => axios.get(`${API_BASE}/admin/dashboard/active-visitors`);
export const getPendingCount = () => axios.get(`${API_BASE}/admin/dashboard/pending-count`);
export const getTodayIssued = () => axios.get(`${API_BASE}/admin/dashboard/today-issued`);
export const getTodayReturned = () => axios.get(`${API_BASE}/admin/dashboard/today-returned`);
export const getDamagedCards = () => axios.get(`${API_BASE}/admin/dashboard/damaged-cards`);
export const getLostCards = () => axios.get(`${API_BASE}/admin/dashboard/lost-cards`);

// Verifikasi
export const getPendingVerifications = () => axios.get(`${API_BASE}/admin/verification/pending`);
export const getVerificationDetail = (data) => axios.post(`${API_BASE}/admin/verification/detail`, data);
export const approveVerification = (data) => axios.post(`${API_BASE}/admin/verification/approve`, data);
export const rejectVerification = (data) => axios.post(`${API_BASE}/admin/verification/reject`, data);
export const bulkVerificationAction = (data) => axios.post(`${API_BASE}/admin/verification/bulk-action`, data);

// Kartu Visitor
export const getApprovedCards = () => axios.get(`${API_BASE}/admin/cards/approved`);
export const getActiveCards = () => axios.get(`${API_BASE}/admin/cards/active`);
export const getReturnedCards = () => axios.get(`${API_BASE}/admin/cards/returned`);
export const issueCard = (data) => axios.post(`${API_BASE}/admin/cards/issue`, data);
export const returnCard = (data) => axios.post(`${API_BASE}/admin/cards/return`, data);
export const editCardCondition = (id, data) => axios.put(`${API_BASE}/admin/cards/${id}/condition`, data);

// Export & Reporting
export const exportStationDailyFlow = () => axios.get(`${API_BASE}/admin/reports/station-daily-flow`);
export const exportAll = () => axios.get(`${API_BASE}/admin/reports/export-all`);
export const exportDailyFlow = () => axios.get(`${API_BASE}/admin/reports/daily-flow`);
export const exportWeeklyFlow = () => axios.get(`${API_BASE}/admin/reports/weekly-flow`);
export const exportMonthlyFlow = () => axios.get(`${API_BASE}/admin/reports/monthly-flow`);
export const exportYearlyFlow = () => axios.get(`${API_BASE}/admin/reports/yearly-flow`);
export const exportCardCondition = () => axios.get(`${API_BASE}/admin/reports/card-condition`);

// CRUD Resources (admin)
export const adminVisitorCards = {
  list: () => axios.get(`${API_BASE}/admin/visitor-cards`),
  get: (id) => axios.get(`${API_BASE}/admin/visitor-cards/${id}`),
  create: (data) => axios.post(`${API_BASE}/admin/visitor-cards`, data),
  update: (id, data) => axios.put(`${API_BASE}/admin/visitor-cards/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/admin/visitor-cards/${id}`),
};
export const adminCardTransactions = {
  list: () => axios.get(`${API_BASE}/admin/card-transactions`),
  get: (id) => axios.get(`${API_BASE}/admin/card-transactions/${id}`),
  create: (data) => axios.post(`${API_BASE}/admin/card-transactions`, data),
  update: (id, data) => axios.put(`${API_BASE}/admin/card-transactions/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/admin/card-transactions/${id}`),
};
export const adminStatusLogs = {
  list: () => axios.get(`${API_BASE}/admin/status-logs`),
  get: (id) => axios.get(`${API_BASE}/admin/status-logs/${id}`),
  create: (data) => axios.post(`${API_BASE}/admin/status-logs`, data),
  update: (id, data) => axios.put(`${API_BASE}/admin/status-logs/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/admin/status-logs/${id}`),
};
export const adminStations = {
  list: () => axios.get(`${API_BASE}/admin/stations`),
  get: (id) => axios.get(`${API_BASE}/admin/stations/${id}`),
  create: (data) => axios.post(`${API_BASE}/admin/stations`, data),
  update: (id, data) => axios.put(`${API_BASE}/admin/stations/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/admin/stations/${id}`),
};
export const adminVisitTypes = {
  list: () => axios.get(`${API_BASE}/admin/visit-types`),
  get: (id) => axios.get(`${API_BASE}/admin/visit-types/${id}`),
  create: (data) => axios.post(`${API_BASE}/admin/visit-types`, data),
  update: (id, data) => axios.put(`${API_BASE}/admin/visit-types/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/admin/visit-types/${id}`),
};
export const adminUsers = {
  list: () => axios.get(`${API_BASE}/admin/users`),
  get: (id) => axios.get(`${API_BASE}/admin/users/${id}`),
  create: (data) => axios.post(`${API_BASE}/admin/users`, data),
  update: (id, data) => axios.put(`${API_BASE}/admin/users/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/admin/users/${id}`),
};
export const adminNotifications = {
  list: () => axios.get(`${API_BASE}/admin/notifications`),
  get: (id) => axios.get(`${API_BASE}/admin/notifications/${id}`),
  create: (data) => axios.post(`${API_BASE}/admin/notifications`, data),
  update: (id, data) => axios.put(`${API_BASE}/admin/notifications/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/admin/notifications/${id}`),
};

// Health check
export const healthCheck = () => axios.get(`${API_BASE}/health`);
