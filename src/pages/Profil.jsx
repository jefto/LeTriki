export default function Profil() {
    return (
        <div className="p-6 md:p-8 bg-[#F8F9FA] min-h-screen">
            <div className="mb-8">
                <p className="text-gray-500 text-sm font-poppins mb-1">Gestion de votre compte</p>
                <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">Profil</h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <p className="text-gray-600">Gérez votre profil utilisateur</p>
            </div>
        </div>
    );
}

