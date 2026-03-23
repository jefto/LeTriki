import { useState, useEffect } from 'react';
import { ModelService } from '../services/ModelService';
import { AnalyticsService } from '../services/AnalyticsService';

const LOCALITIES = ['LOME', 'ANFOIN', 'ATAKPAME', 'KARA', 'SULZER1', 'SULZER2', 'CTL', 'KPIME', 'KARA_PROD'];

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
    const [cityDistributionData, setCityDistributionData] = useState(null);
    const [cityDistributionLoading, setCityDistributionLoading] = useState(false);
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
        const nextHour = (currentHour + 1) % 24; // 0 = minuit
        // Normalisation : certaines APIs retournent hour 1-24 (où 24=minuit),
        // d'autres retournent 0-23. On normalise via % 24 : hour 24 → 0, hour 0 → 0.
        return nextPrediction.predictions.find(p => (p.hour % 24) === nextHour);
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

                // Utiliser Promise.allSettled pour la résilience : si un endpoint échoue,
                // les autres données sont quand même affichées
                const [
                    rangeResult,
                    weekHourlyResult,
                    monthHourlyResult,
                    metricsResult,
                    predictionResult
                ] = await Promise.allSettled([
                    AnalyticsService.getSeries(dayMinus2, day0, 'H', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(weekStart, weekEnd, 'H', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(monthStart, monthEnd, 'H', 'CONSOMMATION_TOTALE'),
                    ModelService.getModelMetrics(),
                    ModelService.predictNextDay(predictionParams)
                ]);

                // Traiter les métriques du modèle (indépendamment des autres)
                if (metricsResult.status === 'fulfilled' && metricsResult.value?.data) {
                    setModelMetrics(metricsResult.value.data);
                } else if (metricsResult.status === 'rejected') {
                    console.warn('⚠️ Métriques modèle indisponibles:', metricsResult.reason?.message);
                }

                // Traiter les prévisions (indépendamment des autres)
                const predictionData = predictionResult.status === 'fulfilled' ? predictionResult.value?.data : null;
                if (predictionData) {
                    setNextPrediction(predictionData);
                } else if (predictionResult.status === 'rejected') {
                    console.warn('⚠️ Prévisions indisponibles:', predictionResult.reason?.message);
                }

                // Traiter la courbe de comparaison quotidienne
                if (rangeResult.status === 'fulfilled' && rangeResult.value?.data) {
                    try {
                        const processedData = processDailyComparisonData(
                            rangeResult.value.data,
                            predictionData,
                            currentHour
                        );
                        setDailyCurveData(processedData.curveData);

                        // Calcul des moyennes
                        let weekDailyData = [];
                        if (weekHourlyResult.status === 'fulfilled' && weekHourlyResult.value?.data?.y) {
                            weekDailyData = processHourlyToDaily(
                                weekHourlyResult.value.data.time_index,
                                weekHourlyResult.value.data.y
                            );
                        }

                        const weeklyAvg = weekDailyData.length > 0
                            ? weekDailyData.reduce((a, b) => a + b.total, 0) / weekDailyData.length
                            : 0;

                        let monthlyAvg = 0;
                        if (monthHourlyResult.status === 'fulfilled' && monthHourlyResult.value?.data?.y) {
                            const monthDailyData = processHourlyToDaily(
                                monthHourlyResult.value.data.time_index,
                                monthHourlyResult.value.data.y
                            );
                            if (monthDailyData.length > 0) {
                                monthlyAvg = monthDailyData.reduce((a, b) => a + b.total, 0) / monthDailyData.length;
                            }
                        }

                        setSummaryData({
                            prevDayTotal: processedData.todayTotal,
                            weeklyAvg,
                            monthlyAvg
                        });

                        // Graphique hebdomadaire
                        if (weekDailyData.length > 0) {
                            setWeeklyHistData(processWeeklyData(weekDailyData));
                        }
                    } catch (err) {
                        console.warn('⚠️ Erreur traitement courbe quotidienne:', err.message);
                    }
                } else if (rangeResult.status === 'rejected') {
                    console.warn('⚠️ Courbe quotidienne indisponible:', rangeResult.reason?.message);
                    setError('Certaines données sont temporairement indisponibles.');
                }

                // Traiter les prévisions 24h
                if (predictionData?.predictions) {
                    try {
                        setPredictionComboData(processPredictionData(predictionData.predictions));
                    } catch (err) {
                        console.warn('⚠️ Erreur traitement prévisions:', err.message);
                    }
                }

                // Traiter la heatmap mensuelle
                if (monthHourlyResult.status === 'fulfilled' && monthHourlyResult.value?.data?.y) {
                    try {
                        setMonthHeatmapData(processMonthHeatmapData(monthHourlyResult.value.data));
                    } catch (err) {
                        console.warn('⚠️ Erreur traitement heatmap:', err.message);
                    }
                }

                setSeriesLoading(false);
                setPredictionLoading(false);

                // Charger les données de répartition par localité (en arrière-plan)
                loadCityDistribution(weekStart, weekEnd);
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

    const loadCityDistribution = async (weekStart, weekEnd) => {
        setCityDistributionLoading(true);
        try {
            const results = await Promise.allSettled(
                LOCALITIES.map(loc => AnalyticsService.getConsommationLocalite(loc, weekStart, weekEnd))
            );

            const cityData = LOCALITIES
                .map((loc, i) => {
                    if (results[i].status === 'fulfilled') {
                        const data = results[i].value?.data?.data || [];
                        const total = data.reduce((sum, item) => sum + (item[loc] || 0), 0);
                        return { city: loc, value: total };
                    }
                    return { city: loc, value: 0 };
                })
                .filter(c => c.value > 0);

            if (cityData.length > 0) {
                setCityDistributionData(cityData);
            }
        } catch (err) {
            console.warn('⚠️ Erreur chargement répartition villes:', err.message);
        } finally {
            setCityDistributionLoading(false);
        }
    };

    return {
        // États
        loading,
        error,
        summaryData,
        dailyCurveData,
        weeklyHistData,
        predictionComboData,
        monthHeatmapData,
        cityDistributionData,
        cityDistributionLoading,
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
                        const labelHour = mainDate.getHours(); // 0–23, 0 = minuit
                        // Normalisation : hour 24 → 0, couvre les APIs 1-24 ET 0-23
                        const pred = predictionData.predictions.find(p => (p.hour % 24) === labelHour);
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


