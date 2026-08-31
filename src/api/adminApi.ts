import api from './axios';
import { ApiResponse, AdminUser } from '../types';

export const adminApi = {
  getAll: async (): Promise<ApiResponse<AdminUser[]>> => {
    const res = await api.get('/admin-users');
    return res.data;
  },

  create: async (data: Partial<AdminUser> & { password: string }): Promise<ApiResponse<AdminUser>> => {
    const res = await api.post('/admin-users', data);
    return res.data;
  },

  update: async (id: number, data: Partial<AdminUser>): Promise<ApiResponse> => {
    const res = await api.put(`/admin-users/${id}`, data);
    return res.data;
  },

  resetPassword: async (id: number, new_password: string): Promise<ApiResponse> => {
    const res = await api.post(`/admin-users/${id}/reset-password`, { new_password });
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/admin-users/${id}`);
    return res.data;
  },
};
