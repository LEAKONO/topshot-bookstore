import { BookForm } from "./components/BookForm";
import { useAdminBook } from "@/hooks/admin/useAdminBook";
import { useParams } from "react-router-dom";
import { useCreateBook } from "@/hooks/admin/useCreateBook";
import { useUpdateBook } from "@/hooks/admin/useUpdateBook";

export default function BookFormPage() {
  const { id } = useParams();
  const { data: book, isLoading: isFetching } = useAdminBook(id);
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();

  const onSubmit = (values: any) => {
    if (id) {
      updateBook({ id, ...values });
    } else {
      createBook(values);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {id ? 'Edit Book' : 'Add New Book'}
      </h1>
      <BookForm 
        initialData={book} 
        onSubmit={onSubmit} 
        isLoading={isCreating || isUpdating} 
      />
    </div>
  );
}