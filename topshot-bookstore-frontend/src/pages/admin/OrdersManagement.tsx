import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/order-columns";
import { useAdminOrders } from "@/hooks/admin/useAdminOrders";

export default function OrdersManagement() {
  const { data: orders, isLoading, error } = useAdminOrders();

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error loading orders: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orders Management</h1>
      <DataTable columns={columns} data={orders || []} />
    </div>
  );
}