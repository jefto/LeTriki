import React from 'react';
import { FaSpinner, FaSync, FaCogs } from 'react-icons/fa';

export default function PrevisionForm({
    horizon,
    model,
    loading,
    onHorizonChange,
    onModelChange,
    onRefresh
}) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-[#E3001B] text-2xl">
                    <FaCogs />
                </div>
                <h3 className="text-gray-900 font-bold text-xl font-poppins">Paramètres</h3>
            </div>

            <div className="space-y-5">
                {/* Horizon */}
                <div>
                    <label className="block text-gray-600 font-semibold mb-2 text-sm">
                        Horizon de prévision (heures)
                    </label>
                    <input
                        type="text"
                        value={horizon}
                        onChange={(e) => onHorizonChange(parseInt(e.target.value) || 24)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B] text-center text-lg font-bold"
                        placeholder="24"
                    />
                    <p className="text-gray-400 text-xs mt-1 text-center">1h à 168h (7 jours max)</p>
                </div>

                {/* Modèle */}
                <div>
                    <label className="block text-gray-600 font-semibold mb-2 text-sm">
                        Modèle de prédiction
                    </label>
                    <select
                        value={model}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                    >
                        <option value="catboost">CatBoost</option>
                    </select>
                </div>

                {/* Bouton Relancer */}
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
                        loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#E3001B] text-white hover:bg-[#c40018] hover:shadow-lg'
                    }`}
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Calcul en cours...
                        </>
                    ) : (
                        <>
                            <FaSync />
                            Relancer la prévision
                        </>
                    )}
                </button>

                {/* Info */}
                <p className="text-gray-400 text-xs text-center mt-4">
                    Les prévisions sont calculées automatiquement au chargement de la page
                </p>
            </div>
        </div>
    );
}

