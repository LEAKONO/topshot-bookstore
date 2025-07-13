
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  lastLogin?: string;
  createdAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  pages?: number;
  language: string;
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface OrderItem {
  book: string | Book;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    books: T[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface BooksResponse {
  success: boolean;
  data: {
    books: Book[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  };
}

export interface FeaturedBooksResponse {
  success: boolean;
  data: Book[];
}
