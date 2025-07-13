
import type { ApiResponse, AuthResponse, BooksResponse, FeaturedBooksResponse, User, Book } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: any): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(data: any): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Books methods
  async getBooks(params: any = {}): Promise<BooksResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<BooksResponse>(`/books${queryString ? `?${queryString}` : ''}`);
  }

  async getBook(id: string): Promise<Book> {
    return this.request<Book>(`/books/${id}`);
  }

  async getFeaturedBooks(): Promise<FeaturedBooksResponse> {
    return this.request<FeaturedBooksResponse>('/books/featured');
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<ApiResponse<string[]>>('/books/categories');
  }

  async searchBooks(query: string): Promise<BooksResponse> {
    return this.request<BooksResponse>(`/books/search?q=${encodeURIComponent(query)}`);
  }

  // Orders methods
  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(params: any = {}): Promise<ApiResponse<any>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<ApiResponse<any>>(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/orders/${id}`);
  }

  async cancelOrder(id: string, reason?: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
