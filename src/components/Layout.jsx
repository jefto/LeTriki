import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

export default function Layout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <SideBar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
}

