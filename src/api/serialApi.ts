import api from './axios';
import { ApiResponse, Serial } from '../types';

export const serialApi = {
  getAll: async (params?: Record<string, any>): Promise<ApiResponse<Serial[]>> => {
    const res = await api.get('/serials', { params });
    return res.data;
  },

  getById: async (idOrSlug: string | number): Promise<ApiResponse<Serial>> => {
    const res = await api.get(`/serials/${idOrSlug}`);
    return res.data;
  },

  create: async (data: Partial<Serial>): Promise<ApiResponse<Serial>> => {
    const res = await api.post('/serials', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Serial>): Promise<ApiResponse<Serial>> => {
    const res = await api.put(`/serials/${id}`, data);
    return res.data;
  },

  toggleAttribute: async (id: number, field: 'status' | 'featured'): Promise<ApiResponse> => {
    const res = await api.patch(`/serials/${id}/toggle`, { field });
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/serials/${id}`);
    return res.data;
  },
};
