import { useQuery } from "@tanstack/react-query";
import { api }  from "@/utils/api";
import { Book } from "@/types/admin";

export function useAdminBook(id: string) {
  return useQuery<Book>({
    queryKey: ['admin-book', id],
    queryFn: async () => {
      const res = await api.get(`/api/admin/books/${id}`);
      return res.data;
    },
    enabled: !!id
  });
}