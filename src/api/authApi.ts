import api from './axios';
import { ApiResponse, AdminUser } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; admin: AdminUser }>> => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<AdminUser>> => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  changePassword: async (data: { current_password: string; new_password: string }): Promise<ApiResponse> => {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },
};
