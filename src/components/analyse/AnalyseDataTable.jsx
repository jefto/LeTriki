import React from 'react';
import { FaHistory, FaFileExcel, FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import { ChartCard } from '../common';
import { AVAILABLE_LOCALITES } from '../../hooks/useAnalyseHistorique';

export default function AnalyseDataTable({
    rawData,
    localite,
    currentPage,
    rowsPerPage,
    onPageChange,
    onExportExcel
}) {
    if (!rawData || rawData.length === 0) return null;

    const totalPages = Math.ceil(rawData.length / rowsPerPage);

    const isLocaliteSpecific = localite && localite !== 'CONSOMMATION_TOTALE';
    const localiteLabel = isLocaliteSpecific
        ? AVAILABLE_LOCALITES.find(l => l.value === localite)?.label || localite
        : null;
    const colHeader = localiteLabel ? `Consommation ${localiteLabel} (MW)` : 'Consommation (MW)';
    const tableTitle = localiteLabel ? `Données brutes — ${localiteLabel}` : 'Données brutes';

    return (
        <div className="mt-8">
            <ChartCard title={tableTitle} icon={<FaHistory />}>
                {/* Localité badge + Bouton Export Excel */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">
                            {rawData.length} enregistrement{rawData.length > 1 ? 's' : ''} au total
                        </span>
                        {isLocaliteSpecific && (
                            <span className="flex items-center gap-1 text-xs font-semibold bg-red-50 text-[#E3001B] border border-red-200 px-2 py-1 rounded-full">
                                <FaMapMarkerAlt className="text-[10px]" />
                                {localiteLabel}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onExportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                        <FaFileExcel />
                        Exporter Excel
                    </button>
                </div>

                {/* Tableau */}
                <div className="overflow-x-auto">
                    <table className="w-full text-gray-700">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Période</th>
                                <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">{colHeader}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawData
                                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                .map((row, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{row.periode}</td>
                                        <td className="py-3 px-4 text-right font-bold text-[#E3001B]">{row.consommation}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {rawData.length > rowsPerPage && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
                        {/* Info pagination */}
                        <div className="text-gray-500 text-sm">
                            Affichage de{' '}
                            <span className="font-semibold text-gray-700">
                                {(currentPage - 1) * rowsPerPage + 1}
                            </span>
                            {' '}à{' '}
                            <span className="font-semibold text-gray-700">
                                {Math.min(currentPage * rowsPerPage, rawData.length)}
                            </span>
                            {' '}sur{' '}
                            <span className="font-semibold text-gray-700">
                                {rawData.length}
                            </span>
                            {' '}lignes
                        </div>

                        {/* Boutons de navigation */}
                        <div className="flex items-center gap-2">
                            {/* Bouton Première page */}
                            <button
                                onClick={() => onPageChange(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                title="Première page"
                            >
                                <span className="text-sm font-medium">1</span>
                            </button>

                            {/* Bouton Précédent */}
                            <button
                                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                            >
                                <FaChevronLeft className="text-sm" />
                                <span className="hidden sm:inline text-sm">Précédent</span>
                            </button>

                            {/* Indicateur de page actuelle */}
                            <div className="flex items-center gap-2 px-4">
                                <span className="text-gray-500 text-sm">Page</span>
                                <span className="bg-[#E3001B] text-white px-3 py-1 rounded-lg font-semibold text-sm">
                                    {currentPage}
                                </span>
                                <span className="text-gray-500 text-sm">sur {totalPages}</span>
                            </div>

                            {/* Bouton Suivant */}
                            <button
                                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                            >
                                <span className="hidden sm:inline text-sm">Suivant</span>
                                <FaChevronRight className="text-sm" />
                            </button>

                            {/* Bouton Dernière page */}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                title="Dernière page"
                            >
                                <span className="text-sm font-medium">{totalPages}</span>
                            </button>
                        </div>
                    </div>
                )}
            </ChartCard>
        </div>
    );
}
