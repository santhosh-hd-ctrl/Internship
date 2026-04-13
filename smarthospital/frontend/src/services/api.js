import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// Doctors
export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSchedule: (id) => api.get(`/doctors/${id}/schedule`),
}

// Appointments
export const appointmentAPI = {
  book: (data) => api.post('/appointments', data),
  myAppointments: (params) => api.get('/appointments/my', { params }),
  getDoctorAppointments: (doctorId, params) => api.get(`/appointments/doctor/${doctorId}`, { params }),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, null, { params: { reason } }),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, null, { params: { status } }),
  getQueue: (doctorId, date) => api.get(`/appointments/queue/${doctorId}`, { params: { date } }),
}

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPatients: (params) => api.get('/admin/patients', { params }),
  createDoctor: (data) => api.post('/admin/doctors', data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  toggleAvailability: (id) => api.put(`/admin/doctors/${id}/toggle-availability`),
}

export default api
