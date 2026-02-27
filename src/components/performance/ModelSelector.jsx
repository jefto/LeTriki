import React from 'react';
import { FaSpinner, FaSync, FaCogs, FaCheckCircle } from 'react-icons/fa';

export default function ModelSelector({
    selectedModel,
    availableModels,
    loading,
    onModelChange,
    onRefresh
}) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-[#E3001B] text-2xl">
                    <FaCogs />
                </div>
                <h3 className="text-gray-900 font-bold text-lg font-poppins">Sélection du Modèle</h3>
            </div>

            <div className="flex flex-wrap items-end gap-6">
                {/* Sélecteur de modèle */}
                <div className="flex-1 min-w-[250px]">
                    <label className="block text-gray-600 font-semibold mb-2 text-sm">
                        Modèle de prédiction
                    </label>
                    <select
                        value={selectedModel}
                        onChange={(e) => onModelChange(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B] disabled:opacity-50"
                    >
                        {availableModels.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Bouton Rafraîchir */}
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                        loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#E3001B] text-white hover:bg-[#c40018] hover:shadow-lg'
                    }`}
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Chargement...
                        </>
                    ) : (
                        <>
                            <FaSync />
                            Rafraîchir
                        </>
                    )}
                </button>
            </div>

            {/* Info sur le modèle sélectionné */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                    <FaCheckCircle className="text-green-500" />
                    <span className="font-medium">
                        Modèle actif : <span className="text-[#E3001B] font-bold">{availableModels.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                    </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                    Les métriques affichées correspondent aux performances de ce modèle sur les données de test.
                </p>
            </div>
        </div>
    );
}

