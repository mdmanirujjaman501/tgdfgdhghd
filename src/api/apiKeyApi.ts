import api from './axios';
import { ApiResponse, ApiKey } from '../types';

export const apiKeyApi = {
  getAll: async (): Promise<ApiResponse<ApiKey[]>> => {
    const res = await api.get('/api-keys');
    return res.data;
  },

  create: async (data: { name: string; rate_limit?: number }): Promise<ApiResponse<ApiKey>> => {
    const res = await api.post('/api-keys', data);
    return res.data;
  },

  update: async (id: number, data: Partial<ApiKey>): Promise<ApiResponse> => {
    const res = await api.put(`/api-keys/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/api-keys/${id}`);
    return res.data;
  },
};
