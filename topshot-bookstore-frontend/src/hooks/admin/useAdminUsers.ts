// src/hooks/useAdminUsers.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { User } from "@/types/admin";

export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users');
      if (!res.data) {
        throw new Error('No data received');
      }
      return res.data;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5 
  });
}