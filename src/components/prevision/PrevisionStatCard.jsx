import React from 'react';

export default function PrevisionStatCard({ title, value, unit, icon, color }) {
    return (
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${color}`}>{icon}</span>
                <span className="text-gray-500 text-xs font-medium">{title}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">{value}</span>
                <span className="text-gray-500 text-xs">{unit}</span>
            </div>
        </div>
    );
}

