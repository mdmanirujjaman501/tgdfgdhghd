import api from './axios';
import { ApiResponse, MediaSource } from '../types';

export const mediaApi = {
  getAll: async (params?: { episode_id?: number }): Promise<ApiResponse<MediaSource[]>> => {
    const res = await api.get('/media-sources', { params });
    return res.data;
  },

  create: async (data: Partial<MediaSource>): Promise<ApiResponse<MediaSource>> => {
    const res = await api.post('/media-sources', data);
    return res.data;
  },

  update: async (id: number, data: Partial<MediaSource>): Promise<ApiResponse<MediaSource>> => {
    const res = await api.put(`/media-sources/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/media-sources/${id}`);
    return res.data;
  },
};
