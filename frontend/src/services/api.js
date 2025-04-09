import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 检查是否是登录请求
    const isLoginRequest = error.config.url.endsWith('/login');
    
    // 只有非登录请求的401错误才重定向
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      // 这是已登录用户的会话失效，清除令牌并重定向
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // 无论如何都返回错误，让组件自行处理
    return Promise.reject(error);
  }
);
// API服务函数保持不变
export const authService = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getCurrentUser: () => api.get('/user'),
};

export const projectService = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (project) => api.post('/projects', project),
  updateProject: (id, project) => api.put(`/projects/${id}`, project),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

export const taskService = {
  getTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  createTask: (projectId, task) => api.post(`/projects/${projectId}/tasks`, task),
  updateTask: (taskId, task) => api.put(`/tasks/${taskId}`, task),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};

export default api;