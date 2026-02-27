import React from 'react';
import { FaCogs, FaDatabase, FaCheckCircle } from 'react-icons/fa';

export default function ModelConfigCard({ metricsData }) {
    if (!metricsData) return null;

    const total = metricsData.n_train + metricsData.n_val + metricsData.n_test;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-[#E3001B] text-2xl">
                    <FaCogs />
                </div>
                <h3 className="text-gray-900 font-bold text-xl font-poppins">Configuration du Modèle</h3>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-[#E3001B] font-semibold mb-4 flex items-center gap-2">
                    <FaDatabase />
                    Paramètres CatBoost
                </h4>

                {/* Tableau des paramètres */}
                <div className="space-y-3">
                    {metricsData.params && Object.entries(metricsData.params).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <span className="text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-gray-900 font-bold bg-white px-3 py-1 rounded-lg border border-gray-200">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    Résumé du Modèle
                </h4>
                <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                        <span className="font-medium">Type :</span> CatBoost Regressor
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Horizon :</span> {metricsData.params?.horizon || 24} heures
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Lags utilisés :</span> {metricsData.params?.lags || 72}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Données totales :</span> {total.toLocaleString()} échantillons
                    </p>
                </div>
            </div>

            {/* Badge de performance */}
            <div className="mt-6 flex justify-center">
                <div className={`px-6 py-3 rounded-full font-semibold text-lg flex items-center gap-2 ${
                    metricsData.metrics?.R2 >= 0.7 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : metricsData.metrics?.R2 >= 0.5 
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    <FaCheckCircle />
                    {metricsData.metrics?.R2 >= 0.7
                        ? 'Modèle Performant'
                        : metricsData.metrics?.R2 >= 0.5
                            ? 'Modèle Acceptable'
                            : 'Modèle à Améliorer'}
                </div>
            </div>
        </div>
    );
}

