import React from 'react';
import Plot from 'react-plotly.js';
import { 
    FaArrowUp, 
    FaClock, 
    FaChartLine, 
    FaFileAlt, 
    FaBolt,
    FaCalendarAlt,
    FaBrain
} from 'react-icons/fa';
import { 
    MdShowChart,
    MdBarChart
} from 'react-icons/md';

export default function Dashboard() {
    // Données pour le graphique mensuel
    const monthlyData = {
        x: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        moisActuel: [380, 420, 450, 425, 480, 520, 560, 540, 490, 465, 440, 425],
        moisPrecedent: [360, 400, 430, 410, 460, 500, 530, 520, 470, 450, 420, 410]
    };

    // Données pour le graphique journalier
    const dailyData = {
        x: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        aujourdhui: [280, 250, 380, 450, 520, 420],
        hier: [290, 260, 370, 440, 510, 410]
    };

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

            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Consommation Actuelle"
                    value="425 MW"
                    subtitle="+3.2% vs hier"
                    icon={<FaBolt />}
                    trend="up"
                    trendValue="+3.2%"
                />
                <MetricCard
                    title="Prochaine Prédiction"
                    value="18h00"
                    subtitle="Pic prévu : 520 MW"
                    icon={<FaClock />}
                    bgGradient="from-blue-800 to-tertiary"
                />
                <MetricCard
                    title="Précision Modèle"
                    value="8.5%"
                    subtitle="MAPE (7 derniers jours)"
                    icon={<MdBarChart />}
                    trend="down"
                    trendValue="2.1%"
                    bgGradient="from-tertiary to-purple-800"
                />
                <MetricCard
                    title="Prévisions Générées"
                    value="247"
                    subtitle="Ce mois-ci"
                    icon={<FaFileAlt />}
                    trend="up"
                    trendValue="+12"
                    bgGradient="from-blue-900 to-tertiary"
                />
            </div>

            {/* Graphiques et sections */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Colonne des graphiques - 2/3 de la largeur */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Graphique journalier */}
                    <ChartCard 
                        title="Consommation Journalière" 
                        icon={<MdShowChart />}
                    >
                        <Plot
                            data={[
                                {
                                    x: dailyData.x,
                                    y: dailyData.aujourdhui,
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    name: "Aujourd'hui",
                                    line: { color: '#E9FA00', width: 4 },
                                    marker: { color: '#E9FA00', size: 10 },
                                    fill: 'tonexty',
                                    fillcolor: 'rgba(233, 250, 0, 0.2)'
                                },
                                {
                                    x: dailyData.x,
                                    y: dailyData.hier,
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    name: 'Hier',
                                    line: { color: '#60A5FA', width: 3, dash: 'dash' },
                                    marker: { color: '#60A5FA', size: 8 }
                                }
                            ]}
                            layout={{
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: 'white', family: 'Poppins' },
                                xaxis: { 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    title: 'Heure'
                                },
                                yaxis: { 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    title: 'Consommation (MW)'
                                },
                                legend: { 
                                    orientation: 'h',
                                    y: -0.15,
                                    x: 0.5,
                                    xanchor: 'center',
                                    font: { color: 'white', size: 14 }
                                },
                                margin: { t: 30, r: 40, b: 80, l: 80 },
                                showlegend: true
                            }}
                            style={{ width: '100%', height: '400px' }}
                            config={{ displayModeBar: false }}
                        />
                    </ChartCard>

                    {/* Graphique mensuel */}
                    <ChartCard 
                        title="Consommation Mensuelle" 
                        icon={<FaCalendarAlt />}
                    >
                        <Plot
                            data={[
                                {
                                    x: monthlyData.x,
                                    y: monthlyData.moisActuel,
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    name: 'Mois Actuel',
                                    line: { color: '#E9FA00', width: 3 },
                                    marker: { color: '#E9FA00', size: 8 }
                                },
                                {
                                    x: monthlyData.x,
                                    y: monthlyData.moisPrecedent,
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    name: 'Mois Précédent',
                                    line: { color: '#60A5FA', width: 2, dash: 'dash' },
                                    marker: { color: '#60A5FA', size: 6 }
                                }
                            ]}
                            layout={{
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: 'white', family: 'Poppins' },
                                xaxis: { 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    title: 'Mois'
                                },
                                yaxis: { 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    title: 'Consommation (MW)'
                                },
                                legend: { 
                                    orientation: 'h',
                                    y: -0.15,
                                    x: 0.5,
                                    xanchor: 'center',
                                    font: { color: 'white', size: 14 }
                                },
                                margin: { t: 30, r: 40, b: 80, l: 80 },
                                showlegend: true
                            }}
                            style={{ width: '100%', height: '400px' }}
                            config={{ displayModeBar: false }}
                        />
                    </ChartCard>
                </div>

                {/* Section Prédiction - 1/3 de la largeur */}
                <div className="xl:col-span-1 space-y-5">
                    {/* Résumé Mensuel Numérique */}
                    <ChartCard 
                        title="Résumé Mensuel" 
                        icon={<FaChartLine />}
                    >
                        <div className="space-y-6">
                            {/* Statistiques principales */}
                            <div className="bg-black/20 rounded-xl p-6 border border-secondary/30">
                                <h4 className="text-secondary font-semibold mb-4 flex items-center gap-2">
                                    <MdBarChart />
                                    Consommation Décembre
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Total Mois</span>
                                        <span className="text-white font-bold text-lg">13,247 MW</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Moyenne par Jour</span>
                                        <span className="text-white font-bold text-lg">427 MW</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Pic Maximum</span>
                                        <span className="text-secondary font-bold text-lg">578 MW</span>
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
                                    Prévision J+1
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Moyenne</span>
                                        <span className="text-white font-bold text-lg">432 MW</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Écart-type</span>
                                        <span className="text-white font-bold text-lg">±45 MW</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Pic Maximum</span>
                                        <span className="text-secondary font-bold text-lg">547 MW</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Total Journée</span>
                                        <span className="text-white font-bold text-lg">10.4 GWh</span>
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
                                            <span className="text-white font-semibold">91.5%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-secondary to-green-400 h-3 rounded-full transition-all duration-1000" style={{width: '91.5%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-white/60">Précision</span>
                                            <span className="text-white font-semibold">87.2%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-blue-400 to-secondary h-3 rounded-full transition-all duration-1000" style={{width: '87.2%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Prochaine mise à jour */}
                            <div className="bg-gradient-to-r from-tertiary/50 to-blue-800/50 rounded-xl p-4 border border-secondary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaClock className="text-secondary" />
                                    <span className="text-white font-semibold">Prochaine Mise à Jour</span>
                                </div>
                                <p className="text-secondary text-xl font-bold">dans 2h 15min</p>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}
