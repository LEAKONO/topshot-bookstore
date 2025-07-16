import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useAdminBooks } from "@/hooks/admin/useAdminBooks";
import { Plus } from "lucide-react";
import { columns } from "./components/book-columns";
import { Link } from "react-router-dom";

export default function BooksManagement() {
  const { data: books, isLoading, error } = useAdminBooks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <Button asChild>
          <Link to="/admin/books/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div>Loading books...</div>
      ) : error ? (
        <div>Error loading books</div>
      ) : (
        <DataTable columns={columns} data={books || []} />
      )}
    </div>
  );
}