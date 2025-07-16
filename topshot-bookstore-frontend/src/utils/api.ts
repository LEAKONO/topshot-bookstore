import type {
  ApiResponse,
  AuthResponse,
  BooksResponse,
  FeaturedBooksResponse,
  User,
  Book,
  PaginatedResponse
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private onUnauthorizedCallback?: () => void;

  constructor(baseURL: string, onUnauthorized?: () => void) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
    this.onUnauthorizedCallback = onUnauthorized;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  set onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }

        throw new ApiError(
          data.message || 'Request failed',
          response.status,
          data.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  }

  // --- 🔐 Auth ---
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

  // --- 📚 Books ---
  async getBooks(params: any = {}): Promise<BooksResponse> {
    const query = new URLSearchParams(params).toString();
    return this.request<BooksResponse>(`/books${query ? `?${query}` : ''}`);
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

  // --- 🧾 Orders ---
  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(params: any = {}): Promise<ApiResponse<any>> {
    const query = new URLSearchParams(params).toString();
    return this.request<ApiResponse<any>>(`/orders${query ? `?${query}` : ''}`);
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

  // --- 💳 Pesapal Payments ---
  async initiatePesapalPayment(orderId: string): Promise<ApiResponse<{ redirectUrl: string }>> {
    return this.request<ApiResponse<{ redirectUrl: string }>>('/payments/pesapal', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async verifyPesapalPayment(orderId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/payments/verify/${orderId}`);
  }

  async getPaymentStatus(orderId: string): Promise<ApiResponse<{ status: string }>> {
    return this.request<ApiResponse<{ status: string }>>(`/payments/status/${orderId}`);
  }

  // --- 👥 Admin Users ---
  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  } = {}): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    
    return this.request<PaginatedResponse<User>>(`/admin/users?${query.toString()}`);
  }

  async updateAdminUser(
    id: string,
    data: { role?: 'user' | 'admin'; isActive?: boolean }
  ): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteAdminUser(id: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  // --- 📊 Admin Stats ---
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/stats');
  }
}

export const api = new ApiClient(API_BASE_URL);