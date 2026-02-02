import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
    FaSpinner,
    FaChartLine,
    FaCogs,
    FaDatabase,
    FaCheckCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import {
    MdSpeed,
    MdTrendingUp,
    MdPieChart
} from 'react-icons/md';
import { ModelService } from '../services/ModelService';

export default function PerformanceModeles() {
    const [metricsData, setMetricsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les métriques au montage
    useEffect(() => {
        const loadMetrics = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await ModelService.getModelMetrics();
                console.log('📊 Métriques reçues:', response.data);
                setMetricsData(response.data);
            } catch (err) {
                console.error('❌ Erreur chargement métriques:', err);
                setError('Impossible de charger les métriques du modèle. Veuillez réessayer.');
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, []);

    // Composant carte métrique KPI
    const MetricCard = ({ title, value, unit, description, icon, color = "#E3001B", bgColor = "bg-red-50" }) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className={`${bgColor} p-3 rounded-full text-2xl`} style={{ color }}>
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-500 text-sm font-poppins mb-2 uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline gap-1">
                <p className="text-gray-900 text-3xl font-bold font-poppins">{value}</p>
                {unit && <span className="text-gray-500 text-lg">{unit}</span>}
            </div>
            {description && <p className="text-gray-400 text-sm font-poppins mt-1">{description}</p>}
        </div>
    );

    // Composant carte R² avec jauge circulaire
    const R2Card = ({ value }) => {
        const percentage = (value * 100).toFixed(0);
        const circumference = 2 * Math.PI * 45;
        const strokeDashoffset = circumference - (value * circumference);

        return (
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-50 text-green-600 p-3 rounded-full text-2xl">
                        <FaCheckCircle />
                    </div>
                </div>
                <h3 className="text-gray-500 text-sm font-poppins mb-2 uppercase tracking-wider">Coefficient R²</h3>

                {/* Jauge circulaire */}
                <div className="flex items-center justify-center my-4">
                    <div className="relative">
                        <svg className="w-28 h-28 transform -rotate-90">
                            {/* Cercle de fond */}
                            <circle
                                cx="56"
                                cy="56"
                                r="45"
                                stroke="#E5E7EB"
                                strokeWidth="10"
                                fill="none"
                            />
                            {/* Cercle de progression */}
                            <circle
                                cx="56"
                                cy="56"
                                r="45"
                                stroke="url(#gradient)"
                                strokeWidth="10"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#E3001B" />
                                    <stop offset="100%" stopColor="#FDB913" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                        </div>
                    </div>
                </div>
                <p className="text-gray-400 text-sm font-poppins text-center">Variance expliquée par le modèle</p>
            </div>
        );
    };

    // Composant carte section
    const SectionCard = ({ title, children, icon }) => (
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

    // Données pour le graphique pie chart (répartition des données)
    const getDataSplitChart = () => {
        if (!metricsData) return null;

        return [{
            values: [metricsData.n_train, metricsData.n_val, metricsData.n_test],
            labels: ['Entraînement', 'Validation', 'Test'],
            type: 'pie',
            hole: 0.5,
            marker: {
                colors: ['#E3001B', '#FDB913', '#10B981'],
                line: { color: '#ffffff', width: 2 }
            },
            textinfo: 'label+percent',
            textposition: 'outside',
            hovertemplate: '<b>%{label}</b><br>%{value:,} échantillons<br>(%{percent})<extra></extra>',
            textfont: { family: 'Poppins', size: 12 }
        }];
    };

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <p className="text-gray-500 text-lg font-poppins mb-2">Évaluation des performances</p>
                <h1 className="text-5xl font-poppins font-bold text-gray-900 mb-2">
                    Performance Modèles
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
                    <FaExclamationTriangle className="text-2xl" />
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            {/* Contenu principal */}
            {!loading && metricsData && (
                <>
                    {/* Section KPIs - Métriques principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                        <MetricCard
                            title="RMSE"
                            value={metricsData.metrics?.RMSE?.toFixed(2) || '--'}
                            unit="MW"
                            description="Erreur quadratique moyenne"
                            icon={<MdSpeed />}
                            color="#E3001B"
                            bgColor="bg-red-50"
                        />
                        <MetricCard
                            title="MAE"
                            value={metricsData.metrics?.MAE?.toFixed(2) || '--'}
                            unit="MW"
                            description="Erreur absolue moyenne"
                            icon={<MdTrendingUp />}
                            color="#FDB913"
                            bgColor="bg-yellow-50"
                        />
                        <MetricCard
                            title="MAPE"
                            value={metricsData.metrics?.MAPE?.toFixed(2) || '--'}
                            unit="%"
                            description="Erreur en pourcentage"
                            icon={<FaChartLine />}
                            color="#E3001B"
                            bgColor="bg-red-50"
                        />
                        <MetricCard
                            title="SMAPE"
                            value={metricsData.metrics?.SMAPE?.toFixed(2) || '--'}
                            unit="%"
                            description="MAPE symétrique"
                            icon={<FaChartLine />}
                            color="#FDB913"
                            bgColor="bg-yellow-50"
                        />
                        <R2Card value={metricsData.metrics?.R2 || 0} />
                    </div>

                    {/* Section Détails - Grid 2 colonnes */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Répartition des données (Pie Chart) */}
                        <SectionCard
                            title="Répartition des Données"
                            icon={<MdPieChart />}
                        >
                            <div className="mb-4">
                                <p className="text-gray-500 text-sm mb-2">
                                    Date de split : <span className="font-semibold text-gray-700">{metricsData.split_date || '--'}</span>
                                </p>
                            </div>

                            {/* Graphique Pie */}
                            <Plot
                                data={getDataSplitChart()}
                                layout={{
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    font: { family: 'Poppins', color: '#1F2937' },
                                    showlegend: true,
                                    legend: {
                                        orientation: 'h',
                                        y: -0.1,
                                        x: 0.5,
                                        xanchor: 'center',
                                        font: { size: 12 }
                                    },
                                    margin: { t: 20, r: 20, b: 60, l: 20 },
                                    annotations: [{
                                        text: `<b>${(metricsData.n_train + metricsData.n_val + metricsData.n_test).toLocaleString()}</b><br>Total`,
                                        showarrow: false,
                                        font: { size: 14, family: 'Poppins' }
                                    }]
                                }}
                                style={{ width: '100%', height: '350px' }}
                                config={{ displayModeBar: false }}
                            />

                            {/* Légende détaillée */}
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="bg-red-50 p-3 rounded-xl text-center">
                                    <p className="text-[#E3001B] font-bold text-lg">{metricsData.n_train?.toLocaleString()}</p>
                                    <p className="text-gray-500 text-xs">Entraînement</p>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-xl text-center">
                                    <p className="text-[#FDB913] font-bold text-lg">{metricsData.n_val?.toLocaleString()}</p>
                                    <p className="text-gray-500 text-xs">Validation</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-xl text-center">
                                    <p className="text-green-600 font-bold text-lg">{metricsData.n_test?.toLocaleString()}</p>
                                    <p className="text-gray-500 text-xs">Test</p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Configuration du Modèle */}
                        <SectionCard
                            title="Configuration du Modèle"
                            icon={<FaCogs />}
                        >
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="text-[#E3001B] font-semibold mb-4 flex items-center gap-2">
                                    <FaDatabase />
                                    Paramètres CatBoost
                                </h4>

                                {/* Tableau des paramètres */}
                                <div className="space-y-3">
                                    {metricsData.params && Object.entries(metricsData.params).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-600 capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-gray-900 font-bold bg-white px-3 py-1 rounded-lg border border-gray-200">
                                                {typeof value === 'number' ? value.toLocaleString() : value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Informations supplémentaires */}
                            <div className="mt-6 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                                    <FaCheckCircle className="text-green-600" />
                                    Résumé du Modèle
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Type :</span> CatBoost Regressor
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Horizon :</span> {metricsData.params?.horizon || 24} heures
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Lags utilisés :</span> {metricsData.params?.lags || 72}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Données totales :</span> {(metricsData.n_train + metricsData.n_val + metricsData.n_test).toLocaleString()} échantillons
                                    </p>
                                </div>
                            </div>

                            {/* Badge de performance */}
                            <div className="mt-6 flex justify-center">
                                <div className={`px-6 py-3 rounded-full font-semibold text-lg flex items-center gap-2 ${
                                    metricsData.metrics?.R2 >= 0.7 
                                        ? 'bg-green-100 text-green-700 border border-green-300' 
                                        : metricsData.metrics?.R2 >= 0.5 
                                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                            : 'bg-red-100 text-red-700 border border-red-300'
                                }`}>
                                    <FaCheckCircle />
                                    {metricsData.metrics?.R2 >= 0.7
                                        ? 'Modèle Performant'
                                        : metricsData.metrics?.R2 >= 0.5
                                            ? 'Modèle Acceptable'
                                            : 'Modèle à Améliorer'}
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </>
            )}
        </div>
    );
}

