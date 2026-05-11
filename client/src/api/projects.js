import API from './axios'

export const getProjects = () => API.get('/projects')
export const getProject = (id) => API.get(`/projects/${id}`)
export const createProject = (data) => API.post('/projects', data)
export const updateProject = (id, data) => API.put(`/projects/${id}`, data)
export const deleteProject = (id) => API.delete(`/projects/${id}`)
export const addMember = (projectId, data) => API.post(`/projects/${projectId}/members`, data)
export const removeMember = (projectId, userId) => API.delete(`/projects/${projectId}/members/${userId}`)