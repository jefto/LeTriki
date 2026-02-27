import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function AnalyseStatistics({ statistics, peaksData, troughsData }) {
    if (!statistics) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-gray-500 font-semibold mb-2 text-sm">Moyenne</h2>
                <p className="text-gray-900 font-bold text-2xl font-poppins">
                    {statistics.moyenne} <span className="text-sm text-[#E3001B]">MW</span>
                </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-gray-500 font-semibold mb-2 text-sm">Écart-type</h2>
                <p className="text-gray-900 font-bold text-2xl font-poppins">
                    {statistics.ecartType} <span className="text-sm text-[#FDB913]">MW</span>
                </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-gray-500 font-semibold mb-2 text-sm flex items-center gap-2">
                    <FaArrowUp className="text-[#E3001B]" /> Pics Détectés
                </h2>
                <p className="text-gray-900 font-bold text-2xl font-poppins">
                    {peaksData ? peaksData.length : 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max: {statistics.picMax} MW</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-gray-500 font-semibold mb-2 text-sm flex items-center gap-2">
                    <FaArrowDown className="text-[#FDB913]" /> Creux Détectés
                </h2>
                <p className="text-gray-900 font-bold text-2xl font-poppins">
                    {troughsData ? troughsData.length : 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Min: {statistics.picMin} MW</p>
            </div>
        </div>
    );
}

