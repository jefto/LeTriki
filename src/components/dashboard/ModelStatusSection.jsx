import React from 'react';
import { FaBrain, FaCheckCircle } from 'react-icons/fa';
import { MdBarChart } from 'react-icons/md';
import { ChartCard } from '../common';

export default function ModelStatusSection({ modelMetrics, predictionLoading, currentHour, getNextHourPrediction }) {
    return (
        <ChartCard
            title="Module Prévision"
            icon={<FaBrain />}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Modèle Actif */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-[#FDB913] font-semibold mb-4 flex items-center gap-2">
                        <FaCheckCircle />
                        {modelMetrics ? 'Modèle Actif' : predictionLoading ? 'Chargement...' : 'En attente'}
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Prochaine Heure ({((currentHour + 1) % 24).toString().padStart(2, '0')}:00)</span>
                            <span className="text-[#FDB913] font-bold">
                                {(() => {
                                    const pred = getNextHourPrediction();
                                    return pred ? `${pred.prediction.toFixed(2)} MW` : '--';
                                })()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Métriques du Modèle */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-[#E3001B] font-semibold mb-4 flex items-center gap-2">
                        <MdBarChart />
                        Métriques du Modèle
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Précision (R²)</span>
                            <span className="text-green-600 font-bold">
                                {modelMetrics && modelMetrics.metrics
                                    ? `${(modelMetrics.metrics.R2 * 100).toFixed(1)}%`
                                    : '--'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">RMSE</span>
                            <span className="text-gray-900 font-bold">
                                {modelMetrics && modelMetrics.metrics
                                    ? `${modelMetrics.metrics.RMSE.toFixed(2)}`
                                    : '--'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">MAE</span>
                            <span className="text-gray-900 font-bold">
                                {modelMetrics && modelMetrics.metrics
                                    ? `${modelMetrics.metrics.MAE.toFixed(2)}`
                                    : '--'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Statut du Modèle */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                        <FaCheckCircle className="text-green-600" />
                        <span className="text-green-700 font-semibold">Statut du Modèle</span>
                    </div>
                    <p className="text-green-600 text-sm">
                        {modelMetrics
                            ? `Modèle entraîné sur ${modelMetrics.n_train?.toLocaleString() || 0} échantillons`
                            : 'Chargement des données du modèle...'}
                    </p>
                    {modelMetrics && (
                        <p className="text-green-600 text-sm mt-2">
                            Date de split: {modelMetrics.split_date || '--'}
                        </p>
                    )}
                </div>
            </div>
        </ChartCard>
    );
}

