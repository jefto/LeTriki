import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { BsCalendarDate } from 'react-icons/bs';

export default function AnalyseFilters({
    startDate,
    endDate,
    resample,
    chartType,
    loading,
    onStartDateChange,
    onEndDateChange,
    onResampleChange,
    onChartTypeChange,
    onSearch
}) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
            <h2 className="text-gray-900 font-bold text-xl font-poppins mb-6 flex items-center gap-2">
                <FaSearch className="text-[#E3001B]" />
                Recherche de données
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Date de début */}
                <div>
                    <label className="flex items-center gap-2 text-gray-600 font-semibold mb-2">
                        <BsCalendarDate className="text-[#E3001B] text-xl" />
                        Date de début
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                    />
                </div>

                {/* Date de fin */}
                <div>
                    <label className="flex items-center gap-2 text-gray-600 font-semibold mb-2">
                        <BsCalendarDate className="text-[#E3001B] text-xl" />
                        Date de fin
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                    />
                </div>

                {/* Intervalle de période */}
                <div>
                    <label className="block text-gray-600 font-semibold mb-2">Intervalle</label>
                    <select
                        value={resample}
                        onChange={(e) => onResampleChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                    >
                        <option value="H">Par heure</option>
                        <option value="30min">Par 30 min</option>
                        <option value="D">Par jour</option>
                        <option value="W">Par semaine</option>
                    </select>
                </div>
            </div>

            {/* Type de graphique */}
            <div className="mb-6">
                <label className="block text-gray-600 font-semibold mb-2">Type de graphique</label>
                <select
                    value={chartType}
                    onChange={(e) => onChartTypeChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                >
                    <option value="line">Ligne - Évolution temporelle</option>
                    <option value="boxplot">Boxplot - Distribution statistique</option>
                    <option value="heatmap">Heatmap - Concentration par heure/jour</option>
                </select>
            </div>

            {/* Bouton Rechercher */}
            <button
                onClick={onSearch}
                disabled={!startDate || !endDate || loading}
                className="w-full md:w-auto bg-[#E3001B] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FaSearch className="text-xl" />
                {loading ? 'Chargement...' : 'Rechercher'}
            </button>
        </div>
    );
}

