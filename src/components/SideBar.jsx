import { NavLink } from 'react-router-dom';
import { MdDashboard, MdHistory, MdShowChart, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { IoMdTime, IoMdSettings } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';

export default function SideBar({ collapsed, onToggle }) {
    const menuItems = [
        { path: '/dashboard', icon: <MdDashboard size={24} />, label: 'Dashboard' },
        { path: '/prevision', icon: <IoMdTime size={24} />, label: 'Prévision 24h' },
        { path: '/analyse', icon: <MdHistory size={24} />, label: 'Analyse Historique' },
        { path: '/performance', icon: <MdShowChart size={24} />, label: 'Performance Modèles' }
    ];

    return (
        <div className={`${collapsed ? 'w-20' : 'w-72'} bg-white h-screen flex flex-col border-r border-gray-200 shadow-sm transition-all duration-300 relative`}>
            {/* Bouton Toggle - Positionné au milieu */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-300 z-10"
                title={collapsed ? "Étendre la barre latérale" : "Réduire la barre latérale"}
            >
                {collapsed ? (
                    <MdChevronRight size={20} className="text-gray-500" />
                ) : (
                    <MdChevronLeft size={20} className="text-gray-500" />
                )}
            </button>

            {/* Header */}
            <div className={`p-6 pb-4 ${collapsed ? 'px-3' : ''}`}>
                <h1 className={`text-3xl font-poppins font-bold text-left mb-4 text-[#E3001B] transition-all duration-300 ${collapsed ? 'text-center text-xl' : ''}`}>
                    {collapsed ? 'LT' : 'LeTriki'}
                </h1>
                <div className="w-full h-0.5 bg-gray-200"></div>
            </div>

            {/* Menu Items */}
            <nav className={`flex-1 py-6 space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={collapsed ? item.label : ''}
                        className={({ isActive }) =>
                            `flex items-center ${collapsed ? 'justify-center' : 'gap-4'} px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                                isActive
                                    ? `bg-red-50 text-[#E3001B] font-semibold ${collapsed ? '' : 'border-l-4 border-[#E3001B]'}`
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:translate-x-1'
                            } ${collapsed ? 'w-12 h-12 mx-auto rounded-full' : ''}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`${isActive ? 'text-[#E3001B]' : 'text-gray-400 group-hover:text-gray-600'} ${collapsed ? '' : ''}`}>
                                    {item.icon}
                                </span>
                                {!collapsed && <span className="font-poppins">{item.label}</span>}

                                {/* Tooltip au survol en mode replié */}
                                {collapsed && (
                                    <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-lg">
                                        {item.label}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className={`p-4 border-t border-gray-200 ${collapsed ? 'px-2' : ''}`}>
                <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between gap-24'}`}>
                    <NavLink
                        to="/parametres"
                        title="Paramètres"
                        className={({ isActive }) =>
                            `flex items-center justify-center p-3 rounded-xl transition-all duration-300 group relative ${
                                isActive
                                    ? 'bg-red-50 text-[#E3001B]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:scale-110'
                            } ${collapsed ? 'w-12 h-12 rounded-full' : ''}`
                        }
                    >
                        <IoMdSettings size={24} />
                        {collapsed && (
                            <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-lg">
                                Paramètres
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to="/profil"
                        title="Profil"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                                isActive
                                    ? 'bg-red-50 text-[#E3001B]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            } ${collapsed ? 'w-12 h-12 justify-center px-0 rounded-full' : 'flex-1'}`
                        }
                    >
                        <FaUserCircle size={24} />
                        {!collapsed && <span className="font-poppins font-medium">Profil</span>}
                        {collapsed && (
                            <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-lg">
                                Profil
                            </span>
                        )}
                    </NavLink>
                </div>
            </div>

        </div>
    );
}