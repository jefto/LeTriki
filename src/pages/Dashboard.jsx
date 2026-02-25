import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
    FaArrowUp,
    FaChartLine,
    FaBolt,
    FaCalendarAlt,
    FaBrain,
    FaSpinner,
    FaCheckCircle
} from 'react-icons/fa';
import { 
    MdShowChart,
    MdBarChart
} from 'react-icons/md';
import { ModelService } from '../services/ModelService';
import { AnalyticsService } from '../services/AnalyticsService';
import { getPlotlyLayout } from '../utils/dataTransformers';

export default function Dashboard() {
    // États pour les données transformées
    const [summaryData, setSummaryData] = useState(null);
    const [dailyCurveData, setDailyCurveData] = useState(null);
    const [weeklyHistData, setWeeklyHistData] = useState(null);
    const [predictionHeatmapData, setPredictionHeatmapData] = useState(null);
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

        // Calculer la prochaine heure (si 23h -> 0h, sinon heure+1)
        const nextHour = (currentHour + 1) % 24;

        // Trouver la prédiction correspondante (hour dans l'API va de 1 à 24)
        // hour=1 correspond à 01:00, hour=24 correspond à 00:00
        const hourToFind = nextHour === 0 ? 24 : nextHour;
        return nextPrediction.predictions.find(p => p.hour === hourToFind);
    };

    // Charger les données au montage du composant
    useEffect(() => {
        // Fonction pour calculer la moyenne de consommation d'un tableau de valeurs
        const calculateAverage = (values) => {
            if (!values || values.length === 0) return 0;
            const sum = values.reduce((acc, val) => acc + (val || 0), 0);
            return sum / values.length;
        };

        // Fonction pour calculer la somme totale de consommation
        const calculateTotal = (values) => {
            if (!values || values.length === 0) return 0;
            return values.reduce((acc, val) => acc + (val || 0), 0);
        };

        const loadDashboardData = async () => {
            setSeriesLoading(true);
            try {
                // Dates cibles
                const today = '2019-09-30';      // Jour "actuel" (30/09/2019)
                const yesterday = '2019-09-29';  // Jour précédent (29/09/2019)
                const weekStart = '2019-09-24';  // Début de la semaine
                const weekEnd = '2019-09-30';    // Fin de la semaine
                const monthStart = '2019-09-01'; // Début du mois
                const monthEnd = '2019-09-30';   // Fin du mois

                // Appels API en parallèle pour les 4 périodes
                const [todayResponse, yesterdayResponse, weekResponse, monthResponse] = await Promise.all([
                    AnalyticsService.getSeries(today, today, 'H', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(yesterday, yesterday, 'H', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(weekStart, weekEnd, 'D', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(monthStart, monthEnd, 'D', 'CONSOMMATION_TOTALE')
                ]);

                console.log('📊 Données du 30/09/2019:', todayResponse.data);
                console.log('📊 Données du 29/09/2019:', yesterdayResponse.data);
                console.log('📊 Données semaine 24-30/09/2019:', weekResponse.data);
                console.log('📊 Données mois 01-30/09/2019:', monthResponse.data);

                // ===== TRAITEMENT DES DONNÉES JOURNALIÈRES (30/09 et 29/09) =====
                let todayValues = [];
                let todayHours = [];
                let yesterdayValues = [];
                let yesterdayHours = [];

                if (todayResponse.data) {
                    const data = todayResponse.data;
                    const timeIndex = data.time_index || [];
                    todayValues = data.y || [];
                    todayHours = timeIndex.map(timestamp => {
                        const date = new Date(timestamp);
                        return date.getHours().toString().padStart(2, '0') + 'h';
                    });
                }

                if (yesterdayResponse.data) {
                    const data = yesterdayResponse.data;
                    const timeIndex = data.time_index || [];
                    yesterdayValues = data.y || [];
                    yesterdayHours = timeIndex.map(timestamp => {
                        const date = new Date(timestamp);
                        return date.getHours().toString().padStart(2, '0') + 'h';
                    });
                }

                // Créer les courbes de comparaison (30/09 en rouge, 29/09 en jaune)
                if (todayHours.length > 0 || yesterdayHours.length > 0) {
                    const plotlyData = [];

                    // Courbe du 30/09/2019 (rouge)
                    if (todayValues.length > 0) {
                        plotlyData.push({
                            x: todayHours,
                            y: todayValues,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: '30/09/2019 (Hier)',
                            line: { color: '#E3001B', width: 3 },
                            marker: { color: '#E3001B', size: 6 },
                            hovertemplate: '<b>30/09 - %{x}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
                        });
                    }

                    // Courbe du 29/09/2019 (jaune)
                    if (yesterdayValues.length > 0) {
                        plotlyData.push({
                            x: yesterdayHours,
                            y: yesterdayValues,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: '29/09/2019 (Avant Hier)',
                            line: { color: '#FDB913', width: 3, dash: 'dot' },
                            marker: { color: '#FDB913', size: 6 },
                            hovertemplate: '<b>29/09 - %{x}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
                        });
                    }

                    setDailyCurveData(plotlyData);
                }

                // ===== TRAITEMENT DES DONNÉES HEBDOMADAIRES =====
                let weeklyTotal = 0;
                let weeklyAvg = 0;
                const dayNames = ['Mar 24', 'Mer 25', 'Jeu 26', 'Ven 27', 'Sam 28', 'Dim 29', 'Lun 30'];

                if (weekResponse.data) {
                    const weekData = weekResponse.data;
                    const weekValues = weekData.y || [];
                    const weekTimeIndex = weekData.time_index || [];

                    // Calculer la moyenne hebdomadaire
                    weeklyTotal = calculateTotal(weekValues);
                    weeklyAvg = calculateAverage(weekValues);

                    console.log('📊 Total semaine:', weeklyTotal, 'Moyenne:', weeklyAvg);

                    // Créer le graphique en barres pour chaque jour de la semaine
                    if (weekValues.length > 0) {
                        const colors = ['#E3001B', '#FDB913', '#E3001B', '#FDB913', '#E3001B', '#FDB913', '#E3001B'];

                        // Mapper les dates aux noms de jours
                        const xLabels = weekTimeIndex.map((timestamp) => {
                            const date = new Date(timestamp);
                            const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                            const dayNum = date.getDate();
                            return `${dayOfWeek} ${dayNum}`;
                        });

                        const barData = [{
                            x: xLabels.length > 0 ? xLabels : dayNames.slice(0, weekValues.length),
                            y: weekValues,
                            type: 'bar',
                            name: 'Consommation journalière',
                            marker: {
                                color: colors.slice(0, weekValues.length),
                                line: { color: '#E5E7EB', width: 1 }
                            },
                            hovertemplate: '<b>%{x}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
                        }];

                        setWeeklyHistData(barData);
                    }
                }

                // ===== TRAITEMENT DES DONNÉES MENSUELLES (01-30/09/2019) =====
                let monthlyAvg = 0;
                if (monthResponse.data) {
                    const monthData = monthResponse.data;
                    const monthValues = monthData.y || [];

                    // Calculer la moyenne mensuelle
                    monthlyAvg = calculateAverage(monthValues);
                    console.log('📊 Moyenne mensuelle (septembre 2019):', monthlyAvg);
                }

                // ===== MISE À JOUR DU RÉSUMÉ (KPIs) =====
                const todayTotal = calculateTotal(todayValues);
                const yesterdayTotal = calculateTotal(yesterdayValues);
                const variation = yesterdayTotal > 0
                    ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
                    : 0;

                setSummaryData({
                    prevDayTotal: todayTotal,
                    prevVsPrevday: variation,
                    weeklyAvg: weeklyAvg,
                    monthlyAvg: monthlyAvg  // Moyenne calculée sur le mois de septembre 2019
                });

                console.log('📊 Résumé:', {
                    todayTotal,
                    yesterdayTotal,
                    variation: variation.toFixed(2) + '%',
                    weeklyAvg,
                    monthlyAvg
                });

            } catch (err) {
                console.error('Erreur lors du chargement des données du dashboard:', err);
                setError('Impossible de charger les données. Vérifiez la connexion au serveur.');
            } finally {
                setSeriesLoading(false);
            }
        };

        // Charger les métriques du modèle et la prochaine prévision
        const loadPredictionData = async () => {
            setPredictionLoading(true);
            try {
                // Charger les métriques du modèle
                const metricsResponse = await ModelService.getModelMetrics();
                if (metricsResponse.data) {
                    setModelMetrics(metricsResponse.data);
                }

                // Charger la prochaine prévision (24 heures pour avoir toutes les heures)
                const predictionParams = {
                    measurement: 'dataset',
                    field: 'CONSOMMATION_TOTALE',
                    start: '2014-01-01T00:00:00Z',
                    stop: '2019-10-07T00:00:00Z',
                    lags: 72,
                    horizon: 24
                };
                const predictionResponse = await ModelService.predictNextDay(predictionParams);
                if (predictionResponse.data && predictionResponse.data.predictions) {
                    setNextPrediction(predictionResponse.data);

                    // Créer les données pour le heatmap - uniquement les données de l'API
                    const predictions = predictionResponse.data.predictions;
                    const hours = predictions.map(p => `${p.hour.toString().padStart(2, '0')}h`);
                    const values = predictions.map(p => p.prediction);

                    // Heatmap simple : abscisse = 24h, ordonnée = valeurs de consommation
                    const heatmapData = [{
                        z: [values],
                        x: hours,
                        y: ['Consommation'],
                        type: 'heatmap',
                        colorscale: [
                            [0, '#FFF3CD'],      // Jaune clair pour les valeurs basses
                            [0.25, '#FDB913'],   // Jaune CEET
                            [0.5, '#FF6B35'],    // Orange
                            [0.75, '#E3001B'],   // Rouge CEET
                            [1, '#8B0000']       // Rouge foncé pour les valeurs hautes
                        ],
                        hovertemplate: 'Heure: %{x}<br>Consommation: %{z:.2f} MW<extra></extra>',
                        showscale: true,
                        colorbar: {
                            title: 'MW',
                            titleside: 'right',
                            thickness: 15,
                            len: 0.9
                        }
                    }];

                    setPredictionHeatmapData(heatmapData);
                }
            } catch (err) {
                console.error('Erreur lors du chargement des données de prévision:', err);
            } finally {
                setPredictionLoading(false);
            }
        };

        loadDashboardData();
        loadPredictionData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const MetricCard = ({ title, value, subtitle, icon, trend, trendValue, iconColor = "text-[#E3001B]", iconBg = "bg-red-50" }) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group border border-gray-100 overflow-hidden h-full">
            <div className="flex items-start justify-between mb-4">
                <div className={`${iconBg} ${iconColor} p-3 rounded-full text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        <FaArrowUp className={trend === 'down' ? 'rotate-180' : ''} />
                        {trendValue}
                    </div>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-poppins mb-2 uppercase tracking-wider">{title}</h3>
            <p className="text-gray-900 text-3xl font-bold font-poppins mb-1">{value}</p>
            <p className="text-gray-400 text-sm font-poppins">{subtitle}</p>
        </div>
    );

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
                <p className="text-gray-500 text-sm font-poppins mb-1">Bienvenue sur le tableau de bord</p>
                <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                    Dashboard
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>

            {/* Loader global */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <FaSpinner className="animate-spin text-[#E3001B] text-6xl" />
                </div>
            )}

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
                    <p className="font-semibold">⚠️ Erreur: {error}</p>
                </div>
            )}

            {/* Métriques principales */}
            {!loading && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <MetricCard
                            title="Consommation Jour Précédent"
                            value={summaryData ? `${summaryData.prevDayTotal.toFixed(2)} MW` : "-- MW"}
                            subtitle={summaryData ? `${summaryData.prevVsPrevday > 0 ? '+' : ''}${summaryData.prevVsPrevday.toFixed(1)}% vs avant-hier` : "Chargement..."}
                            icon={<FaBolt />}
                            iconColor="text-[#E3001B]"
                            iconBg="bg-red-50"
                            trend={summaryData && summaryData.prevVsPrevday >= 0 ? "up" : "down"}
                            trendValue={summaryData ? `${Math.abs(summaryData.prevVsPrevday).toFixed(1)}%` : "0%"}
                        />
                        <MetricCard
                            title="Moyenne Hebdomadaire"
                            value={summaryData ? `${summaryData.weeklyAvg.toFixed(2)} MW` : "-- MW"}
                            subtitle="7 derniers jours"
                            icon={<FaCalendarAlt />}
                            iconColor="text-[#FDB913]"
                            iconBg="bg-yellow-50"
                        />
                        <MetricCard
                            title="Moyenne Mensuelle"
                            value={summaryData ? `${summaryData.monthlyAvg.toFixed(2)} MW` : "-- MW"}
                            subtitle="30 derniers jours"
                            icon={<FaChartLine />}
                            iconColor="text-[#E3001B]"
                            iconBg="bg-red-50"
                        />
                        <MetricCard
                            title="Prochaine Prédiction"
                            value={(() => {
                                const pred = getNextHourPrediction();
                                if (pred) return `${pred.prediction.toFixed(2)} MW`;
                                return predictionLoading ? "Chargement..." : "-- MW";
                            })()}
                            subtitle={(() => {
                                const nextHour = (currentHour + 1) % 24;
                                const nextHourStr = nextHour.toString().padStart(2, '0');
                                return `Prévision pour ${nextHourStr}:00 (actuellement ${currentHour}:00)`;
                            })()}
                            icon={<FaBrain />}
                            iconColor="text-[#FDB913]"
                            iconBg="bg-yellow-50"
                        />
                    </div>

                    {/* Graphiques et sections */}
                    <div className="space-y-6">
                        {/* Graphique de comparaison J-1 / J-2 - Pleine largeur */}
                        <ChartCard
                            title="Comparaison Consommation J-1 vs J-2 (Courbe Horaire)"
                            icon={<MdShowChart />}
                        >
                            {dailyCurveData ? (
                                <div className="w-full h-[350px]">
                                    <Plot
                                        data={dailyCurveData}
                                        layout={{
                                            ...getPlotlyLayout('', 'Heure', 'Consommation (MW)'),
                                            margin: { t: 30, r: 40, b: 80, l: 80 },
                                            legend: { orientation: 'h', y: -0.2 },
                                            autosize: true
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        config={{ displayModeBar: false, responsive: true }}
                                        useResizeHandler={true}
                                    />
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-[350px] w-full">
                                    <div className="text-center">
                                        <FaSpinner className="animate-spin text-[#E3001B] text-4xl mx-auto mb-4" />
                                        <p className="text-gray-500">Chargement des données...</p>
                                    </div>
                                </div>
                            )}
                        </ChartCard>

                        {/* Ligne avec Diagramme en barres et Heatmap */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Diagramme en barres - Consommation hebdomadaire */}
                            <ChartCard
                                title="Consommation par Jour de Semaine"
                                icon={<FaCalendarAlt />}
                            >
                                {weeklyHistData ? (
                                    <div className="w-full h-[350px]">
                                        <Plot
                                            data={weeklyHistData}
                                            layout={{
                                                ...getPlotlyLayout('', 'Jour', 'Consommation (MW)'),
                                                margin: { t: 30, r: 40, b: 80, l: 80 },
                                                autosize: true
                                            }}
                                            style={{ width: '100%', height: '100%' }}
                                            config={{ displayModeBar: false, responsive: true }}
                                            useResizeHandler={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-[350px] w-full">
                                        <div className="text-center">
                                            <FaSpinner className="animate-spin text-[#E3001B] text-4xl mx-auto mb-4" />
                                            <p className="text-gray-500">Chargement des données...</p>
                                        </div>
                                    </div>
                                )}
                            </ChartCard>

                            {/* Heatmap - Prévisions de consommation */}
                            <ChartCard
                                title="Carte de Chaleur - Prévisions 24h"
                                icon={<FaBrain />}
                            >
                                {predictionHeatmapData ? (
                                    <div className="w-full h-[350px]">
                                        <Plot
                                            data={predictionHeatmapData}
                                            layout={{
                                                ...getPlotlyLayout('', 'Heure (24h)', 'Consommation (MW)'),
                                                margin: { t: 30, r: 100, b: 60, l: 80 },
                                                xaxis: {
                                                    title: 'Heure',
                                                    tickangle: -45,
                                                    gridcolor: '#E5E7EB',
                                                    tickfont: { color: '#6B7280', size: 10 }
                                                },
                                                yaxis: {
                                                    title: '',
                                                    gridcolor: '#E5E7EB',
                                                    tickfont: { color: '#6B7280' },
                                                    showticklabels: false
                                                },
                                                autosize: true
                                            }}
                                            style={{ width: '100%', height: '100%' }}
                                            config={{ displayModeBar: false, responsive: true }}
                                            useResizeHandler={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-[350px] w-full">
                                        <div className="text-center">
                                            {predictionLoading ? (
                                                <>
                                                    <FaSpinner className="animate-spin text-[#FDB913] text-4xl mx-auto mb-4" />
                                                    <p className="text-gray-500">Calcul des prévisions...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FaBrain className="text-gray-300 text-4xl mx-auto mb-4" />
                                                    <p className="text-gray-500">Prévisions non disponibles</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </ChartCard>
                        </div>
                    </div>

                    {/* Section Module Prévision */}
                    <div className="mt-6">
                        <ChartCard
                            title="Module Prévision"
                            icon={<FaBrain />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    </div>
                </>
            )}
        </div>
    );
}
