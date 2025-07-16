import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { Book, Users, Package, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useAdminStats();

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center">Unauthorized access</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Books" 
          value={stats?.booksCount} 
          icon={<Book className="h-4 w-4" />} 
        />
        <StatCard 
          title="Total Users" 
          value={stats?.usersCount} 
          icon={<Users className="h-4 w-4" />} 
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.ordersCount} 
          icon={<Package className="h-4 w-4" />} 
        />
        <StatCard 
          title="Revenue" 
          value={`$${stats?.revenue || 0}`} 
          icon={<DollarSign className="h-4 w-4" />} 
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value || '-'}</div>
      </CardContent>
    </Card>
  );
}