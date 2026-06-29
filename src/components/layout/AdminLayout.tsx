import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-auto">
        <Navbar />
        <main className="flex-1 bg-muted/20 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
