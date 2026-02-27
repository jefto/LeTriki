import React from 'react';
import { FaHistory, FaFileExcel } from 'react-icons/fa';
import { MdAccessTime } from 'react-icons/md';
import { ChartCard } from '../common';

export default function PrevisionTable({
    detailedData,
    predictionStats,
    lastTimestamp,
    onExportExcel
}) {
    if (!detailedData || detailedData.length === 0) return null;

    return (
        <ChartCard
            title="Détails des prévisions horaires"
            icon={<FaHistory />}
        >
            {/* Actions Header */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={onExportExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                    <FaFileExcel />
                    Exporter Excel
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-gray-700">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Heure</th>
                            <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Prévision (kWh)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailedData.map((row, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium flex items-center gap-2">
                                    <MdAccessTime className="text-gray-400" />
                                    {row.heure}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-[#FDB913]">{row.prevision}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Résumé en bas du tableau */}
            {predictionStats && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-6">
                        <span className="text-gray-500">
                            <strong className="text-gray-700">{predictionStats.count}</strong> heures prédites
                        </span>
                        <span className="text-gray-500">
                            Total: <strong className="text-gray-700">{predictionStats.total}</strong> kWh
                        </span>
                    </div>
                    <div className="text-gray-400">
                        Dernière mise à jour: {lastTimestamp ? new Date(lastTimestamp).toLocaleString('fr-FR') : '--'}
                    </div>
                </div>
            )}
        </ChartCard>
    );
}

