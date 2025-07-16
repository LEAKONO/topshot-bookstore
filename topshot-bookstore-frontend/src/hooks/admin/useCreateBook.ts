import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api} from "@/utils/api";
import { Book } from "@/types/admin";

export function useCreateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (book: Omit<Book, '_id'>) => 
      api.post('/api/admin/books', book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    }
  });
}