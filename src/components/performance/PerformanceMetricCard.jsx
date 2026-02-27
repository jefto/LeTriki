import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export default function PerformanceMetricCard({ title, value, unit, description, icon, color = "#E3001B", bgColor = "bg-red-50" }) {
    return (
        <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
                <div className={`${bgColor} p-2 rounded-full text-lg`} style={{ color }}>
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-500 text-xs font-poppins mb-1 uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline gap-1">
                <p className="text-gray-900 text-xl font-bold font-poppins">{value}</p>
                {unit && <span className="text-gray-500 text-xs">{unit}</span>}
            </div>
            {description && <p className="text-gray-400 text-[10px] font-poppins mt-0.5">{description}</p>}
        </div>
    );
}

export function R2Card({ value }) {
    const percentage = (value * 100).toFixed(0);
    const circumference = 2 * Math.PI * 30;
    const strokeDashoffset = circumference - (value * circumference);

    return (
        <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
                <div className="bg-green-50 text-green-600 p-2 rounded-full text-lg">
                    <FaCheckCircle />
                </div>
            </div>
            <h3 className="text-gray-500 text-xs font-poppins mb-1 uppercase tracking-wider">Coefficient R²</h3>

            {/* Jauge circulaire */}
            <div className="flex items-center justify-center my-2">
                <div className="relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                        {/* Cercle de fond */}
                        <circle
                            cx="40"
                            cy="40"
                            r="30"
                            stroke="#E5E7EB"
                            strokeWidth="6"
                            fill="none"
                        />
                        {/* Cercle de progression */}
                        <circle
                            cx="40"
                            cy="40"
                            r="30"
                            stroke="url(#gradient)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#E3001B" />
                                <stop offset="100%" stopColor="#FDB913" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{percentage}%</span>
                    </div>
                </div>
            </div>
            <p className="text-gray-400 text-[10px] font-poppins text-center">Variance expliquée</p>
        </div>
    );
}

