import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api} from "@/utils/api";
import { Book } from "@/types/admin";

export function useUpdateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...book }: { id: string } & Partial<Book>) => 
      api.put(`/api/admin/books/${id}`, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    }
  });
}