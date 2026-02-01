import { useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { FaFileExport, FaFileExcel, FaFileCsv, FaFileImage, FaChartLine, FaHistory, FaDownload } from "react-icons/fa";
import { MdShowChart } from "react-icons/md";
import Plot from 'react-plotly.js';

export default function Prevision24h() {
    const [selectedModel, setSelectedModel] = useState('LSTM');

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
        { heure: '00:00', prevision: 280, confSup: 295, confiance: 85, statut: 'Normal' },
        { heure: '01:00', prevision: 265, confSup: 278, confiance: 82, statut: 'Normal' },
        { heure: '02:00', prevision: 250, confSup: 262, confiance: 80, statut: 'Normal' },
        { heure: '03:00', prevision: 245, confSup: 257, confiance: 78, statut: 'Normal' },
        { heure: '04:00', prevision: 255, confSup: 268, confiance: 79, statut: 'Normal' },
        { heure: '05:00', prevision: 270, confSup: 284, confiance: 81, statut: 'Normal' },
        { heure: '06:00', prevision: 310, confSup: 325, confiance: 84, statut: 'Normal' },
        { heure: '07:00', prevision: 360, confSup: 378, confiance: 88, statut: 'Pic Matin' },
        { heure: '08:00', prevision: 400, confSup: 420, confiance: 90, statut: 'Pic Matin' },
        { heure: '09:00', prevision: 425, confSup: 447, confiance: 91, statut: 'Pic Matin' },
        { heure: '10:00', prevision: 440, confSup: 462, confiance: 92, statut: 'Normal' },
        { heure: '11:00', prevision: 455, confSup: 478, confiance: 93, statut: 'Normal' },
        { heure: '12:00', prevision: 465, confSup: 488, confiance: 94, statut: 'Normal' },
        { heure: '13:00', prevision: 460, confSup: 483, confiance: 93, statut: 'Normal' },
        { heure: '14:00', prevision: 450, confSup: 472, confiance: 92, statut: 'Normal' },
        { heure: '15:00', prevision: 445, confSup: 467, confiance: 91, statut: 'Normal' },
        { heure: '16:00', prevision: 460, confSup: 483, confiance: 93, statut: 'Normal' },
        { heure: '17:00', prevision: 490, confSup: 514, confiance: 94, statut: 'Pic Soir' },
        { heure: '18:00', prevision: 520, confSup: 546, confiance: 96, statut: 'Pic Soir' },
        { heure: '19:00', prevision: 510, confSup: 535, confiance: 95, statut: 'Pic Soir' },
        { heure: '20:00', prevision: 480, confSup: 504, confiance: 93, statut: 'Normal' },
        { heure: '21:00', prevision: 420, confSup: 441, confiance: 90, statut: 'Normal' },
        { heure: '22:00', prevision: 360, confSup: 378, confiance: 88, statut: 'Normal' },
        { heure: '23:00', prevision: 310, confSup: 325, confiance: 84, statut: 'Normal' },
    ];

    // Données historiques
    const historiqueData = [
        { date: '25 Déc 2025', prevision: 418, confSup: 441, confiance: 91, statut: 'Normal' },
        { date: '24 Déc 2025', prevision: 445, confSup: 468, confiance: 93, statut: 'Pic Soir' },
        { date: '23 Déc 2025', prevision: 432, confSup: 454, confiance: 92, statut: 'Pic Matin' },
        { date: '22 Déc 2025', prevision: 425, confSup: 447, confiance: 91, statut: 'Normal' },
        { date: '21 Déc 2025', prevision: 438, confSup: 461, confiance: 92, statut: 'Pic Soir' },
    ];

    const getStatusStyle = (statut) => {
        switch (statut) {
            case 'Normal':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'Pic Matin':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'Pic Soir':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

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
                <p className="text-gray-500 text-lg font-poppins mb-2">Génération et analyse des prévisions</p>
                <h1 className="text-5xl font-poppins font-bold text-gray-900 mb-2">
                    Prévision 24h
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>

            {/* Sélection de l'horizon temporel */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
                <div className="max-w-md">
                    {/* Horizon temporel*/}
                    <div>
                        <label className="flex items-center gap-2 text-gray-600 font-semibold mb-2">
                            <CiCalendarDate className="text-[#E3001B] text-xl" />
                            Horizon Temporel
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                        >
                            <option value="Journaliere">Journalière (24h)</option>
                            <option value="Hebdomadaire">Hebdomadaire</option>
                            <option value="Mensuel">Mensuel</option>
                            <option value="Annuel">Annuel</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Graphique de la courbe de charge */}
            <ChartCard
                title="Courbe de charge prévue - 26 Décembre 2025"
                icon={<MdShowChart />}
            >
                {/* Boutons d'export */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-gray-500 flex items-center gap-2">
                        <FaFileExport />
                        Export :
                    </span>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200">
                        <FaFileImage />
                        PNG
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200">
                        <FaFileCsv />
                        CSV
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2">
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
                            line: { color: '#E3001B', width: 4 },
                            marker: { color: '#E3001B', size: 8 },
                        },
                        {
                            x: hourlyData.x,
                            y: hourlyData.confSup,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Conf. Sup.',
                            line: { color: '#FDB913', width: 2, dash: 'dash' },
                            fill: 'tonexty',
                            fillcolor: 'rgba(253, 185, 19, 0.1)'
                        },
                        {
                            x: hourlyData.x,
                            y: hourlyData.confInf,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Conf. Inf.',
                            line: { color: '#FDB913', width: 2, dash: 'dash' },
                        }
                    ]}
                    layout={{
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#1F2937', family: 'Poppins' },
                        xaxis: {
                            gridcolor: '#E5E7EB',
                            zerolinecolor: '#D1D5DB',
                            title: 'Heure',
                            tickfont: { color: '#6B7280' }
                        },
                        yaxis: {
                            gridcolor: '#E5E7EB',
                            zerolinecolor: '#D1D5DB',
                            title: 'Consommation (MW)',
                            tickfont: { color: '#6B7280' }
                        },
                        legend: {
                            orientation: 'h',
                            y: -0.15,
                            x: 0.5,
                            xanchor: 'center',
                            font: { color: '#1F2937', size: 14 }
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
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2">
                            <FaFileExcel />
                            Exporter Excel
                        </button>
                    </div>

                    {/* Tableau */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-gray-700">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Heure</th>
                                    <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Prévision (MW)</th>
                                    <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Conf. Sup. (MW)</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Confiance</th>
                                    <th className="text-center py-3 px-4 font-semibold text-[#E3001B]">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedData.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{row.heure}</td>
                                        <td className="py-3 px-4 text-right font-bold">{row.prevision}</td>
                                        <td className="py-3 px-4 text-right">{row.confSup}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-[#E3001B] to-[#FDB913] h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${row.confiance}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">{row.confiance}%</span>
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
                        <table className="w-full text-gray-700">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Date</th>
                                    <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Prévision (MW)</th>
                                    <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Conf. Sup. (MW)</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Confiance</th>
                                    <th className="text-center py-3 px-4 font-semibold text-[#E3001B]">Statut</th>
                                    <th className="text-center py-3 px-4 font-semibold text-[#E3001B]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historiqueData.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{row.date}</td>
                                        <td className="py-3 px-4 text-right font-bold">{row.prevision}</td>
                                        <td className="py-3 px-4 text-right">{row.confSup}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-[#E3001B] to-[#FDB913] h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${row.confiance}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">{row.confiance}%</span>
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

