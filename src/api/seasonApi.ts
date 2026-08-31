import api from './axios';
import { ApiResponse, Season } from '../types';

export const seasonApi = {
  getAll: async (params?: { serial_id?: number }): Promise<ApiResponse<Season[]>> => {
    const res = await api.get('/seasons', { params });
    return res.data;
  },

  getById: async (id: number): Promise<ApiResponse<Season>> => {
    const res = await api.get(`/seasons/${id}`);
    return res.data;
  },

  create: async (data: Partial<Season>): Promise<ApiResponse<Season>> => {
    const res = await api.post('/seasons', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Season>): Promise<ApiResponse<Season>> => {
    const res = await api.put(`/seasons/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/seasons/${id}`);
    return res.data;
  },
};
