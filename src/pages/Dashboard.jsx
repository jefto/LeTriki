import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
    FaArrowUp,
    FaChartLine,
    FaBolt,
    FaCalendarAlt,
    FaBrain,
    FaSpinner,
    FaCheckCircle,
    FaCity
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
    const [predictionComboData, setPredictionComboData] = useState(null);
    const [monthHeatmapData, setMonthHeatmapData] = useState(null);
    const [seriesLoading, setSeriesLoading] = useState(true);
    const [error, setError] = useState(null);

    // États pour les données de prévision
    const [modelMetrics, setModelMetrics] = useState(null);
    const [nextPrediction, setNextPrediction] = useState(null);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [currentHour] = useState(new Date().getHours());

    // Données Mock pour les villes
    const citiesData = [
        { city: 'Lomé', value: 450 },
        { city: 'Kara', value: 120 },
        { city: 'Sokodé', value: 90 },
        { city: 'Atakpamé', value: 60 },
        { city: 'Dapaong', value: 40 }
    ];

    // Loading global
    const loading = seriesLoading;

    // Obtenir la prédiction pour la prochaine heure
    const getNextHourPrediction = () => {
        if (!nextPrediction || !nextPrediction.predictions) return null;
        const nextHour = (currentHour + 1) % 24;
        const hourToFind = nextHour === 0 ? 24 : nextHour;
        return nextPrediction.predictions.find(p => p.hour === hourToFind);
    };

    // Charger les données au montage du composant
    useEffect(() => {
        const calculateAverage = (values) => {
            if (!values || values.length === 0) return 0;
            const sum = values.reduce((acc, val) => acc + (val || 0), 0);
            return sum / values.length;
        };

        const loadData = async () => {
            setSeriesLoading(true);
            setPredictionLoading(true);
            try {
                // Dates cibles
                const day0 = '2019-09-30';      // Jour "actuel"
                const dayMinus1 = '2019-09-29'; // Jour précédent
                const dayMinus2 = '2019-09-28'; // Jour avant-précédent
                
                const weekStart = '2019-09-24';
                const weekEnd = '2019-09-30';
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
                    weekResponse, 
                    monthResponse,
                    monthHourlyResponse, // Pour le heatmap mensuel
                    metricsResponse,
                    predictionResponse
                ] = await Promise.all([
                    AnalyticsService.getSeries(dayMinus2, day0, 'H', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(weekStart, weekEnd, 'D', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(monthStart, monthEnd, 'D', 'CONSOMMATION_TOTALE'),
                    AnalyticsService.getSeries(monthStart, monthEnd, 'H', 'CONSOMMATION_TOTALE'),
                    ModelService.getModelMetrics(),
                    ModelService.predictNextDay(predictionParams)
                ]);

                if (metricsResponse.data) setModelMetrics(metricsResponse.data);
                if (predictionResponse.data) setNextPrediction(predictionResponse.data);

                // ===== 1. GRAPHE COMPARAISON J-1 / J-2 =====
                if (rangeResponse.data) {
                    const dataMap = {};
                    if (rangeResponse.data.time_index) {
                        rangeResponse.data.time_index.forEach((time, index) => {
                            const date = new Date(time);
                            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${date.getHours()}`;
                            dataMap[key] = rangeResponse.data.y[index];
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
                             if (predictionResponse.data && predictionResponse.data.predictions) {
                                const labelHour = mainDate.getHours();
                                const hourToFind = labelHour === 0 ? 24 : labelHour;
                                const pred = predictionResponse.data.predictions.find(p => p.hour === hourToFind);
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
                            predHoverTemplate.push('<b>Hier - %{x|%Hh}</b><br>Consommation: %{y:.2f} MW<extra></extra>');
                        } else {
                            mainY.push(null);
                            predY.push(predictionValue);
                            predHoverTemplate.push('<b>Prévision - %{x|%Hh}</b><br>Consommation: %{y:.2f} MW<extra></extra>');
                        }
                    }

                    setDailyCurveData([
                        {
                            x: xValues,
                            y: mainY,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: 'Hier',
                            line: { color: '#E3001B', width: 3 },
                            marker: { color: '#E3001B', size: 6 },
                            hovertemplate: '<b>Hier - %{x|%Hh}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
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
                            hovertemplate: '<b>Avant Hier - %{x|%Hh}</b><br>Consommation: %{y:.2f} MW<extra></extra>'
                        }
                    ]);

                    // KPIs
                    let todayTotal = 0;
                    let yesterdayTotal = 0;
                    Object.keys(dataMap).forEach(key => {
                        if (key.startsWith('2019-09-30')) todayTotal += dataMap[key] || 0;
                        if (key.startsWith('2019-09-29')) yesterdayTotal += dataMap[key] || 0;
                    });
                    const variation = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;
                    
                    // Moyennes
                    let weeklyAvg = 0;
                    if (weekResponse.data && weekResponse.data.y) {
                        const vals = weekResponse.data.y;
                        weeklyAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
                    }
                    let monthlyAvg = 0;
                    if (monthResponse.data && monthResponse.data.y) {
                        const vals = monthResponse.data.y;
                        monthlyAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
                    }

                    setSummaryData({
                        prevDayTotal: todayTotal,
                        prevVsPrevday: variation,
                        weeklyAvg: weeklyAvg,
                        monthlyAvg: monthlyAvg
                    });
                }

                // ===== 2. GRAPHE HEBDOMADAIRE (Jours seulement) =====
                if (weekResponse.data && weekResponse.data.y) {
                    const vals = weekResponse.data.y;
                    const weekTimeIndex = weekResponse.data.time_index || [];
                    
                    // Formatage des labels : Juste le nom du jour
                    const xLabelsWeek = weekTimeIndex.map((timestamp) => {
                        const date = new Date(timestamp);
                        // 'fr-FR' avec weekday: 'short' donne 'lun.', 'mar.', etc.
                        // On met la première lettre en majuscule
                        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                        return dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', '');
                    });
                    
                    setWeeklyHistData([{
                        x: xLabelsWeek,
                        y: vals,
                        type: 'bar',
                        name: 'Conso',
                        marker: {
                            color: vals.map((_, i) => i === vals.length - 1 ? '#E3001B' : '#FDB913'),
                        },
                        hovertemplate: '<b>%{x}</b><br>%{y:.2f} MW<extra></extra>'
                    }]);
                }

                // ===== 3. GRAPHE PRÉVISION (Bâtons + Ligne) =====
                if (predictionResponse.data && predictionResponse.data.predictions) {
                    const predictions = predictionResponse.data.predictions;
                    const hours = predictions.map(p => `${p.hour.toString().padStart(2, '0')}h`);
                    const values = predictions.map(p => p.prediction);

                    setPredictionComboData([
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
                    ]);
                }

                // ===== 4. HEATMAP MENSUEL (Jours vs Heures) =====
                if (monthHourlyResponse.data && monthHourlyResponse.data.y) {
                    const hourlyData = monthHourlyResponse.data;
                    const timestamps = hourlyData.time_index;
                    const values = hourlyData.y;

                    // Extraction des jours uniques et heures
                    const dates = [...new Set(timestamps.map(t => new Date(t).toLocaleDateString('fr-FR')))];
                    const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}h`);

                    // Construction de la matrice Z [heures][jours] ou [jours][heures]
                    // Plotly Heatmap: z[y][x]
                    // On veut X=Jours, Y=Heures. Donc Z doit être un tableau de tableaux où chaque sous-tableau correspond à une HEURE (Y) et contient les valeurs pour chaque JOUR (X).
                    
                    const zData = hours.map((h, hourIndex) => {
                        return dates.map(d => {
                            // Trouver la valeur correspondant à ce jour et cette heure
                            // Note: C'est un peu lent O(N^2), mais N est petit (30 jours * 24 heures)
                            const index = timestamps.findIndex(t => {
                                const date = new Date(t);
                                return date.toLocaleDateString('fr-FR') === d && date.getHours() === hourIndex;
                            });
                            return index !== -1 ? values[index] : null;
                        });
                    });

                    setMonthHeatmapData([{
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
                        hovertemplate: 'Jour: %{x}<br>Heure: %{y}<br>Conso: %{z:.2f} MW<extra></extra>'
                    }]);
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


    const MetricCard = ({ title, value, icon, iconColor = "text-[#E3001B]", iconBg = "bg-red-50" }) => (
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100 overflow-hidden h-full flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1">
                <div className="text-gray-900 text-2xl font-bold font-poppins">{value}</div>
                <div className={`${iconBg} ${iconColor} p-2 rounded-lg text-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-500 text-xs font-poppins uppercase tracking-wider font-medium">{title}</h3>
        </div>
    );

    const ChartCard = ({ title, children, icon }) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden h-full">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                        <MetricCard
                            title="Consommation Jour Précédent"
                            value={summaryData ? `${summaryData.prevDayTotal.toFixed(2)} MW` : "-- MW"}
                            icon={<FaBolt />}
                            iconColor="text-[#E3001B]"
                            iconBg="bg-red-50"
                        />
                        <MetricCard
                            title="Moyenne Hebdomadaire"
                            value={summaryData ? `${summaryData.weeklyAvg.toFixed(2)} MW` : "-- MW"}
                            icon={<FaCalendarAlt />}
                            iconColor="text-[#FDB913]"
                            iconBg="bg-yellow-50"
                        />
                        <MetricCard
                            title="Moyenne Mensuelle"
                            value={summaryData ? `${summaryData.monthlyAvg.toFixed(2)} MW` : "-- MW"}
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
                            icon={<FaBrain />}
                            iconColor="text-[#FDB913]"
                            iconBg="bg-yellow-50"
                        />
                    </div>

                    <div className="space-y-6">
                        {/* LIGNE 1: Comparaison J-1 / J-2 - Pleine largeur */}
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
                                            autosize: true,
                                            xaxis: {
                                                type: 'date',
                                                tickformat: '%Hh',
                                                tickangle: -45,
                                                dtick: 7200000 // 2 heures en millisecondes
                                            }
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        config={{ displayModeBar: false, responsive: true }}
                                        useResizeHandler={true}
                                    />
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-[350px] w-full">
                                    <FaSpinner className="animate-spin text-[#E3001B] text-4xl" />
                                </div>
                            )}
                        </ChartCard>

                        {/* LIGNE 2: Consommation Hebdo + Répartition Villes */}
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
                                        <FaSpinner className="animate-spin text-[#E3001B] text-4xl" />
                                    </div>
                                )}
                            </ChartCard>

                            {/* Donut Chart - Répartition par Ville */}
                            <ChartCard
                                title="Répartition par Ville"
                                icon={<FaCity />}
                            >
                                <div className="w-full h-[350px]">
                                    <Plot
                                        data={[{
                                            values: citiesData.map(c => c.value),
                                            labels: citiesData.map(c => c.city),
                                            type: 'pie',
                                            hole: 0.6, // Anneau
                                            marker: {
                                                colors: ['#E3001B', '#FDB913', '#FF6B35', '#8B0000', '#F59E0B']
                                            },
                                            textinfo: 'label+percent',
                                            hoverinfo: 'label+value+percent'
                                        }]}
                                        layout={{
                                            ...getPlotlyLayout('', '', ''),
                                            margin: { t: 20, r: 20, b: 20, l: 20 },
                                            showlegend: true,
                                            legend: { orientation: 'v', x: 1, y: 0.5 }
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        config={{ displayModeBar: false, responsive: true }}
                                        useResizeHandler={true}
                                    />
                                </div>
                            </ChartCard>
                        </div>

                        {/* LIGNE 3: Prévisions (Bâtons + Ligne) */}
                        <ChartCard
                            title="Prévisions 24h (Bâtons + Tendance)"
                            icon={<FaBrain />}
                        >
                            {predictionComboData ? (
                                <div className="w-full h-[350px]">
                                    <Plot
                                        data={predictionComboData}
                                        layout={{
                                            ...getPlotlyLayout('', 'Heure (24h)', 'Consommation (MW)'),
                                            margin: { t: 30, r: 40, b: 80, l: 80 },
                                            legend: { orientation: 'h', y: -0.2 },
                                            xaxis: {
                                                tickangle: -45
                                            }
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        config={{ displayModeBar: false, responsive: true }}
                                        useResizeHandler={true}
                                    />
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-[350px] w-full">
                                    <FaSpinner className="animate-spin text-[#E3001B] text-4xl" />
                                </div>
                            )}
                        </ChartCard>

                        {/* LIGNE 4: Heatmap Mensuel (Pleine largeur) */}
                        <ChartCard
                            title="Carte de Chaleur Mensuelle (Jours vs Heures)"
                            icon={<MdBarChart />}
                        >
                            {monthHeatmapData ? (
                                <div className="w-full h-[400px]">
                                    <Plot
                                        data={monthHeatmapData}
                                        layout={{
                                            ...getPlotlyLayout('', 'Jour', 'Heure'),
                                            margin: { t: 30, r: 50, b: 80, l: 80 },
                                            xaxis: {
                                                tickangle: -45
                                            },
                                            yaxis: {
                                                tickmode: 'linear',
                                                dtick: 2 // Intervalle de 2 heures
                                            }
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        config={{ displayModeBar: false, responsive: true }}
                                        useResizeHandler={true}
                                    />
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-[400px] w-full">
                                    <FaSpinner className="animate-spin text-[#E3001B] text-4xl" />
                                </div>
                            )}
                        </ChartCard>
                    </div>

                    {/* Section Module Prévision (inchangée) */}
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