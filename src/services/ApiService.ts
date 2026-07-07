import { api } from './api';

export class ApiService {
  static async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await api.get<T>(url, { params });
      return (response.data as any)?.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.post<T>(url, data);
      return (response.data as any)?.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.put<T>(url, data);
      return (response.data as any)?.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async delete<T>(url: string): Promise<T> {
    try {
      const response = await api.delete<T>(url);
      return (response.data as any)?.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private static handleError(error: any) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      return;
    }
    const message = error.response?.data?.message || error.message || 'Ocorreu um erro na requisição.';
    alert(message); // Ou substituir por um Toast
  }
}
