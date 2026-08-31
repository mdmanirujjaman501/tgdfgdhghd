import api from './axios';
import { ApiResponse, Category, Genre, Language, Country, Tag } from '../types';

export const taxonomyApi = {
  // Categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const res = await api.get('/taxonomies/categories');
    return res.data;
  },
  createCategory: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const res = await api.post('/taxonomies/categories', data);
    return res.data;
  },
  updateCategory: async (id: number, data: Partial<Category>): Promise<ApiResponse> => {
    const res = await api.put(`/taxonomies/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/taxonomies/categories/${id}`);
    return res.data;
  },

  // Genres
  getGenres: async (): Promise<ApiResponse<Genre[]>> => {
    const res = await api.get('/taxonomies/genres');
    return res.data;
  },
  createGenre: async (data: Partial<Genre>): Promise<ApiResponse<Genre>> => {
    const res = await api.post('/taxonomies/genres', data);
    return res.data;
  },
  updateGenre: async (id: number, data: Partial<Genre>): Promise<ApiResponse> => {
    const res = await api.put(`/taxonomies/genres/${id}`, data);
    return res.data;
  },
  deleteGenre: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/taxonomies/genres/${id}`);
    return res.data;
  },

  // Languages
  getLanguages: async (): Promise<ApiResponse<Language[]>> => {
    const res = await api.get('/taxonomies/languages');
    return res.data;
  },
  createLanguage: async (data: { name: string; code: string }): Promise<ApiResponse<Language>> => {
    const res = await api.post('/taxonomies/languages', data);
    return res.data;
  },

  // Countries
  getCountries: async (): Promise<ApiResponse<Country[]>> => {
    const res = await api.get('/taxonomies/countries');
    return res.data;
  },
  createCountry: async (data: { name: string; code: string }): Promise<ApiResponse<Country>> => {
    const res = await api.post('/taxonomies/countries', data);
    return res.data;
  },

  // Tags
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    const res = await api.get('/taxonomies/tags');
    return res.data;
  },
  createTag: async (data: { name: string }): Promise<ApiResponse<Tag>> => {
    const res = await api.post('/taxonomies/tags', data);
    return res.data;
  },
};
