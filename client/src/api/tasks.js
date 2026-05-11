import API from './axios'

export const getProjectTasks = (projectId, params) => API.get(`/tasks/project/${projectId}`, { params })
export const getMyTasks = () => API.get('/tasks/my')
export const getDashboard = () => API.get('/tasks/dashboard')
export const createTask = (data) => API.post('/tasks', data)
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data)
export const deleteTask = (id) => API.delete(`/tasks/${id}`)