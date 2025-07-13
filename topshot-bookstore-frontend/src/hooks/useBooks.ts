
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import type { BooksResponse, FeaturedBooksResponse, Book } from '@/types';

export const useBooks = (params?: any) => {
  return useQuery<BooksResponse>({
    queryKey: ['books', params],
    queryFn: () => api.getBooks(params),
  });
};

export const useBook = (id: string) => {
  return useQuery<Book>({
    queryKey: ['book', id],
    queryFn: () => api.getBook(id),
    enabled: !!id,
  });
};

export const useFeaturedBooks = () => {
  return useQuery<FeaturedBooksResponse>({
    queryKey: ['books', 'featured'],
    queryFn: () => api.getFeaturedBooks(),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });
};

export const useSearchBooks = (query: string) => {
  return useQuery<BooksResponse>({
    queryKey: ['books', 'search', query],
    queryFn: () => api.searchBooks(query),
    enabled: !!query,
  });
};
