import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { 
    FaArrowUp, 
    FaClock, 
    FaChartLine, 
    FaFileAlt, 
    FaBolt,
    FaCalendarAlt,
    FaBrain,
    FaSpinner
} from 'react-icons/fa';
import { 
    MdShowChart,
    MdBarChart
} from 'react-icons/md';
import { useAnalytics } from '../hooks/useAnalytics';
import {
    transformSummaryData,
    transformLastdayCurve,
    transformWeekdayHist,
    getPlotlyLayout
} from '../utils/dataTransformers';

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

    const [transformedSummary, setTransformedSummary] = useState(null);
    const [transformedDailyCurve, setTransformedDailyCurve] = useState(null);
    const [transformedWeeklyHist, setTransformedWeeklyHist] = useState(null);

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

        loadDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Transformer les données quand elles sont disponibles
    useEffect(() => {
        if (summary) {
            const transformed = transformSummaryData(summary);
            setTransformedSummary(transformed);
        }
    }, [summary]);

    useEffect(() => {
        if (lastdayCurve) {
            // Transformer en tableau simple
            const tableauCourbe = transformLastdayCurve(lastdayCurve);

            // Créer l'objet Plotly à partir du tableau
            const plotlyData = [{
                x: tableauCourbe.map(row => row.heure),
                y: tableauCourbe.map(row => row.consommation),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Consommation',
                line: { color: '#E9FA00', width: 4 },
                marker: { color: '#E9FA00', size: 10 },
                fill: 'tonexty',
                fillcolor: 'rgba(233, 250, 0, 0.2)',
                hovertemplate: '<b>%{x}</b><br>Consommation: %{y:.1f} MW<extra></extra>'
            }];

            setTransformedDailyCurve(plotlyData);
        }
    }, [lastdayCurve]);

    useEffect(() => {
        if (weekdayHist) {
            // Transformer en tableau simple
            const tableauHist = transformWeekdayHist(weekdayHist);

            // Créer l'objet Plotly à partir du tableau
            const colors = ['#60A5FA', '#E9FA00', '#60A5FA', '#E9FA00', '#60A5FA', '#FF6B6B', '#FF6B6B'];
            const plotlyData = [{
                x: tableauHist.map(row => row.jour),
                y: tableauHist.map(row => row.moyenne),
                type: 'bar',
                name: 'Moyenne par jour',
                marker: {
                    color: colors,
                    line: {
                        color: '#1e3a8a',
                        width: 2
                    }
                },
                hovertemplate: '<b>%{x}</b><br>Moyenne: %{y:.1f} MW<extra></extra>'
            }];

            setTransformedWeeklyHist(plotlyData);
        }
    }, [weekdayHist]);

    const MetricCard = ({ title, value, subtitle, icon, trend, trendValue, bgGradient = "from-tertiary to-blue-800" }) => (
        <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className="text-secondary text-3xl group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                        <FaArrowUp className={trend === 'down' ? 'rotate-180' : ''} />
                        {trendValue}
                    </div>
                )}
            </div>
            <h3 className="text-white/80 text-sm font-poppins mb-2 uppercase tracking-wider">{title}</h3>
            <p className="text-white text-3xl font-bold font-poppins mb-1">{value}</p>
            <p className="text-secondary/80 text-sm font-poppins">{subtitle}</p>
        </div>
    );

    const ChartCard = ({ title, children, icon }) => (
        <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-secondary text-2xl">
                    {icon}
                </div>
                <h3 className="text-white font-bold text-xl font-poppins">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <p className="text-tertiary/70 text-lg font-poppins mb-2">Bienvenue sur le tableau de bord</p>
                <h1 className="text-5xl font-poppins font-bold bg-gradient-to-r from-tertiary to-blue-600 bg-clip-text text-transparent mb-2">
                    Dashboard
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-secondary to-tertiary rounded-full"></div>
            </div>

            {/* Loader global */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <FaSpinner className="animate-spin text-secondary text-6xl" />
                </div>
            )}

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl mb-8">
                    <p className="font-semibold">⚠️ Erreur: {error}</p>
                </div>
            )}

            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Consommation Jour Précédent"
                    value={transformedSummary ? `${Math.round(transformedSummary.prevDayTotal)} MW` : "-- MW"}
                    subtitle={transformedSummary ? `${transformedSummary.prevVsPrevday > 0 ? '+' : ''}${transformedSummary.prevVsPrevday.toFixed(1)}% vs avant-hier` : "Chargement..."}
                    icon={<FaBolt />}
                    trend={transformedSummary && transformedSummary.prevVsPrevday > 0 ? "up" : "down"}
                    trendValue={transformedSummary ? `${Math.abs(transformedSummary.prevVsPrevday).toFixed(1)}%` : "0%"}
                />
                <MetricCard
                    title="Prochaine Prédiction"
                    value="Pas encore disponible"
                    subtitle="Module prévision en cours"
                    icon={<FaClock />}
                    bgGradient="from-blue-800 to-tertiary"
                />
                <MetricCard
                    title="Précision Modèle"
                    value="Pas encore disponible"
                    subtitle="MAPE (7 derniers jours)"
                    icon={<MdBarChart />}
                    bgGradient="from-tertiary to-purple-800"
                />
                <MetricCard
                    title="Prévisions Générées"
                    value="0"
                    subtitle="Ce mois-ci"
                    icon={<FaFileAlt />}
                    bgGradient="from-blue-900 to-tertiary"
                />
            </div>

            {/* Graphiques et sections */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Colonne des graphiques - 2/3 de la largeur */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Graphique journalier */}
                    <ChartCard 
                        title="Consommation Dernière Journée"
                        icon={<MdShowChart />}
                    >
                        {transformedDailyCurve ? (
                            <Plot
                                data={transformedDailyCurve}
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
                                    <FaSpinner className="animate-spin text-secondary text-4xl mx-auto mb-4" />
                                    <p className="text-white/60">Chargement des données...</p>
                                </div>
                            </div>
                        )}
                    </ChartCard>

                    {/* Graphique hebdomadaire */}
                    <ChartCard
                        title="Consommation Moyenne par Jour de Semaine"
                        icon={<FaCalendarAlt />}
                    >
                        {transformedWeeklyHist ? (
                            <Plot
                                data={transformedWeeklyHist}
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
                                    <FaSpinner className="animate-spin text-secondary text-4xl mx-auto mb-4" />
                                    <p className="text-white/60">Chargement des données...</p>
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </div>

                {/* Section Prédiction - 1/3 de la largeur */}
                <div className="xl:col-span-1 space-y-5">
                    {/* Résumé Mensuel Numérique */}
                    <ChartCard 
                        title="Résumé Statistiques"
                        icon={<FaChartLine />}
                    >
                        <div className="space-y-6">
                            {/* Statistiques principales */}
                            <div className="bg-black/20 rounded-xl p-6 border border-secondary/30">
                                <h4 className="text-secondary font-semibold mb-4 flex items-center gap-2">
                                    <MdBarChart />
                                    Moyennes de Consommation
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Jour Précédent</span>
                                        <span className="text-white font-bold text-lg">
                                            {transformedSummary ? `${Math.round(transformedSummary.prevDayTotal)} MW` : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Moyenne Hebdo</span>
                                        <span className="text-white font-bold text-lg">
                                            {transformedSummary ? `${Math.round(transformedSummary.weeklyAvg)} MW` : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Moyenne Mensuelle</span>
                                        <span className="text-secondary font-bold text-lg">
                                            {transformedSummary ? `${Math.round(transformedSummary.monthlyAvg)} MW` : '--'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ChartCard>

                    <ChartCard 
                        title="Prochaine Prédiction" 
                        icon={<FaBrain />}
                    >
                        <div className="space-y-6">
                            {/* Prévision principale */}
                            <div className="bg-black/20 rounded-xl p-6 border border-secondary/30">
                                <h4 className="text-secondary font-semibold mb-4 flex items-center gap-2">
                                    <FaArrowUp />
                                    Module en développement
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Moyenne</span>
                                        <span className="text-white/40 font-bold text-lg">Pas encore disponible</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Écart-type</span>
                                        <span className="text-white/40 font-bold text-lg">Pas encore disponible</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Pic Maximum</span>
                                        <span className="text-white/40 font-bold text-lg">Pas encore disponible</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Total Journée</span>
                                        <span className="text-white/40 font-bold text-lg">Pas encore disponible</span>
                                    </div>
                                </div>
                            </div>

                            {/* Indicateurs de confiance */}
                            <div className="bg-black/20 rounded-xl p-6 border border-blue-400/30">
                                <h4 className="text-blue-400 font-semibold mb-4">Indicateurs de Confiance</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-white/60">Fiabilité</span>
                                            <span className="text-white/40 font-semibold">--</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-3 rounded-full" style={{width: '0%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-white/60">Précision</span>
                                            <span className="text-white/40 font-semibold">--</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-3 rounded-full" style={{width: '0%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Prochaine mise à jour */}
                            <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-gray-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaClock className="text-white/40" />
                                    <span className="text-white/60 font-semibold">Module Prévision</span>
                                </div>
                                <p className="text-white/40 text-sm">En cours de développement</p>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}
