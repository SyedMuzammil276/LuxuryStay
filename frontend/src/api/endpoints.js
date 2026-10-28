import apiClient from './client';

// ================= AUTH API =================
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
};

// ================= USERS / STAFF API =================
export const usersApi = {
  getAllUsers: () => apiClient.get('/users/getAllUser'),
  // Admin, manager, receptionist: task assign dropdown ke liye (role = 'housekeeping' | 'maintenance')
  getAssignableStaff: (role) => apiClient.get('/users/assignable', { params: { role } }),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  createStaff: (data) => apiClient.post('/users', data),
  updateStaff: (id, data) => apiClient.put(`/users/${id}`, data),
  toggleStaffStatus: (id) => apiClient.patch(`/users/${id}/status`),
};

// ================= GUESTS API =================
export const guestsApi = {
  register: (data) => apiClient.post('/guests/register', data),
  listGuests: (params) => apiClient.get('/guests', { params }),
  getGuest: (id) => apiClient.get(`/guests/${id}`),
  createGuest: (data) => apiClient.post('/guests', data),
  updateGuest: (id, data) => apiClient.put(`/guests/${id}`, data),
  deleteGuest: (id) => apiClient.delete(`/guests/${id}`),
  resendVerificationPublic: (email) => apiClient.post('/guests/resend-verification', { email }),
  resendVerificationStaff: (id) => apiClient.post(`/guests/${id}/resend-verification`),
};

// ================= ROOMS API =================
export const roomsApi = {
  listRooms: (params) => apiClient.get('/rooms', { params }),
  listPublicRooms: (params) => apiClient.get('/rooms/public', { params }),
  getRoom: (id) => apiClient.get(`/rooms/${id}`),
  createRoom: (data) => apiClient.post('/rooms/create', data),
  updateRoom: (id, data) => apiClient.put(`/rooms/update/${id}`, data),
  updateRoomStatus: (id, status) => apiClient.patch(`/rooms/${id}/status`, { status }),
  deleteRoom: (id) => apiClient.delete(`/rooms/${id}`),
};

// ================= RESERVATIONS API =================
export const reservationsApi = {
  listReservations: (params) => apiClient.get('/reservations', { params }),
  listMyReservations: () => apiClient.get('/reservations/my'),
  getReservation: (id) => apiClient.get(`/reservations/${id}`),
  createReservation: (data) => apiClient.post('/reservations', data),
  createMyReservation: (data) => apiClient.post('/reservations/my', data),
  updateReservation: (id, data) => apiClient.put(`/reservations/${id}`, data),
  cancelReservation: (id, cancellationReason) =>
    apiClient.patch(`/reservations/${id}/cancel`, { cancellationReason }),
  checkIn: (id) => apiClient.patch(`/reservations/${id}/check-in`),
  checkOut: (id) => apiClient.patch(`/reservations/${id}/check-out`),
  markNoShow: (id) => apiClient.patch(`/reservations/${id}/no-show`),
};

// ================= BILLING & INVOICES API =================
export const billingApi = {
  listBills: (params) => apiClient.get('/billing', { params }),
  getBill: (id) => apiClient.get(`/billing/${id}`),
  generateBill: (data) => apiClient.post('/billing/generate', data),
  recordPayment: (id, amount) => apiClient.patch(`/billing/${id}/payment`, { amount }),
};

// ================= HOUSEKEEPING API =================
export const housekeepingApi = {
  listTasks: (params) => apiClient.get('/housekeeping', { params }),
  getTaskById: (id) => apiClient.get(`/housekeeping/${id}`),
  createTask: (data) => apiClient.post('/housekeeping', data),
  updateTask: (id, data) => apiClient.patch(`/housekeeping/${id}`, data),
  updateTaskStatus: (id, status) => apiClient.patch(`/housekeeping/${id}/status`, { status }),
};

// ================= MAINTENANCE API =================
export const maintenanceApi = {
  listRequests: (params) => apiClient.get('/maintenance', { params }),
  getRequestById: (id) => apiClient.get(`/maintenance/${id}`),
  createRequest: (data) => apiClient.post('/maintenance', data),
  updateRequest: (id, data) => apiClient.patch(`/maintenance/${id}`, data),
  updateRequestStatus: (id, data) => apiClient.patch(`/maintenance/${id}/status`, data),
};

// ================= GUEST SERVICES (ADDITIONAL SERVICES) API =================
export const guestServicesApi = {
  listServices: (params) => apiClient.get('/additional-services', { params }),
  getService: (id) => apiClient.get(`/additional-services/${id}`),
  createService: (data) => apiClient.post('/additional-services', data),
  updateService: (id, data) => apiClient.patch(`/additional-services/${id}`, data),
  updateServiceStatus: (id, status) => apiClient.patch(`/additional-services/${id}/status`, { status }),
  cancelService: (id) => apiClient.patch(`/additional-services/${id}/cancel`),
};

// ================= REPORTS & ANALYTICS API =================
export const reportsApi = {
  getDashboardReport: () => apiClient.get('/reports/dashboard'),
  getRoomReport: () => apiClient.get('/reports/rooms'),
  getGuestReport: () => apiClient.get('/reports/guests'),
};

// ================= NOTIFICATIONS API =================
export const notificationsApi = {
  listNotifications: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  createManualNotification: (data) => apiClient.post('/notifications', data),
};

// ================= GUEST FEEDBACK API =================
export const feedbackApi = {
  submitFeedback: (data) => apiClient.post('/feedback', data),
  listFeedback: () => apiClient.get('/feedback'),
};