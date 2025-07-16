import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

interface AdminStats {
  books: number;
  users: number;
  orders: number;
  revenue: number;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data;
    }
  });
}