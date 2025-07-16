import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { Order } from "@/types/admin";

export function useAdminOrders() {
  return useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
     const response = await api.getAllOrders(); // ✅ Use the method you defined in ApiClient
      return response.data;
    }
  });
}