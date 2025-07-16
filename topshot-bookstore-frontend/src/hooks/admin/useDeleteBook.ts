import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api} from "@/utils/api";

export function useDeleteBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      api.delete(`/api/admin/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    }
  });
}