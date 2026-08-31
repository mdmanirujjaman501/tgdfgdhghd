import api from './axios';
import { ApiResponse, User } from '../types';

export const userApi = {
  getAll: async (params?: Record<string, any>): Promise<ApiResponse<User[]>> => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  update: async (id: number, data: Partial<User>): Promise<ApiResponse> => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};
