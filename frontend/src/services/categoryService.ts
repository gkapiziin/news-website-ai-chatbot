import api from './api';

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  articleCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CreateCategoryRequest): Promise<void> => {
    await api.put(`/categories/${id}`, data);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};
