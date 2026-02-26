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
            {/* Sidebar avec flex-shrink-0 pour empêcher son rétrécissement */}
            <div className="flex-shrink-0 h-full">
                <SideBar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            </div>
            
            {/* Contenu principal fluide qui occupe tout l'espace restant */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden transition-all duration-300 relative">
                <Outlet />
            </main>
        </div>
    );
}