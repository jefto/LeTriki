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
        <div className="w-72 bg-gradient-to-b from-tertiary to-blue-900 text-white h-screen flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 pb-4">
                <h1 className="text-3xl font-poppins font-bold text-Left mb-4 text-secondary">
                    LeTriki
                </h1>
                <div className="w-full h-0.5 bg-white/30"></div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                                isActive
                                    ? 'bg-secondary text-tertiary shadow-lg font-semibold'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={isActive ? 'text-tertiary' : 'text-white/70 group-hover:text-white'}>
                                    {item.icon}
                                </span>
                                <span className="font-poppins">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20">
                <div className="flex items-center justify-between gap-24">
                    <NavLink
                        to="/parametres"
                        className={({ isActive }) =>
                            `flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                                isActive
                                    ? 'bg-secondary text-tertiary shadow-lg'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-110'
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
                                    ? 'bg-secondary text-tertiary shadow-lg'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
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