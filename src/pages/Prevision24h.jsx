import { useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { GiCrystalBall } from "react-icons/gi";
import { FaFileExport, FaFileExcel, FaFileCsv, FaFileImage, FaChartLine, FaHistory, FaDownload } from "react-icons/fa";
import { MdShowChart } from "react-icons/md";
import Plot from 'react-plotly.js';

export default function Prevision24h() {
    const [selectedDate, setSelectedDate] = useState('2025-12-26');
    const [selectedModel, setSelectedModel] = useState('LSTM');
    const [confidence, setConfidence] = useState(95);

    // Données pour le graphique 24h
    const hourlyData = {
        x: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
            '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        prevision: [280, 265, 250, 245, 255, 270, 310, 360, 400, 425, 440, 455,
                    465, 460, 450, 445, 460, 490, 520, 510, 480, 420, 360, 310],
        confInf: [265, 252, 238, 233, 242, 256, 295, 342, 380, 403, 418, 432,
                  442, 437, 428, 423, 437, 466, 494, 485, 456, 399, 342, 295],
        confSup: [295, 278, 262, 257, 268, 284, 325, 378, 420, 447, 462, 478,
                  488, 483, 472, 467, 483, 514, 546, 535, 504, 441, 378, 325]
    };

    // Données du tableau détaillé
    const detailedData = [
        { heure: '00:00', prevision: 280, confSup: 295, intervalle: 85, statut: 'Normal' },
        { heure: '01:00', prevision: 265, confSup: 278, intervalle: 82, statut: 'Normal' },
        { heure: '02:00', prevision: 250, confSup: 262, intervalle: 80, statut: 'Normal' },
        { heure: '03:00', prevision: 245, confSup: 257, intervalle: 78, statut: 'Normal' },
        { heure: '04:00', prevision: 255, confSup: 268, intervalle: 79, statut: 'Normal' },
        { heure: '05:00', prevision: 270, confSup: 284, intervalle: 81, statut: 'Normal' },
        { heure: '06:00', prevision: 310, confSup: 325, intervalle: 84, statut: 'Normal' },
        { heure: '07:00', prevision: 360, confSup: 378, intervalle: 88, statut: 'Pic Matin' },
        { heure: '08:00', prevision: 400, confSup: 420, intervalle: 90, statut: 'Pic Matin' },
        { heure: '09:00', prevision: 425, confSup: 447, intervalle: 91, statut: 'Pic Matin' },
        { heure: '10:00', prevision: 440, confSup: 462, intervalle: 92, statut: 'Normal' },
        { heure: '11:00', prevision: 455, confSup: 478, intervalle: 93, statut: 'Normal' },
        { heure: '12:00', prevision: 465, confSup: 488, intervalle: 94, statut: 'Normal' },
        { heure: '13:00', prevision: 460, confSup: 483, intervalle: 93, statut: 'Normal' },
        { heure: '14:00', prevision: 450, confSup: 472, intervalle: 92, statut: 'Normal' },
        { heure: '15:00', prevision: 445, confSup: 467, intervalle: 91, statut: 'Normal' },
        { heure: '16:00', prevision: 460, confSup: 483, intervalle: 93, statut: 'Normal' },
        { heure: '17:00', prevision: 490, confSup: 514, intervalle: 94, statut: 'Pic Soir' },
        { heure: '18:00', prevision: 520, confSup: 546, intervalle: 96, statut: 'Pic Soir' },
        { heure: '19:00', prevision: 510, confSup: 535, intervalle: 95, statut: 'Pic Soir' },
        { heure: '20:00', prevision: 480, confSup: 504, intervalle: 93, statut: 'Normal' },
        { heure: '21:00', prevision: 420, confSup: 441, intervalle: 90, statut: 'Normal' },
        { heure: '22:00', prevision: 360, confSup: 378, intervalle: 88, statut: 'Normal' },
        { heure: '23:00', prevision: 310, confSup: 325, intervalle: 84, statut: 'Normal' },
    ];

    // Données historiques
    const historiqueData = [
        { date: '25 Déc 2025', prevision: 418, confSup: 441, intervalle: 91, statut: 'Normal' },
        { date: '24 Déc 2025', prevision: 445, confSup: 468, intervalle: 93, statut: 'Pic Soir' },
        { date: '23 Déc 2025', prevision: 432, confSup: 454, intervalle: 92, statut: 'Pic Matin' },
        { date: '22 Déc 2025', prevision: 425, confSup: 447, intervalle: 91, statut: 'Normal' },
        { date: '21 Déc 2025', prevision: 438, confSup: 461, intervalle: 92, statut: 'Pic Soir' },
    ];

    const getStatusStyle = (statut) => {
        switch (statut) {
            case 'Normal':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Pic Matin':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Pic Soir':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

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
                <p className="text-tertiary/70 text-lg font-poppins mb-2">Génération et analyse des prévisions</p>
                <h1 className="text-5xl font-poppins font-bold bg-gradient-to-r from-tertiary to-blue-600 bg-clip-text text-transparent mb-2">
                    Prévision 24h
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-secondary to-tertiary rounded-full"></div>
            </div>

            {/* Formulaire de génération */}
            <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Date Cible */}
                    <div>
                        <label className="flex items-center gap-2 text-white/80 font-semibold mb-2">
                            <CiCalendarDate className="text-secondary text-xl" />
                            Date Cible (J+1)
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                    </div>

                    {/* Modèle */}
                    <div>
                        <label className="block text-white/80 font-semibold mb-2">
                            Modèle de Prévision
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        >
                            <option value="LSTM">LSTM</option>
                            <option value="GRU">GRU</option>
                            <option value="ARIMA">ARIMA</option>
                            <option value="Prophet">Prophet</option>
                        </select>
                    </div>

                    {/* Intervalle de confiance */}
                    <div>
                        <label className="block text-white/80 font-semibold mb-2">
                            Intervalle de confiance (%)
                        </label>
                        <input
                            type="number"
                            value={confidence}
                            onChange={(e) => setConfidence(e.target.value)}
                            min="80"
                            max="99"
                            className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                    </div>
                </div>

                {/* Bouton Générer */}
                <button className="mt-6 w-full md:w-auto bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                    <GiCrystalBall className="text-2xl" />
                    Générer Prévision
                </button>
            </div>

            {/* Graphique de la courbe de charge */}
            <ChartCard
                title="Courbe de charge prévue - 26 Décembre 2025"
                icon={<MdShowChart />}
            >
                {/* Boutons d'export */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-white/70 flex items-center gap-2">
                        <FaFileExport />
                        Export :
                    </span>
                    <button className="bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/10">
                        <FaFileImage />
                        PNG
                    </button>
                    <button className="bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/10">
                        <FaFileCsv />
                        CSV
                    </button>
                    <button className="bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/10">
                        <FaFileExcel />
                        Excel
                    </button>
                </div>

                {/* Graphique */}
                <Plot
                    data={[
                        {
                            x: hourlyData.x,
                            y: hourlyData.prevision,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: 'Prévision',
                            line: { color: '#E9FA00', width: 4 },
                            marker: { color: '#E9FA00', size: 8 },
                        },
                        {
                            x: hourlyData.x,
                            y: hourlyData.confSup,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Conf. Sup.',
                            line: { color: '#60A5FA', width: 2, dash: 'dash' },
                            fill: 'tonexty',
                            fillcolor: 'rgba(96, 165, 250, 0.1)'
                        },
                        {
                            x: hourlyData.x,
                            y: hourlyData.confInf,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Conf. Inf.',
                            line: { color: '#60A5FA', width: 2, dash: 'dash' },
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
                    style={{ width: '100%', height: '450px' }}
                    config={{ displayModeBar: true }}
                />
            </ChartCard>

            {/* Prévision détaillée */}
            <div className="mt-8">
                <ChartCard
                    title="Prévision détaillée - 26 Décembre 2025"
                    icon={<FaChartLine />}
                >
                    {/* Bouton export Excel */}
                    <div className="flex justify-end mb-4">
                        <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2">
                            <FaFileExcel />
                            Exporter Excel
                        </button>
                    </div>

                    {/* Tableau */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left py-3 px-4 font-semibold text-secondary">Heure</th>
                                    <th className="text-right py-3 px-4 font-semibold text-secondary">Prévision (MW)</th>
                                    <th className="text-right py-3 px-4 font-semibold text-secondary">Conf. Sup. (MW)</th>
                                    <th className="text-left py-3 px-4 font-semibold text-secondary">Intervalle</th>
                                    <th className="text-center py-3 px-4 font-semibold text-secondary">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedData.map((row, index) => (
                                    <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-medium">{row.heure}</td>
                                        <td className="py-3 px-4 text-right font-bold">{row.prevision}</td>
                                        <td className="py-3 px-4 text-right">{row.confSup}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-secondary to-green-400 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${row.intervalle}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">{row.intervalle}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(row.statut)}`}>
                                                {row.statut}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            </div>

            {/* Historique des prédictions */}
            <div className="mt-8">
                <ChartCard
                    title="Historique des prédictions"
                    icon={<FaHistory />}
                >
                    {/* Tableau */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left py-3 px-4 font-semibold text-secondary">Date</th>
                                    <th className="text-right py-3 px-4 font-semibold text-secondary">Prévision (MW)</th>
                                    <th className="text-right py-3 px-4 font-semibold text-secondary">Conf. Sup. (MW)</th>
                                    <th className="text-left py-3 px-4 font-semibold text-secondary">Intervalle</th>
                                    <th className="text-center py-3 px-4 font-semibold text-secondary">Statut</th>
                                    <th className="text-center py-3 px-4 font-semibold text-secondary">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historiqueData.map((row, index) => (
                                    <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-medium">{row.date}</td>
                                        <td className="py-3 px-4 text-right font-bold">{row.prevision}</td>
                                        <td className="py-3 px-4 text-right">{row.confSup}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-secondary to-green-400 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${row.intervalle}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">{row.intervalle}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(row.statut)}`}>
                                                {row.statut}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto">
                                                <FaDownload className="text-sm" />
                                                Excel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}

