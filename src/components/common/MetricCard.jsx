import React from 'react';

export default function MetricCard({ title, value, icon, iconColor = "text-[#E3001B]", iconBg = "bg-red-50" }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100 overflow-hidden h-full flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1">
                <div className="text-gray-900 text-2xl font-bold font-poppins">{value}</div>
                <div className={`${iconBg} ${iconColor} p-2 rounded-lg text-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-500 text-xs font-poppins uppercase tracking-wider font-medium">{title}</h3>
        </div>
    );
}

