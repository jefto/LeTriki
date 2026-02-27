import React, { useRef } from "react";
import { LoadingSpinner, ErrorAlert } from '../components/common';
import {
    AnalyseFilters,
    AnalyseStatistics,
    AnalyseChart,
    AnalyseDataTable
} from '../components/analyse';
import { useAnalyseHistorique } from '../hooks/useAnalyseHistorique';

export default function AnalyseHistorique() {
    const plotlyRef = useRef(null);

    const {
        loading,
        error,
        startDate,
        endDate,
        resample,
        chartType,
        showGraph,
        rawData,
        statistics,
        peaksData,
        troughsData,
        peaksTroughsLoading,
        currentPage,
        rowsPerPage,
        setStartDate,
        setEndDate,
        setResample,
        setChartType,
        setCurrentPage,
        handleSearch,
        getVisualization,
        handleExportPNG,
        handleExportCSV,
        handleExportExcel
    } = useAnalyseHistorique();

    const visualization = getVisualization();

    return (
        <div className="p-6 md:p-8 bg-[#F8F9FA] min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <p className="text-gray-500 text-sm font-poppins mb-1">Exploration et analyse des données historiques</p>
                <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                    Analyse Historique
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>

            {/* Formulaire de recherche */}
            <AnalyseFilters
                startDate={startDate}
                endDate={endDate}
                resample={resample}
                chartType={chartType}
                loading={loading}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onResampleChange={setResample}
                onChartTypeChange={setChartType}
                onSearch={handleSearch}
            />

            {/* Message d'erreur */}
            <ErrorAlert message={error} />

            {/* Indicateur de chargement */}
            {loading && <LoadingSpinner className="py-20" />}

            {/* Statistiques dynamiques */}
            {showGraph && statistics && !loading && (
                <AnalyseStatistics
                    statistics={statistics}
                    peaksData={peaksData}
                    troughsData={troughsData}
                />
            )}

            {/* Visualisation */}
            {showGraph && visualization && (
                <AnalyseChart
                    plotlyRef={plotlyRef}
                    visualization={visualization}
                    chartType={chartType}
                    peaksTroughsLoading={peaksTroughsLoading}
                    peaksData={peaksData}
                    troughsData={troughsData}
                    onExportPNG={() => handleExportPNG(plotlyRef)}
                    onExportCSV={handleExportCSV}
                    onExportExcel={handleExportExcel}
                />
            )}

            {/* Tableau des données brutes */}
            {showGraph && rawData.length > 0 && !loading && (
                <AnalyseDataTable
                    rawData={rawData}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onExportExcel={handleExportExcel}
                />
            )}
        </div>
    );
}