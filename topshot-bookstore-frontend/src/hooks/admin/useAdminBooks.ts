import { useQuery } from "@tanstack/react-query";
import {api} from "@/utils/api";
import { Book } from "@/types/admin";

export function useAdminBooks() {
  return useQuery<Book[]>({
    queryKey: ['admin-books'],
    queryFn: async () => {
      const res = await api.get('/api/admin/books');
      return res.data;
    }
  });
}