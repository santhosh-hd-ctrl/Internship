import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  me:       ()     => API.get('/auth/me'),
};

// Users
export const userAPI = {
  getAll:         ()      => API.get('/users'),
  search:         (q)     => API.get(`/users/search?q=${encodeURIComponent(q)}`),
  getById:        (id)    => API.get(`/users/${id}`),
  updateProfile:  (data)  => API.put('/users/profile', data),
};

// Chats
export const chatAPI = {
  getMyChats:         ()        => API.get('/chats'),
  getChatById:        (id)      => API.get(`/chats/${id}`),
  createPrivate:      (recipientId) => API.post('/chats/private', { recipientId }),
  createGroup:        (data)    => API.post('/chats/group', data),
  joinGroup:          (id)      => API.post(`/chats/${id}/join`),
  leaveGroup:         (id)      => API.delete(`/chats/${id}/leave`),
  markRead:           (id)      => API.post(`/chats/${id}/read`),
  getAllGroups:        ()        => API.get('/chats/groups/all'),
  searchGroups:       (q)       => API.get(`/chats/groups/search?q=${encodeURIComponent(q)}`),
};

// Messages
export const messageAPI = {
  send:         (data)           => API.post('/messages', data),
  getForChat:   (chatId, page=0, size=50) => API.get(`/messages/chat/${chatId}?page=${page}&size=${size}`),
  edit:         (id, content)    => API.put(`/messages/${id}`, { content }),
  delete:       (id)             => API.delete(`/messages/${id}`),
  search:       (chatId, q)      => API.get(`/messages/chat/${chatId}/search?q=${encodeURIComponent(q)}`),
};

// Files
export const fileAPI = {
  upload: (formData) => API.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default API;
