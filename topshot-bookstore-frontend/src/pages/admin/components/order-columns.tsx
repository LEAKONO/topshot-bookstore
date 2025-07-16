import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types/admin";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
  },
  {
    accessorKey: "customerInfo.name",
    header: "Customer",
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => `$${row.getValue("total")}`
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge variant={
          status === 'completed' ? 'default' :
          status === 'pending' ? 'secondary' : 'destructive'
        }>
          {status}
        </Badge>
      );
    }
  }
];