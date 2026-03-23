import { useState, useEffect, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import * as XLSX from 'xlsx';
import { useSeries } from './useSeries';
import { AnalyticsService } from '../services/AnalyticsService';
import { transformSeriesData, calculateStatistics } from '../utils/dataTransformers';

const AVAILABLE_LOCALITES = [
    { value: 'CONSOMMATION_TOTALE', label: 'Consommation Totale' },
    { value: 'LOME', label: 'Lomé' },
    { value: 'ANFOIN', label: 'Anfoin' },
    { value: 'ATAKPAME', label: 'Atakpamé' },
    { value: 'KARA', label: 'Kara' },
    { value: 'SULZER1', label: 'Sulzer 1' },
    { value: 'SULZER2', label: 'Sulzer 2' },
    { value: 'CTL', label: 'CTL' },
    { value: 'KPIME', label: 'Kpimé' },
    { value: 'KARA_PROD', label: 'Kara Production' },
];

export { AVAILABLE_LOCALITES };

/**
 * Hook personnalisé pour gérer l'analyse historique
 */
export function useAnalyseHistorique() {
    const { series, loading: seriesLoading, error: seriesError, fetchSeries } = useSeries();

    // États pour les filtres
    const [startDate, setStartDate] = useState('2017-12-25');
    const [endDate, setEndDate] = useState('2017-12-31');
    const [resample, setResample] = useState('H');
    const [chartType, setChartType] = useState('line');
    const [localite, setLocalite] = useState('CONSOMMATION_TOTALE');

    // États pour les données de localité
    const [localiteLoading, setLocaliteLoading] = useState(false);
    const [localiteError, setLocaliteError] = useState(null);
    const [localiteSeriesOverride, setLocaliteSeriesOverride] = useState(null);

    // États pour les données transformées
    const [transformedData, setTransformedData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [showGraph, setShowGraph] = useState(false);

    // États pour les peaks et troughs
    const [peaksData, setPeaksData] = useState(null);
    const [troughsData, setTroughsData] = useState(null);
    const [peaksTroughsLoading, setPeaksTroughsLoading] = useState(false);

    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // Loading et error combinés
    const loading = seriesLoading || localiteLoading;
    const error = seriesError || localiteError;

    // Résample effectif : toujours 30min pour les localités spécifiques
    const effectiveResample = localite !== 'CONSOMMATION_TOTALE' ? '30min' : resample;

    // Fonction pour charger les données
    const handleSearch = useCallback(async () => {
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
        setLocaliteError(null);

        try {
            if (localite !== 'CONSOMMATION_TOTALE') {
                // Utiliser l'endpoint consommation_localite
                setLocaliteLoading(true);
                setLocaliteSeriesOverride(null);
                try {
                    const response = await AnalyticsService.getConsommationLocalite(localite, startDate, endDate);
                    if (response.data && response.data.data) {
                        const transformed = {
                            time_index: response.data.data.map(item => item.DATETIME),
                            y: response.data.data.map(item => item[localite] || 0)
                        };
                        setLocaliteSeriesOverride(transformed);
                    }
                } catch (err) {
                    setLocaliteError('Erreur lors du chargement des données de la localité: ' + (err.message || ''));
                } finally {
                    setLocaliteLoading(false);
                }

                // Charger également les peaks/troughs pour la localité (résample 30min)
                setPeaksTroughsLoading(true);
                try {
                    const peaksTroughsResponse = await AnalyticsService.getAnalyticsPeaksTroughs(
                        startDate,
                        endDate,
                        '30min',
                        localite,
                        null,
                        1
                    );
                    if (peaksTroughsResponse.data) {
                        if (peaksTroughsResponse.data.peaks) setPeaksData(peaksTroughsResponse.data.peaks);
                        if (peaksTroughsResponse.data.troughs) setTroughsData(peaksTroughsResponse.data.troughs);
                    }
                } catch (peaksError) {
                    console.warn('⚠️ Impossible de récupérer les peaks/troughs pour la localité:', peaksError.message);
                } finally {
                    setPeaksTroughsLoading(false);
                }
            } else {
                // Utiliser l'endpoint series classique
                setLocaliteSeriesOverride(null);
                await fetchSeries(startDate, endDate, resample, 'CONSOMMATION_TOTALE');

                // Charger également les peaks/troughs pour la conso totale
                setPeaksTroughsLoading(true);
                try {
                    const peaksTroughsResponse = await AnalyticsService.getAnalyticsPeaksTroughs(
                        startDate,
                        endDate,
                        resample,
                        'CONSOMMATION_TOTALE',
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
            }
        } catch (err) {
            alert('Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue'));
        }
    }, [startDate, endDate, resample, localite, fetchSeries]);

    // Transformer les données quand series ou localiteSeriesOverride changent
    useEffect(() => {
        const dataToProcess = localiteSeriesOverride || series;

        if (!dataToProcess) {
            setTransformedData(null);
            setRawData([]);
            setStatistics(null);
            setShowGraph(false);
            return;
        }

        setCurrentPage(1);
        const tableauDonnees = transformSeriesData(dataToProcess, effectiveResample);

        if (tableauDonnees && tableauDonnees.length > 0) {
            setRawData(tableauDonnees);
        } else {
            setRawData([]);
        }

        const valuesArray = dataToProcess.values || dataToProcess.y;
        if (valuesArray && Array.isArray(valuesArray) && valuesArray.length > 0) {
            const stats = calculateStatistics(valuesArray);
            setStatistics(stats);
        } else {
            setStatistics(null);
        }

        if (tableauDonnees && tableauDonnees.length > 0) {
            const xData = tableauDonnees.map(row => new Date(row.timestamp));
            const yData = tableauDonnees.map(row => row.consommation);

            const localiteLabel = localite !== 'CONSOMMATION_TOTALE'
                ? AVAILABLE_LOCALITES.find(l => l.value === localite)?.label || localite
                : 'Consommation Totale';

            const plotlyData = [{
                x: xData,
                y: yData,
                type: 'scatter',
                mode: 'lines+markers',
                name: localiteLabel,
                line: { color: '#E3001B', width: 3 },
                marker: { color: '#E3001B', size: 6, line: { color: '#FDB913', width: 1 } },
                fill: 'tonexty',
                fillcolor: 'rgba(227, 0, 27, 0.1)',
                hovertemplate: '<b>%{x|%d/%m/%y %Hh}</b><br>' + localiteLabel + ': %{y:.1f} MW<extra></extra>'
            }];

            setTransformedData(plotlyData);
            setShowGraph(true);
        } else {
            setTransformedData(null);
            setShowGraph(false);
        }
    }, [series, localiteSeriesOverride, effectiveResample, localite]);

    // Génération des visualisations
    const getVisualization = useCallback(() => {
        if (!transformedData || !rawData || rawData.length === 0) return null;

        const localiteLabel = localite !== 'CONSOMMATION_TOTALE'
            ? AVAILABLE_LOCALITES.find(l => l.value === localite)?.label || localite
            : null;

        let title = localiteLabel ? `Consommation - ${localiteLabel}` : 'Consommation Historique';
        let plotData = [];
        let layout = {};

        const formatPeakDateForChart = (peak) => {
            const rawDate = peak.time || peak.timestamp || peak.date || peak.index;
            if (!rawDate) return null;
            return new Date(rawDate);
        };

        if (chartType === 'line') {
            plotData = [...transformedData];

            // Peaks/troughs pour toutes les localités (CONSOMMATION_TOTALE et localités spécifiques)
            if (peaksData && peaksData.length > 0) {
                const peaksX = peaksData.map(p => formatPeakDateForChart(p)).filter(x => x !== null);
                // Supporte les formats : {value}, {y}, {LOME}, {CONSOMMATION_TOTALE}, etc.
                const peaksY = peaksData.map(p => p.value ?? p.y ?? p[localite] ?? p.CONSOMMATION_TOTALE);
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
                const troughsY = troughsData.map(t => t.value ?? t.y ?? t[localite] ?? t.CONSOMMATION_TOTALE);
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
                            { count: 1, label: '1j', step: 'day', stepmode: 'backward' },
                            { count: 7, label: '1s', step: 'day', stepmode: 'backward' },
                            { count: 1, label: '1m', step: 'month', stepmode: 'backward' },
                            { step: 'all' }
                        ]
                    }
                },
                yaxis: { title: { text: 'Consommation (MW)', font: { size: 14, weight: 'bold' }, standoff: 20 } }
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
                xaxis: { title: { text: 'Jour', font: { size: 14, weight: 'bold' }, standoff: 20 }, tickangle: -45 },
                yaxis: { title: { text: 'Consommation (MW)', font: { size: 14, weight: 'bold' }, standoff: 20 } },
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
                xaxis: { title: { text: 'Jour', font: { size: 14, weight: 'bold' }, standoff: 20 }, tickangle: -45 },
                yaxis: { title: { text: 'Heure', font: { size: 14, weight: 'bold' }, standoff: 20 }, tickangle: 0, automargin: true, dtick: 2 }
            };
        }

        return { type: chartType, title, data: plotData, layout };
    }, [transformedData, rawData, chartType, peaksData, troughsData, localite]);

    // Nom de fichier avec localité
    const getExportFilename = useCallback((ext) => {
        const locPart = localite !== 'CONSOMMATION_TOTALE' ? `_${localite}` : '';
        return `analyse_historique${locPart}_${startDate}_${endDate}.${ext}`;
    }, [localite, startDate, endDate]);

    // Fonctions d'export
    const handleExportPNG = useCallback((plotlyRef) => {
        if (!plotlyRef?.current?.el) {
            alert('Aucun graphique à exporter');
            return;
        }
        Plotly.downloadImage(plotlyRef.current.el, {
            format: 'png',
            filename: getExportFilename('png').replace('.png', ''),
            width: 1200,
            height: 600,
            scale: 2
        });
    }, [getExportFilename]);

    const handleExportCSV = useCallback(() => {
        if (!rawData || rawData.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }
        const localiteLabel = localite !== 'CONSOMMATION_TOTALE'
            ? AVAILABLE_LOCALITES.find(l => l.value === localite)?.label || localite
            : null;
        const colHeader = localiteLabel ? `Consommation ${localiteLabel} (MW)` : 'Consommation (MW)';
        const headers = ['Période', colHeader];
        const rows = rawData.map(row => [row.periode, row.consommation]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = getExportFilename('csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [rawData, localite, getExportFilename]);

    const handleExportExcel = useCallback(() => {
        if (!rawData || rawData.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }
        const localiteLabel = localite !== 'CONSOMMATION_TOTALE'
            ? AVAILABLE_LOCALITES.find(l => l.value === localite)?.label || localite
            : null;
        const colHeader = localiteLabel ? `Consommation ${localiteLabel} (MW)` : 'Consommation (MW)';

        const excelData = rawData.map(row => ({
            'Période': row.periode,
            [colHeader]: parseFloat(row.consommation)
        }));
        if (statistics) {
            excelData.push({});
            excelData.push({ 'Période': 'STATISTIQUES', [colHeader]: '' });
            excelData.push({ 'Période': 'Moyenne', [colHeader]: parseFloat(statistics.moyenne) });
            excelData.push({ 'Période': 'Écart-type', [colHeader]: parseFloat(statistics.ecartType) });
            excelData.push({ 'Période': 'Pic Maximum', [colHeader]: parseFloat(statistics.picMax) });
        }
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analyse Historique');
        worksheet['!cols'] = [{ wch: 25 }, { wch: 25 }];
        XLSX.writeFile(workbook, getExportFilename('xlsx'));
    }, [rawData, statistics, localite, getExportFilename]);

    return {
        // États
        loading,
        error,
        startDate,
        endDate,
        resample,
        effectiveResample,
        chartType,
        localite,
        showGraph,
        rawData,
        statistics,
        peaksData,
        troughsData,
        peaksTroughsLoading,
        currentPage,
        rowsPerPage,
        // Setters
        setStartDate,
        setEndDate,
        setResample,
        setChartType,
        setLocalite,
        setCurrentPage,
        // Fonctions
        handleSearch,
        getVisualization,
        handleExportPNG,
        handleExportCSV,
        handleExportExcel
    };
}
