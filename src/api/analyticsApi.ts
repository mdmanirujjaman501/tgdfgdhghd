import api from './axios';
import { ApiResponse, DashboardData, ActivityLog } from '../types';

export const analyticsApi = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardData>> => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },

  getChartData: async (): Promise<ApiResponse<any[]>> => {
    const res = await api.get('/analytics/charts');
    return res.data;
  },

  getActivityLogs: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<ActivityLog[]>> => {
    const res = await api.get('/analytics/activity-logs', { params });
    return res.data;
  },
};
