import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

export default function Layout() {
    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

