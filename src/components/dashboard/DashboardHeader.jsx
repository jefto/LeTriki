import React from 'react';

export default function DashboardHeader() {
    return (
        <div className="mb-8">
            <p className="text-gray-500 text-sm font-poppins mb-1">Bienvenue sur le tableau de bord</p>
            <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                Dashboard
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
        </div>
    );
}

