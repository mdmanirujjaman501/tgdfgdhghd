import api from './axios';
import { ApiResponse, Episode } from '../types';

export const episodeApi = {
  getAll: async (params?: Record<string, any>): Promise<ApiResponse<Episode[]>> => {
    const res = await api.get('/episodes', { params });
    return res.data;
  },

  getById: async (id: number): Promise<ApiResponse<Episode>> => {
    const res = await api.get(`/episodes/${id}`);
    return res.data;
  },

  create: async (data: Partial<Episode>): Promise<ApiResponse<Episode>> => {
    const res = await api.post('/episodes', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Episode>): Promise<ApiResponse<Episode>> => {
    const res = await api.put(`/episodes/${id}`, data);
    return res.data;
  },

  toggleAttribute: async (id: number, field: 'status'): Promise<ApiResponse> => {
    const res = await api.patch(`/episodes/${id}/toggle`, { field });
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/episodes/${id}`);
    return res.data;
  },
};
