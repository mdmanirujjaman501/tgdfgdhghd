import api from './axios';
import { ApiResponse, Actor } from '../types';

export const actorApi = {
  getAll: async (params?: { search?: string }): Promise<ApiResponse<Actor[]>> => {
    const res = await api.get('/actors', { params });
    return res.data;
  },

  getById: async (id: number): Promise<ApiResponse<Actor>> => {
    const res = await api.get(`/actors/${id}`);
    return res.data;
  },

  create: async (data: Partial<Actor>): Promise<ApiResponse<Actor>> => {
    const res = await api.post('/actors', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Actor>): Promise<ApiResponse<Actor>> => {
    const res = await api.put(`/actors/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/actors/${id}`);
    return res.data;
  },
};
