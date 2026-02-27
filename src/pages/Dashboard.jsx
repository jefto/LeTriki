import React from 'react';
import { LoadingSpinner, ErrorAlert } from '../components/common';
import {
    DashboardHeader,
    MetricsSection,
    DailyComparisonChart,
    WeeklyConsumptionChart,
    CityDistributionChart,
    PredictionChart,
    MonthHeatmapChart,
    ModelStatusSection
} from '../components/dashboard';
import { useDashboardData } from '../hooks/useDashboardData';

export default function Dashboard() {
    const {
        loading,
        error,
        summaryData,
        dailyCurveData,
        weeklyHistData,
        predictionComboData,
        monthHeatmapData,
        modelMetrics,
        predictionLoading,
        currentHour,
        getNextHourPrediction
    } = useDashboardData();

    return (
        <div className="p-6 md:p-8 bg-[#F8F9FA] min-h-screen">
            {/* Header */}
            <DashboardHeader />

            {/* Loader global */}
            {loading && <LoadingSpinner className="py-20" />}

            {/* Message d'erreur */}
            <ErrorAlert message={error} />

            {/* Contenu principal */}
            {!loading && (
                <>
                    {/* Métriques principales */}
                    <MetricsSection
                        summaryData={summaryData}
                        predictionLoading={predictionLoading}
                        getNextHourPrediction={getNextHourPrediction}
                    />

                    <div className="space-y-6">
                        {/* Comparaison J-1 / J-2 */}
                        <DailyComparisonChart data={dailyCurveData} />

                        {/* Consommation Hebdo + Répartition Villes */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <WeeklyConsumptionChart data={weeklyHistData} />
                            <CityDistributionChart />
                        </div>

                        {/* Prévisions 24h */}
                        <PredictionChart data={predictionComboData} />

                        {/* Heatmap Mensuel */}
                        <MonthHeatmapChart data={monthHeatmapData} />
                    </div>

                    {/* Section Module Prévision */}
                    <div className="mt-6">
                        <ModelStatusSection
                            modelMetrics={modelMetrics}
                            predictionLoading={predictionLoading}
                            currentHour={currentHour}
                            getNextHourPrediction={getNextHourPrediction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

