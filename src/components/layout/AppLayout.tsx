import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-auto">
                <Navbar />
                <main className="flex-1 p-6 md:p-8 bg-muted/20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
