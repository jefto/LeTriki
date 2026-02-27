import React from 'react';
import { FaBolt, FaCalendarAlt, FaChartLine, FaBrain } from 'react-icons/fa';
import { MetricCard } from '../common';

export default function MetricsSection({ summaryData, predictionLoading, getNextHourPrediction }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <MetricCard
                title="Consommation totale du jour precedent"
                value={summaryData ? `${summaryData.prevDayTotal.toFixed(2)} MW` : "-- MW"}
                icon={<FaBolt />}
                iconColor="text-[#E3001B]"
                iconBg="bg-red-50"
            />
            <MetricCard
                title="Moyenne de la consommation hebdomadaire"
                value={summaryData ? `${summaryData.weeklyAvg.toFixed(2)} MW` : "-- MW"}
                icon={<FaCalendarAlt />}
                iconColor="text-[#FDB913]"
                iconBg="bg-yellow-50"
            />
            <MetricCard
                title="Moyenne de la consommation Mensuel"
                value={summaryData ? `${summaryData.monthlyAvg.toFixed(2)} MW` : "-- MW"}
                icon={<FaChartLine />}
                iconColor="text-[#E3001B]"
                iconBg="bg-red-50"
            />
            <MetricCard
                title="Prediction sur la consommation de la prochaine heure"
                value={(() => {
                    const pred = getNextHourPrediction();
                    if (pred) return `${pred.prediction.toFixed(2)} MW`;
                    return predictionLoading ? "Chargement..." : "-- MW";
                })()}
                icon={<FaBrain />}
                iconColor="text-[#FDB913]"
                iconBg="bg-yellow-50"
            />
        </div>
    );
}

