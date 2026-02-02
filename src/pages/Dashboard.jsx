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
import { useAnalytics } from '../hooks/useAnalytics';
import { ModelService } from '../services/ModelService';
import { getPlotlyLayout } from '../utils/dataTransformers';

export default function Dashboard() {
    const {
        summary,
        lastdayCurve,
        weekdayHist,
        loading,
        error,
        fetchSummary,
        fetchLastdayCurve,
        fetchWeekdayHist
    } = useAnalytics();

    // États pour les données transformées
    const [summaryData, setSummaryData] = useState(null);
    const [dailyCurveData, setDailyCurveData] = useState(null);
    const [weeklyHistData, setWeeklyHistData] = useState(null);

    // États pour les données de prévision
    const [modelMetrics, setModelMetrics] = useState(null);
    const [nextPrediction, setNextPrediction] = useState(null);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [currentHour, setCurrentHour] = useState(new Date().getHours());

    // Obtenir la prédiction pour la prochaine heure
    const getNextHourPrediction = () => {
        if (!nextPrediction || !nextPrediction.predictions) return null;

        // Calculer la prochaine heure (si 23h -> 0h, sinon heure+1)
        const nextHour = (currentHour + 1) % 24;

        // Trouver la prédiction correspondante (hour dans l'API va de 1 à 24)
        // hour=1 correspond à 01:00, hour=24 correspond à 00:00
        const hourToFind = nextHour === 0 ? 24 : nextHour;
        const prediction = nextPrediction.predictions.find(p => p.hour === hourToFind);

        return prediction;
    };

    // Charger les données au montage du composant
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                await Promise.all([
                    fetchSummary(),
                    fetchLastdayCurve(),
                    fetchWeekdayHist()
                ]);
            } catch (err) {
                console.error('Erreur lors du chargement des données du dashboard:', err);
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

    // Transformer les données summary
    useEffect(() => {
        if (summary) {
            console.log('📊 Summary reçu:', summary);
            // Structure: { prev_day_total, prev_vs_prevday, weekly_avg, monthly_avg }
            setSummaryData({
                prevDayTotal: summary.prev_day_total || 0,
                prevVsPrevday: summary.prev_vs_prevday ? summary.prev_vs_prevday * 100 : 0, // Convertir en pourcentage
                weeklyAvg: summary.weekly_avg || 0,
                monthlyAvg: summary.monthly_avg || 0
            });
        }
    }, [summary]);

    // Transformer les données lastdayCurve
    useEffect(() => {
        if (lastdayCurve) {
            console.log('📊 LastdayCurve reçu:', lastdayCurve);
            // Structure: { rows: [{ HOUR: "00h", CONSOMMATION_TOTALE: 6.5 }, ...] }
            const rows = lastdayCurve.rows || lastdayCurve || [];

            if (Array.isArray(rows) && rows.length > 0) {
                const plotlyData = [{
                    x: rows.map(row => row.HOUR || row.hour),
                    y: rows.map(row => row.CONSOMMATION_TOTALE || row.consommation_totale || row.value),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Consommation',
                    line: { color: '#E3001B', width: 3 },
                    marker: { color: '#E3001B', size: 8 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(227, 0, 27, 0.1)',
                    hovertemplate: '<b>%{x}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
                }];
                setDailyCurveData(plotlyData);
            }
        }
    }, [lastdayCurve]);

    // Transformer les données weekdayHist
    useEffect(() => {
        if (weekdayHist) {
            console.log('📊 WeekdayHist reçu:', weekdayHist);
            // Structure: { rows: [{ day: "Lun", value: 110.26 }, ...] }
            const rows = weekdayHist.rows || weekdayHist || [];

            if (Array.isArray(rows) && rows.length > 0) {
                const colors = ['#E3001B', '#FDB913', '#E3001B', '#FDB913', '#E3001B', '#FDB913', '#E3001B'];
                const plotlyData = [{
                    x: rows.map(row => row.day || row.jour),
                    y: rows.map(row => row.value || row.moyenne),
                    type: 'bar',
                    name: 'Moyenne par jour',
                    marker: {
                        color: colors.slice(0, rows.length),
                        line: { color: '#E5E7EB', width: 1 }
                    },
                    hovertemplate: '<b>%{x}</b><br>Moyenne: %{y:.2f} MW<extra></extra>'
                }];
                setWeeklyHistData(plotlyData);
            }
        }
    }, [weekdayHist]);

    const MetricCard = ({ title, value, subtitle, icon, trend, trendValue, iconColor = "text-[#E3001B]", iconBg = "bg-red-50" }) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group border border-gray-100">
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
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-[#E3001B] text-2xl">
                    {icon}
                </div>
                <h3 className="text-gray-900 font-bold text-xl font-poppins">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <p className="text-gray-500 text-lg font-poppins mb-2">Bienvenue sur le tableau de bord</p>
                <h1 className="text-5xl font-poppins font-bold text-gray-900 mb-2">
                    Dashboard
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
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
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        {/* Colonne des graphiques - 2/3 de la largeur */}
                        <div className="xl:col-span-2 space-y-8">
                            {/* Graphique journalier */}
                            <ChartCard
                                title="Consommation Dernière Journée (Courbe Horaire)"
                                icon={<MdShowChart />}
                            >
                                {dailyCurveData ? (
                                    <Plot
                                        data={dailyCurveData}
                                        layout={{
                                            ...getPlotlyLayout('', 'Heure', 'Consommation (MW)'),
                                            margin: { t: 30, r: 40, b: 80, l: 80 }
                                        }}
                                        style={{ width: '100%', height: '400px' }}
                                        config={{ displayModeBar: false }}
                                    />
                                ) : (
                                    <div className="flex justify-center items-center h-[400px]">
                                        <div className="text-center">
                                            <FaSpinner className="animate-spin text-[#E3001B] text-4xl mx-auto mb-4" />
                                            <p className="text-gray-500">Chargement des données...</p>
                                        </div>
                                    </div>
                                )}
                            </ChartCard>

                            {/* Graphique hebdomadaire */}
                            <ChartCard
                                title="Consommation Moyenne par Jour de Semaine"
                                icon={<FaCalendarAlt />}
                            >
                                {weeklyHistData ? (
                                    <Plot
                                        data={weeklyHistData}
                                        layout={{
                                            ...getPlotlyLayout('', 'Jour', 'Consommation (MW)'),
                                            margin: { t: 30, r: 40, b: 80, l: 80 }
                                        }}
                                        style={{ width: '100%', height: '400px' }}
                                        config={{ displayModeBar: false }}
                                    />
                                ) : (
                                    <div className="flex justify-center items-center h-[400px]">
                                        <div className="text-center">
                                            <FaSpinner className="animate-spin text-[#E3001B] text-4xl mx-auto mb-4" />
                                            <p className="text-gray-500">Chargement des données...</p>
                                        </div>
                                    </div>
                                )}
                            </ChartCard>
                        </div>

                        {/* Section Résumé - 1/3 de la largeur */}
                        <div className="xl:col-span-1 space-y-5">
                            {/* Résumé Statistiques */}
                            <ChartCard
                                title="Résumé Statistiques"
                                icon={<FaChartLine />}
                            >
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <h4 className="text-[#E3001B] font-semibold mb-4 flex items-center gap-2">
                                            <MdBarChart />
                                            Moyennes de Consommation
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Jour Précédent</span>
                                                <span className="text-gray-900 font-bold text-lg">
                                                    {summaryData ? `${summaryData.prevDayTotal.toFixed(2)} MW` : '--'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Moyenne Hebdo</span>
                                                <span className="text-gray-900 font-bold text-lg">
                                                    {summaryData ? `${summaryData.weeklyAvg.toFixed(2)} MW` : '--'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Moyenne Mensuelle</span>
                                                <span className="text-[#E3001B] font-bold text-lg">
                                                    {summaryData ? `${summaryData.monthlyAvg.toFixed(2)} MW` : '--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>

                            <ChartCard
                                title="Module Prévision"
                                icon={<FaBrain />}
                            >
                                <div className="space-y-6">
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

                                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaCheckCircle className="text-green-600" />
                                            <span className="text-green-700 font-semibold">Statut</span>
                                        </div>
                                        <p className="text-green-600 text-sm">
                                            {modelMetrics
                                                ? `Modèle entraîné sur ${modelMetrics.n_train?.toLocaleString() || 0} échantillons`
                                                : 'Chargement des données du modèle...'}
                                        </p>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
