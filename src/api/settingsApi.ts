import api from './axios';
import { ApiResponse } from '../types';

export const settingsApi = {
  get: async (): Promise<ApiResponse<Record<string, string>>> => {
    const res = await api.get('/settings');
    return res.data;
  },

  update: async (data: Record<string, string>): Promise<ApiResponse> => {
    const res = await api.put('/settings', data);
    return res.data;
  },
};
