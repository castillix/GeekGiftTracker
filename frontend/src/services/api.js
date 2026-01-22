import axios from 'axios';

const API_URL = 'http://localhost:15003';

export const api = axios.create({
    baseURL: API_URL,
});

export const getRequests = async () => {
    const response = await api.get('/requests/');
    return response.data;
};

export const getRequest = async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
};

export const createRequest = async (formData) => {
    const response = await api.post('/requests/', formData);
    return response.data;
};

export const updateRequest = async (id, data) => {
    const response = await api.put(`/requests/${id}`, data);
    return response.data;
};

export const createComment = async (id, content) => {
    const response = await api.post(`/requests/${id}/comments/`, { content });
    return response.data;
}

export const getFileUrl = (filename) => {
    if (!filename) return null;
    return `${API_URL}/download/${filename}`;
};

export const deleteRequest = async (id) => {
    await api.delete(`/requests/${id}`);
};
