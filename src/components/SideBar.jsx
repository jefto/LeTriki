import { NavLink } from 'react-router-dom';
import { MdDashboard, MdHistory, MdShowChart } from 'react-icons/md';
import { IoMdTime, IoMdSettings } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';

export default function SideBar() {
    const menuItems = [
        { path: '/dashboard', icon: <MdDashboard size={24} />, label: 'Dashboard' },
        { path: '/prevision', icon: <IoMdTime size={24} />, label: 'Prévision 24h' },
        { path: '/analyse', icon: <MdHistory size={24} />, label: 'Analyse Historique' },
        { path: '/performance', icon: <MdShowChart size={24} />, label: 'Performance Modèles' }
    ];

    return (
        <div className="w-72 bg-white h-screen flex flex-col border-r border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-6 pb-4">
                <h1 className="text-3xl font-poppins font-bold text-left mb-4 text-[#E3001B]">
                    LeTriki
                </h1>
                <div className="w-full h-0.5 bg-gray-200"></div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                                isActive
                                    ? 'bg-red-50 text-[#E3001B] font-semibold border-l-4 border-[#E3001B]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:translate-x-1'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={isActive ? 'text-[#E3001B]' : 'text-gray-400 group-hover:text-gray-600'}>
                                    {item.icon}
                                </span>
                                <span className="font-poppins">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between gap-24">
                    <NavLink
                        to="/parametres"
                        className={({ isActive }) =>
                            `flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                                isActive
                                    ? 'bg-red-50 text-[#E3001B]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:scale-110'
                            }`
                        }
                        title="Paramètres"
                    >
                        <IoMdSettings size={24} />
                    </NavLink>

                    <NavLink
                        to="/profil"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 flex-1 ${
                                isActive
                                    ? 'bg-red-50 text-[#E3001B]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`
                        }
                    >
                        <FaUserCircle size={24} />
                        <span className="font-poppins font-medium">Profil</span>
                    </NavLink>
                </div>
            </div>

        </div>
    );
}