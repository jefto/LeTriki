import React from 'react';

export default function ChartCard({ title, children, icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="text-[#E3001B] text-2xl">
                    {icon}
                </div>
                <h3 className="text-gray-900 font-bold text-lg font-poppins">{title}</h3>
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}

