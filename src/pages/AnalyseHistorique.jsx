import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaFileCsv, FaFileExcel, FaFileExport, FaFileImage, FaHistory, FaSearch, FaSpinner, FaChartLine, FaChartBar, FaTh, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { MdShowChart } from "react-icons/md";
import { BsCalendarDate } from "react-icons/bs";
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist-min';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useSeries } from '../hooks/useSeries';
import { AnalyticsService } from '../services/AnalyticsService';
import {
    transformSeriesData,
    calculateStatistics,
    getPlotlyLayout
} from '../utils/dataTransformers';

export default function AnalyseHistorique() {
    // Référence pour le graphique Plotly (export PNG)
    const plotlyRef = useRef(null);

    // Hook pour récupérer les données API
    const { series, loading, error, fetchSeries } = useSeries();

    // États pour les filtres
    const [startDate, setStartDate] = useState('2017-12-25');
    const [endDate, setEndDate] = useState('2017-12-31');
    const [resample, setResample] = useState('H'); // Par défaut : horaire
    const [typeConsommation, setTypeConsommation] = useState('CONSOMMATION_TOTALE');
    const [chartType, setChartType] = useState('line'); // 'line', 'boxplot', 'heatmap'

    // États pour les données transformées
    const [transformedData, setTransformedData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [showGraph, setShowGraph] = useState(false);

    // États pour les peaks et troughs
    const [peaksData, setPeaksData] = useState(null);
    const [troughsData, setTroughsData] = useState(null);
    const [peaksTroughsLoading, setPeaksTroughsLoading] = useState(false);

    // États pour la pagination du tableau
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // Fonction pour charger les données depuis l'API
    const handleSearch = async () => {
        if (!startDate || !endDate) {
            alert('Veuillez sélectionner une date de début et une date de fin');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert('La date de fin doit être postérieure à la date de début');
            return;
        }

        setShowGraph(false);
        setPeaksData(null);
        setTroughsData(null);

        try {
            await fetchSeries(startDate, endDate, resample, typeConsommation);

            setPeaksTroughsLoading(true);
            try {
                const peaksTroughsResponse = await AnalyticsService.getAnalyticsPeaksTroughs(
                    startDate,
                    endDate,
                    resample,
                    typeConsommation,
                    null,
                    1
                );

                if (peaksTroughsResponse.data) {
                    if (peaksTroughsResponse.data.peaks) setPeaksData(peaksTroughsResponse.data.peaks);
                    if (peaksTroughsResponse.data.troughs) setTroughsData(peaksTroughsResponse.data.troughs);
                }
            } catch (peaksError) {
                console.warn('⚠️ Impossible de récupérer les peaks/troughs:', peaksError.message);
            } finally {
                setPeaksTroughsLoading(false);
            }
        } catch (err) {
            alert('Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue'));
        }
    };

    // Transformer et préparer les données
    useEffect(() => {
        if (!series) {
            setTransformedData(null);
            setRawData([]);
            setStatistics(null);
            setShowGraph(false);
            return;
        }

        setCurrentPage(1);

        const tableauDonnees = transformSeriesData(series, resample);

        if (tableauDonnees && tableauDonnees.length > 0) {
            setRawData(tableauDonnees);
        } else {
            setRawData([]);
        }

        const valuesArray = series.values || series.y;

        if (valuesArray && Array.isArray(valuesArray) && valuesArray.length > 0) {
            const stats = calculateStatistics(valuesArray);
            setStatistics(stats);
        } else {
            setStatistics(null);
        }

        if (tableauDonnees && tableauDonnees.length > 0) {
            const xData = tableauDonnees.map(row => new Date(row.timestamp)); // Utiliser des objets Date pour l'axe
            const yData = tableauDonnees.map(row => row.consommation);

            const plotlyData = [{
                x: xData,
                y: yData,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Consommation',
                line: { color: '#E3001B', width: 3 },
                marker: {
                    color: '#E3001B',
                    size: 6,
                    line: { color: '#FDB913', width: 1 }
                },
                fill: 'tonexty',
                fillcolor: 'rgba(227, 0, 27, 0.1)',
                hovertemplate: '<b>%{x|%d/%m/%y %Hh}</b><br>Consommation: %{y:.1f} MW<extra></extra>'
            }];

            setTransformedData(plotlyData);
            setShowGraph(true);
        } else {
            setTransformedData(null);
            setShowGraph(false);
        }
    }, [series, resample]);

    // Génération des visualisations
    const getVisualization = () => {
        if (!transformedData || !rawData || rawData.length === 0) return null;

        let title = 'Consommation Horaire';
        let plotData = [];
        let layout = {};

        const formatPeakDateForChart = (peak) => {
            const rawDate = peak.time || peak.timestamp || peak.date || peak.index;
            if (!rawDate) return null;
            return new Date(rawDate);
        };

        if (chartType === 'line') {
            plotData = [...transformedData];

            if (peaksData && peaksData.length > 0) {
                const peaksX = peaksData.map(p => formatPeakDateForChart(p)).filter(x => x !== null);
                const peaksY = peaksData.map(p => p.value || p.y || p.CONSOMMATION_TOTALE);
                if (peaksX.length > 0) {
                    plotData.push({
                        x: peaksX,
                        y: peaksY,
                        type: 'scatter',
                        mode: 'markers',
                        name: 'Pics (Max)',
                        marker: { color: '#E3001B', size: 12, symbol: 'triangle-up', line: { color: '#ffffff', width: 2 } },
                        hovertemplate: '<b>🔺 Pic Maximum</b><br>Date: %{x|%d/%m/%y %Hh}<br>Valeur: %{y:.2f} MW<extra></extra>'
                    });
                }
            }

            if (troughsData && troughsData.length > 0) {
                const troughsX = troughsData.map(t => formatPeakDateForChart(t)).filter(x => x !== null);
                const troughsY = troughsData.map(t => t.value || t.y || t.CONSOMMATION_TOTALE);
                if (troughsX.length > 0) {
                    plotData.push({
                        x: troughsX,
                        y: troughsY,
                        type: 'scatter',
                        mode: 'markers',
                        name: 'Creux (Min)',
                        marker: { color: '#FDB913', size: 12, symbol: 'triangle-down', line: { color: '#ffffff', width: 2 } },
                        hovertemplate: '<b>🔻 Creux Minimum</b><br>Date: %{x|%d/%m/%y %Hh}<br>Valeur: %{y:.2f} MW<extra></extra>'
                    });
                }
            }

            layout = {
                xaxis: { 
                    title: { text: 'Date / Heure', font: { size: 14, weight: 'bold' }, standoff: 20 },
                    type: 'date',
                    rangeslider: { visible: true },
                    rangeselector: {
                        buttons: [
                            {count: 1, label: '1j', step: 'day', stepmode: 'backward'},
                            {count: 7, label: '1s', step: 'day', stepmode: 'backward'},
                            {count: 1, label: '1m', step: 'month', stepmode: 'backward'},
                            {step: 'all'}
                        ]
                    }
                },
                yaxis: {
                    title: { text: 'Consommation (MW)', font: { size: 14, weight: 'bold' }, standoff: 20 }
                }
            };

        } else if (chartType === 'boxplot') {
            const uniqueDates = [...new Set(rawData.map(r => r.date))];
            plotData = uniqueDates.map((date, index) => {
                const dayData = rawData.filter(r => r.date === date);
                return {
                    y: dayData.map(r => r.consommation),
                    type: 'box',
                    name: date,
                    marker: { color: index % 2 === 0 ? '#E3001B' : '#FDB913' },
                    boxpoints: 'all',
                    jitter: 0.3,
                    pointpos: -1.8
                };
            });
            
            layout = {
                title: 'Distribution journalière de la consommation',
                xaxis: { 
                    title: { text: 'Jour', font: { size: 14, weight: 'bold' }, standoff: 20 },
                    tickangle: -45 
                },
                yaxis: {
                    title: { text: 'Consommation (MW)', font: { size: 14, weight: 'bold' }, standoff: 20 }
                },
                showlegend: false
            };

        } else if (chartType === 'heatmap') {
            const dates = [...new Set(rawData.map(r => r.date))].sort();
            const hours = [...new Set(rawData.map(r => r.periode.split(' ')[1]))].sort();

            const zData = hours.map(hour => {
                return dates.map(date => {
                    const point = rawData.find(r => r.date === date && r.periode.includes(hour));
                    return point ? point.consommation : null;
                });
            });

            plotData = [{
                z: zData,
                x: dates,
                y: hours,
                type: 'heatmap',
                colorscale: [
                    [0, '#FFF3CD'],
                    [0.25, '#FDB913'],
                    [0.5, '#FF6B35'],
                    [0.75, '#E3001B'],
                    [1, '#8B0000']
                ],
                colorbar: { title: 'MW' }
            }];

            layout = {
                title: 'Carte de chaleur (Jours vs Heures)',
                xaxis: { 
                    title: { text: 'Jour', font: { size: 14, weight: 'bold' }, standoff: 20 },
                    tickangle: -45 
                },
                yaxis: { 
                    title: { text: 'Heure', font: { size: 14, weight: 'bold' }, standoff: 20 },
                    tickangle: 0, 
                    automargin: true, 
                    dtick: 2 
                }
            };
        }

        return {
            type: chartType,
            title: title,
            data: plotData,
            layout: layout
        };
    };

    // ========== FONCTIONS D'EXPORT ==========
    const handleExportPNG = () => {
        if (!plotlyRef.current || !plotlyRef.current.el) {
            alert('Aucun graphique à exporter');
            return;
        }
        Plotly.downloadImage(plotlyRef.current.el, {
            format: 'png',
            filename: `analyse_historique_${startDate}_${endDate}`,
            width: 1200,
            height: 600,
            scale: 2
        });
    };

    const handleExportCSV = () => {
        if (!rawData || rawData.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }
        const headers = ['Période', 'Consommation (MW)'];
        const rows = rawData.map(row => [row.periode, row.consommation]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analyse_historique_${startDate}_${endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportExcel = () => {
        if (!rawData || rawData.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }
        const excelData = rawData.map(row => ({
            'Période': row.periode,
            'Consommation (MW)': parseFloat(row.consommation)
        }));
        if (statistics) {
            excelData.push({});
            excelData.push({ 'Période': 'STATISTIQUES', 'Consommation (MW)': '' });
            excelData.push({ 'Période': 'Moyenne', 'Consommation (MW)': parseFloat(statistics.moyenne) });
            excelData.push({ 'Période': 'Écart-type', 'Consommation (MW)': parseFloat(statistics.ecartType) });
            excelData.push({ 'Période': 'Pic Maximum', 'Consommation (MW)': parseFloat(statistics.picMax) });
        }
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analyse Historique');
        worksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.writeFile(workbook, `analyse_historique_${startDate}_${endDate}.xlsx`);
    };

    const ChartCard = ({ title, children, icon }) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
                <div className="text-[#E3001B] text-2xl">
                    {icon}
                </div>
                <h3 className="text-gray-900 font-bold text-lg font-poppins">{title}</h3>
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    );

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
                            onChange={(e) => setStartDate(e.target.value)}
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
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                        />
                    </div>

                    {/* Intervalle de période */}
                    <div>
                        <label className="block text-gray-600 font-semibold mb-2">Intervalle</label>
                        <select
                            value={resample}
                            onChange={(e) => setResample(e.target.value)}
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
                        onChange={(e) => setChartType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                    >
                        <option value="line">Ligne - Évolution temporelle</option>
                        <option value="boxplot">Boxplot - Distribution statistique</option>
                        <option value="heatmap">Heatmap - Concentration par heure/jour</option>
                    </select>
                </div>

                {/* Bouton Rechercher */}
                <button
                    onClick={handleSearch}
                    disabled={!startDate || !endDate || loading}
                    className="w-full md:w-auto bg-[#E3001B] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaSearch className="text-xl" />
                    {loading ? 'Chargement...' : 'Rechercher'}
                </button>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
                    <p className="font-semibold">⚠️ Erreur: {error}</p>
                </div>
            )}

            {/* Indicateur de chargement */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-[#E3001B] text-6xl mx-auto mb-4" />
                        <p className="text-gray-600 text-xl font-semibold">Chargement des données...</p>
                    </div>
                </div>
            )}

            {/* Statistiques dynamiques */}
            {showGraph && statistics && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <h2 className="text-gray-500 font-semibold mb-2 text-sm">Moyenne</h2>
                        <p className="text-gray-900 font-bold text-2xl font-poppins">{statistics.moyenne} <span className="text-sm text-[#E3001B]">MW</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <h2 className="text-gray-500 font-semibold mb-2 text-sm">Écart-type</h2>
                        <p className="text-gray-900 font-bold text-2xl font-poppins">{statistics.ecartType} <span className="text-sm text-[#FDB913]">MW</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <h2 className="text-gray-500 font-semibold mb-2 text-sm flex items-center gap-2">
                            <FaArrowUp className="text-[#E3001B]" /> Pics Détectés
                        </h2>
                        <p className="text-gray-900 font-bold text-2xl font-poppins">
                            {peaksData ? peaksData.length : 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Max: {statistics.picMax} MW</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <h2 className="text-gray-500 font-semibold mb-2 text-sm flex items-center gap-2">
                            <FaArrowDown className="text-[#FDB913]" /> Creux Détectés
                        </h2>
                        <p className="text-gray-900 font-bold text-2xl font-poppins">
                            {troughsData ? troughsData.length : 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Min: {statistics.picMin} MW</p>
                    </div>
                </div>
            )}

            {/* Visualisations dynamiques */}
            {showGraph && (() => {
                const visualization = getVisualization();
                if (!visualization) return null;

                return (
                    <ChartCard
                        title={visualization.title}
                        icon={<MdShowChart />}
                    >
                        {/* Boutons d'export */}
                        <div className="flex justify-end items-center gap-2 mb-4">
                            <button
                                onClick={handleExportPNG}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                            >
                                <FaFileImage /> PNG
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                            >
                                <FaFileCsv /> CSV
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                            >
                                <FaFileExcel /> Excel
                            </button>
                        </div>

                        {/* Indicateur de statut peaks/troughs (uniquement pour Line Chart) */}
                        {chartType === 'line' && (
                            <div className="flex items-center gap-4 text-sm mb-4 justify-end">
                                {peaksTroughsLoading && (
                                    <span className="flex items-center gap-2 text-gray-500">
                                        <FaSpinner className="animate-spin" />
                                        Chargement pics/creux...
                                    </span>
                                )}
                                {peaksData && peaksData.length > 0 && (
                                    <span className="flex items-center gap-2 text-[#E3001B]">
                                        <span className="w-3 h-3 bg-[#E3001B] rounded-full"></span>
                                        {peaksData.length} pic{peaksData.length > 1 ? 's' : ''}
                                    </span>
                                )}
                                {troughsData && troughsData.length > 0 && (
                                    <span className="flex items-center gap-2 text-[#FDB913]">
                                        <span className="w-3 h-3 bg-[#FDB913] rounded-full"></span>
                                        {troughsData.length} creux
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Graphique Plotly */}
                        <div className="w-full h-[500px]">
                            <Plot
                                ref={plotlyRef}
                                data={visualization.data}
                                layout={{
                                    ...visualization.layout,
                                    margin: { t: 40, r: 50, b: 80, l: 80 },
                                    autosize: true,
                                    showlegend: true,
                                    legend: {
                                        orientation: 'h',
                                        yanchor: 'bottom',
                                        y: 1.02,
                                        xanchor: 'right',
                                        x: 1
                                    }
                                }}
                                style={{ width: '100%', height: '100%' }}
                                config={{
                                    displayModeBar: true,
                                    responsive: true,
                                    toImageButtonOptions: {
                                        format: 'png',
                                        filename: 'analyse_historique',
                                        height: 500,
                                        width: 800,
                                        scale: 1
                                    }
                                }}
                                useResizeHandler={true}
                            />
                        </div>
                    </ChartCard>
                );
            })()}

            {/* Tableau des données brutes */}
            {showGraph && rawData.length > 0 && !loading && (
                <div className="mt-8">
                    <ChartCard
                        title="Données brutes"
                        icon={<FaHistory />}
                    >
                        {/* Bouton Export Excel au-dessus du tableau */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 text-sm">
                                {rawData.length} enregistrement{rawData.length > 1 ? 's' : ''} au total
                            </span>
                            <button
                                onClick={handleExportExcel}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                            >
                                <FaFileExcel />
                                Exporter Excel
                            </button>
                        </div>

                        {/* Tableau */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-gray-700">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Période</th>
                                        <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Consommation (MW)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawData
                                        .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                        .map((row, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{row.periode}</td>
                                                <td className="py-3 px-4 text-right font-bold text-[#E3001B]">{row.consommation}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {rawData.length > rowsPerPage && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
                                {/* Info pagination */}
                                <div className="text-gray-500 text-sm">
                                    Affichage de{' '}
                                    <span className="font-semibold text-gray-700">
                                        {(currentPage - 1) * rowsPerPage + 1}
                                    </span>
                                    {' '}à{' '}
                                    <span className="font-semibold text-gray-700">
                                        {Math.min(currentPage * rowsPerPage, rawData.length)}
                                    </span>
                                    {' '}sur{' '}
                                    <span className="font-semibold text-gray-700">
                                        {rawData.length}
                                    </span>
                                    {' '}lignes
                                </div>

                                {/* Boutons de navigation */}
                                <div className="flex items-center gap-2">
                                    {/* Bouton Première page */}
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Première page"
                                    >
                                        <span className="text-sm font-medium">1</span>
                                    </button>

                                    {/* Bouton Précédent */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <FaChevronLeft className="text-sm" />
                                        <span className="hidden sm:inline text-sm">Précédent</span>
                                    </button>

                                    {/* Indicateur de page actuelle */}
                                    <div className="flex items-center gap-2 px-4">
                                        <span className="text-gray-500 text-sm">Page</span>
                                        <span className="bg-[#E3001B] text-white px-3 py-1 rounded-lg font-semibold text-sm">
                                            {currentPage}
                                        </span>
                                        <span className="text-gray-500 text-sm">sur {Math.ceil(rawData.length / rowsPerPage)}</span>
                                    </div>

                                    {/* Bouton Suivant */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(rawData.length / rowsPerPage)))}
                                        disabled={currentPage >= Math.ceil(rawData.length / rowsPerPage)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline text-sm">Suivant</span>
                                        <FaChevronRight className="text-sm" />
                                    </button>

                                    {/* Bouton Dernière page */}
                                    <button
                                        onClick={() => setCurrentPage(Math.ceil(rawData.length / rowsPerPage))}
                                        disabled={currentPage >= Math.ceil(rawData.length / rowsPerPage)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Dernière page"
                                    >
                                        <span className="text-sm font-medium">{Math.ceil(rawData.length / rowsPerPage)}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </div>
            )}
        </div>
    );
}