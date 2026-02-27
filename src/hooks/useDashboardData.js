import { useState, useEffect } from 'react';
import { ModelService } from '../services/ModelService';
import { AnalyticsService } from '../services/AnalyticsService';

/**
 * Hook personnalisé pour charger et gérer les données du Dashboard
 */
export function useDashboardData() {
    // États pour les données transformées
    const [summaryData, setSummaryData] = useState(null);
    const [dailyCurveData, setDailyCurveData] = useState(null);
    const [weeklyHistData, setWeeklyHistData] = useState(null);
    const [predictionComboData, setPredictionComboData] = useState(null);
    const [monthHeatmapData, setMonthHeatmapData] = useState(null);
    const [seriesLoading, setSeriesLoading] = useState(true);
    const [error, setError] = useState(null);

    // États pour les données de prévision
    const [modelMetrics, setModelMetrics] = useState(null);
    const [nextPrediction, setNextPrediction] = useState(null);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [currentHour] = useState(new Date().getHours());

    // Loading global
    const loading = seriesLoading;

    // Obtenir la prédiction pour la prochaine heure
    const getNextHourPrediction = () => {
        if (!nextPrediction || !nextPrediction.predictions) return null;
        const nextHour = (currentHour + 1) % 24;
        const hourToFind = nextHour === 0 ? 24 : nextHour;
        return nextPrediction.predictions.find(p => p.hour === hourToFind);
    };

    // Fonction pour agréger les données horaires en totaux journaliers
    const processHourlyToDaily = (timeIndex, values) => {
        const daysMap = new Map();
        timeIndex.forEach((time, i) => {
            const dateKey = new Date(time).toLocaleDateString('fr-FR');
            if (!daysMap.has(dateKey)) {
                daysMap.set(dateKey, { sum: 0, date: new Date(time) });
            }
            const entry = daysMap.get(dateKey);
            entry.sum += values[i] || 0;
        });

        return Array.from(daysMap.values()).map(entry => ({
            date: entry.date,
            total: entry.sum
        }));
    };

    useEffect(() => {
        const loadData = async () => {
            setSeriesLoading(true);
            setPredictionLoading(true);
            try {
                // Dates cibles
                const day0 = '2019-09-30';
                const dayMinus2 = '2019-09-28';

                const weekStart = '2019-09-23';
                const weekEnd = '2019-09-29';

                const monthStart = '2019-09-01';
                const monthEnd = '2019-09-30';

                const predictionParams = {
                    measurement: 'dataset',
                    field: 'CONSOMMATION_TOTALE',
                    start: '2014-01-01T00:00:00Z',
                    stop: '2019-10-07T00:00:00Z',
                    lags: 72,
                    horizon: 24
                };

                // Appels API en parallèle
                const [
                    rangeResponse,
                    weekHourlyResponse,
                    monthHourlyResponse,
                    metricsResponse,
                    predictionResponse
                ] = await Promise.all([
                    AnalyticsService.getSeries(dayMinus2, day0, 'H', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(weekStart, weekEnd, 'H', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(monthStart, monthEnd, 'H', 'CONSOMMATION_TOTALE'),
                    ModelService.getModelMetrics(),
                    ModelService.predictNextDay(predictionParams)
                ]);

                if (metricsResponse.data) setModelMetrics(metricsResponse.data);
                if (predictionResponse.data) setNextPrediction(predictionResponse.data);

                // Traitement des données de comparaison quotidienne
                if (rangeResponse.data) {
                    const processedData = processDailyComparisonData(
                        rangeResponse.data,
                        predictionResponse.data,
                        currentHour
                    );
                    setDailyCurveData(processedData.curveData);

                    // Calcul des moyennes
                    let weekDailyData = [];
                    if (weekHourlyResponse.data && weekHourlyResponse.data.y) {
                        weekDailyData = processHourlyToDaily(weekHourlyResponse.data.time_index, weekHourlyResponse.data.y);
                    }

                    const weeklyAvg = weekDailyData.length > 0
                        ? weekDailyData.reduce((a, b) => a + b.total, 0) / weekDailyData.length
                        : 0;

                    let monthlyAvg = 0;
                    if (monthHourlyResponse.data && monthHourlyResponse.data.y) {
                        const monthDailyData = processHourlyToDaily(monthHourlyResponse.data.time_index, monthHourlyResponse.data.y);
                        if (monthDailyData.length > 0) {
                            monthlyAvg = monthDailyData.reduce((a, b) => a + b.total, 0) / monthDailyData.length;
                        }
                    }

                    setSummaryData({
                        prevDayTotal: processedData.todayTotal,
                        weeklyAvg: weeklyAvg,
                        monthlyAvg: monthlyAvg
                    });

                    // Graphique hebdomadaire
                    if (weekDailyData.length > 0) {
                        setWeeklyHistData(processWeeklyData(weekDailyData));
                    }
                }

                // Graphique de prévision
                if (predictionResponse.data && predictionResponse.data.predictions) {
                    setPredictionComboData(processPredictionData(predictionResponse.data.predictions));
                }

                // Heatmap mensuel
                if (monthHourlyResponse.data && monthHourlyResponse.data.y) {
                    setMonthHeatmapData(processMonthHeatmapData(monthHourlyResponse.data));
                }

            } catch (err) {
                console.error('Erreur chargement dashboard:', err);
                setError('Erreur de chargement des données.');
            } finally {
                setSeriesLoading(false);
                setPredictionLoading(false);
            }
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        // États
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
        // Fonctions
        getNextHourPrediction
    };
}

// Fonctions de traitement des données
function processDailyComparisonData(rangeData, predictionData, currentHour) {
    const dataMap = {};
    if (rangeData.time_index) {
        rangeData.time_index.forEach((time, index) => {
            const date = new Date(time);
            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${date.getHours()}`;
            dataMap[key] = rangeData.y[index];
        });
    }

    const xValues = [];
    const mainY = [];
    const compY = [];
    const predY = [];
    const predHoverTemplate = [];

    for (let i = -18; i <= 6; i++) {
        const targetHour = currentHour + i;
        const mainDate = new Date('2019-09-30T00:00:00');
        mainDate.setHours(targetHour);
        const compDate = new Date('2019-09-29T00:00:00');
        compDate.setHours(targetHour);

        xValues.push(mainDate);

        const mainKey = `${mainDate.getFullYear()}-${String(mainDate.getMonth()+1).padStart(2,'0')}-${String(mainDate.getDate()).padStart(2,'0')} ${mainDate.getHours()}`;
        const compKey = `${compDate.getFullYear()}-${String(compDate.getMonth()+1).padStart(2,'0')}-${String(compDate.getDate()).padStart(2,'0')} ${compDate.getHours()}`;

        compY.push(dataMap[compKey] || null);

        let predictionValue = null;
        if (i >= 0) {
            if (predictionData && predictionData.predictions) {
                const labelHour = mainDate.getHours();
                const hourToFind = labelHour === 0 ? 24 : labelHour;
                const pred = predictionData.predictions.find(p => p.hour === hourToFind);
                if (pred) predictionValue = pred.prediction;
            }
        }

        if (i < 0) {
            mainY.push(dataMap[mainKey] || null);
            predY.push(null);
            predHoverTemplate.push('');
        } else if (i === 0) {
            const realValue = dataMap[mainKey] || null;
            mainY.push(realValue);
            predY.push(realValue);
            predHoverTemplate.push('<b>Hier - %{x|%H}</b><br>Consommation: %{y:.2f} MW<extra></extra>');
        } else {
            mainY.push(null);
            predY.push(predictionValue);
            predHoverTemplate.push('<b>Prévision - %{x|%H}</b><br>Consommation: %{y:.2f} MW<extra></extra>');
        }
    }

    // Calcul du total du jour
    let todayTotal = 0;
    Object.keys(dataMap).forEach(key => {
        if (key.startsWith('2019-09-30')) todayTotal += dataMap[key] || 0;
    });

    return {
        curveData: [
            {
                x: xValues,
                y: mainY,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Hier',
                line: { color: '#E3001B', width: 3 },
                marker: { color: '#E3001B', size: 6 },
                hovertemplate: '<b>Hier - %{x|%H}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
            },
            {
                x: xValues,
                y: predY,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Prévision',
                line: { color: '#E3001B', width: 3, dash: 'dot' },
                marker: { color: '#E3001B', size: 6, symbol: 'circle-open', line: { width: 2 } },
                hovertemplate: predHoverTemplate
            },
            {
                x: xValues,
                y: compY,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Avant Hier',
                line: { color: '#FDB913', width: 3 },
                marker: { color: '#FDB913', size: 6 },
                hovertemplate: '<b>Avant Hier - %{x|%H}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
            }
        ],
        todayTotal
    };
}

function processWeeklyData(weekDailyData) {
    const xLabelsWeek = weekDailyData.map(d => {
        const dayName = d.date.toLocaleDateString('fr-FR', { weekday: 'short' });
        return dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', '');
    });
    const vals = weekDailyData.map(d => d.total);

    return [{
        x: xLabelsWeek,
        y: vals,
        type: 'bar',
        name: 'Conso',
        marker: {
            color: vals.map((_, i) => i % 2 === 0 ? '#FDB913' : '#E3001B'),
        },
        hovertemplate: '<b>%{x}</b><br>%{y:.2f} MW<extra></extra>'
    }];
}

function processPredictionData(predictions) {
    const hours = predictions.map(p => p.hour.toString().padStart(2, '0'));
    const values = predictions.map(p => p.prediction);

    return [
        {
            x: hours,
            y: values,
            type: 'bar',
            name: 'Prévision (Barres)',
            marker: { color: '#FDB913', opacity: 0.6 },
            hovertemplate: 'Heure: %{x}<br>Conso: %{y:.2f} MW<extra></extra>'
        },
        {
            x: hours,
            y: values,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Tendance',
            line: { color: '#E3001B', width: 3 },
            marker: { color: '#E3001B', size: 6 },
            hovertemplate: 'Heure: %{x}<br>Conso: %{y:.2f} MW<extra></extra>'
        }
    ];
}

function processMonthHeatmapData(hourlyData) {
    const timestamps = hourlyData.time_index;
    const values = hourlyData.y;

    const dates = [...new Set(timestamps.map(t => new Date(t).getDate()))];
    const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));

    const zData = hours.map((h, hourIndex) => {
        return dates.map(d => {
            const index = timestamps.findIndex(t => {
                const date = new Date(t);
                return date.getDate() === d && date.getHours() === hourIndex;
            });
            return index !== -1 ? values[index] : null;
        });
    });

    return [{
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
        colorbar: { title: 'MW' },
        hovertemplate: 'Jour: %{x}<br>Heure: %{y}h<br>Conso: %{z:.2f} MW<extra></extra>'
    }];
}


