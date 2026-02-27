import React, { useRef } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaChartLine } from "react-icons/fa";
import { MdShowChart, MdAccessTime } from "react-icons/md";
import {
    PrevisionForm,
    PrevisionStatCard,
    PrevisionChart,
    PrevisionTable
} from '../components/prevision';
import { usePrevision24h } from '../hooks/usePrevision24h';

export default function Prevision24h() {
    const plotlyRef = useRef(null);

    const {
        loading,
        error,
        showNotification,
        successMessage,
        horizon,
        model,
        predictionData,
        detailedData,
        predictionStats,
        apiResponse,
        setHorizon,
        setModel,
        handleRefreshPrediction,
        handleExportPNG,
        handleExportCSV,
        handleExportExcel
    } = usePrevision24h();

    return (
        <div className="p-6 md:p-8 bg-[#F8F9FA] min-h-screen">
            {/* Notification Toast - Erreur */}
            {showNotification && error && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                    <FaExclamationTriangle className="text-2xl" />
                    <div>
                        <p className="font-semibold">{error}</p>
                        <p className="text-sm text-red-500">Vérifiez vos paramètres ou réessayez.</p>
                    </div>
                </div>
            )}

            {/* Notification Toast - Succès */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                    <FaCheckCircle className="text-2xl" />
                    <p className="font-semibold">{successMessage}</p>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <p className="text-gray-500 text-sm font-poppins mb-1">Génération et analyse des prévisions</p>
                <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                    Prévision 24h
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>

            {/* Grid principale : Formulaire + Résultats */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
                {/* Section Formulaire (1/4) */}
                <div className="xl:col-span-1">
                    <PrevisionForm
                        horizon={horizon}
                        model={model}
                        loading={loading}
                        onHorizonChange={setHorizon}
                        onModelChange={setModel}
                        onRefresh={handleRefreshPrediction}
                    />
                </div>

                {/* Section Résultats (3/4) */}
                <div className="xl:col-span-3 space-y-8">
                    {/* Statistiques rapides */}
                    {predictionStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <PrevisionStatCard
                                title="Minimum"
                                value={predictionStats.min}
                                unit="kWh"
                                icon={<MdShowChart />}
                                color="text-green-600"
                            />
                            <PrevisionStatCard
                                title="Maximum"
                                value={predictionStats.max}
                                unit="kWh"
                                icon={<MdShowChart />}
                                color="text-red-600"
                            />
                            <PrevisionStatCard
                                title="Moyenne"
                                value={predictionStats.avg}
                                unit="kWh"
                                icon={<FaChartLine />}
                                color="text-[#FDB913]"
                            />
                            <PrevisionStatCard
                                title="Heures prédites"
                                value={predictionStats.count}
                                unit="h"
                                icon={<MdAccessTime />}
                                color="text-[#E3001B]"
                            />
                        </div>
                    )}

                    {/* Graphique principal */}
                    <PrevisionChart
                        plotlyRef={plotlyRef}
                        loading={loading}
                        predictionData={predictionData}
                        onExportPNG={() => handleExportPNG(plotlyRef)}
                        onExportCSV={handleExportCSV}
                        onExportExcel={handleExportExcel}
                    />
                </div>
            </div>

            {/* Tableau des prévisions détaillées */}
            {predictionData && detailedData.length > 0 && (
                <PrevisionTable
                    detailedData={detailedData}
                    predictionStats={predictionStats}
                    lastTimestamp={apiResponse?.last_timestamp}
                    onExportExcel={handleExportExcel}
                />
            )}
        </div>
    );
}

