import React from 'react';
import { FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { MdSpeed, MdTrendingUp } from 'react-icons/md';
import { LoadingSpinner } from '../components/common';
import {
    ModelSelector,
    PerformanceMetricCard,
    R2Card,
    DataSplitChart,
    ModelConfigCard
} from '../components/performance';
import { usePerformanceModeles } from '../hooks/usePerformanceModeles';

export default function PerformanceModeles() {
    const {
        metricsData,
        loading,
        error,
        selectedModel,
        availableModels,
        handleModelChange,
        handleRefresh
    } = usePerformanceModeles();

    return (
        <div className="p-6 md:p-8 bg-[#F8F9FA] min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <p className="text-gray-500 text-sm font-poppins mb-1">Évaluation des performances</p>
                <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                    Performance Modèles
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>

            {/* Section Paramétrage du modèle */}
            <ModelSelector
                selectedModel={selectedModel}
                availableModels={availableModels}
                loading={loading}
                onModelChange={handleModelChange}
                onRefresh={handleRefresh}
            />

            {/* Loader global */}
            {loading && <LoadingSpinner className="py-20" />}

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
                    <FaExclamationTriangle className="text-2xl" />
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            {/* Contenu principal */}
            {!loading && metricsData && (
                <>
                    {/* Section KPIs - Métriques principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
                        <PerformanceMetricCard
                            title="RMSE"
                            value={metricsData.metrics?.RMSE?.toFixed(2) || '--'}
                            unit="MW"
                            description="Erreur quadratique moyenne"
                            icon={<MdSpeed />}
                            color="#E3001B"
                            bgColor="bg-red-50"
                        />
                        <PerformanceMetricCard
                            title="MAE"
                            value={metricsData.metrics?.MAE?.toFixed(2) || '--'}
                            unit="MW"
                            description="Erreur absolue moyenne"
                            icon={<MdTrendingUp />}
                            color="#FDB913"
                            bgColor="bg-yellow-50"
                        />
                        <PerformanceMetricCard
                            title="MAPE"
                            value={metricsData.metrics?.MAPE?.toFixed(2) || '--'}
                            unit="%"
                            description="Erreur en pourcentage"
                            icon={<FaChartLine />}
                            color="#E3001B"
                            bgColor="bg-red-50"
                        />
                        <PerformanceMetricCard
                            title="SMAPE"
                            value={metricsData.metrics?.SMAPE?.toFixed(2) || '--'}
                            unit="%"
                            description="MAPE symétrique"
                            icon={<FaChartLine />}
                            color="#FDB913"
                            bgColor="bg-yellow-50"
                        />
                        <R2Card value={metricsData.metrics?.R2 || 0} />
                    </div>

                    {/* Section Détails - Grid 2 colonnes */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Répartition des données (Pie Chart) */}
                        <DataSplitChart metricsData={metricsData} />

                        {/* Configuration du Modèle */}
                        <ModelConfigCard metricsData={metricsData} />
                    </div>
                </>
            )}
        </div>
    );
}