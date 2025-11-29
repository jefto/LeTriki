import { useState } from "react";
import { FaDownload, FaFileCsv, FaFileExcel, FaFileExport, FaFileImage, FaHistory, FaSearch } from "react-icons/fa";
import { MdShowChart } from "react-icons/md";
import { BsCalendarDate, BsBuilding } from "react-icons/bs";
import { GiModernCity } from "react-icons/gi";
import Plot from 'react-plotly.js';

export default function AnalyseHistorique() {
    const [selectedDate, setSelectedDate] = useState('');
    const [ville, setVille] = useState('');
    const [region, setRegion] = useState('');

    // Données des régions et villes du Togo
    const regionsVilles = {
        'Maritime': ['Lomé', 'Aného', 'Vogan', 'Tsévié', 'Tabligbo', 'Afagnan'],
        'Plateaux': ['Atakpamé', 'Kpalimé', 'Notsé', 'Badou', 'Amlamé'],
        'Centrale': ['Sokodé', 'Tchamba', 'Sotouboua', 'Blitta'],
        'Kara': ['Kara', 'Niamtougou', 'Bassar', 'Bafilo', 'Pagouda'],
        'Savanes': ['Dapaong', 'Mango', 'Cinkassé', 'Tandjoaré']
    };

    // Quand la région change, réinitialiser la ville
    const handleRegionChange = (e) => {
        setRegion(e.target.value);
        setVille(''); // Réinitialiser la ville
    };

    // Obtenir les villes disponibles selon la région sélectionnée
    const getAvailableCities = () => {
        if (region && regionsVilles[region]) {
            return regionsVilles[region];
        }
        return [];
    };

    // Gestion des checkboxes avec logique mutuelle
    const [joursFeries, setJoursFeries] = useState(false);
    const [joursSemaine, setJoursSemaine] = useState(false);
    const [parMois, setParMois] = useState(false);
    const [parAn, setParAn] = useState(false);

    // Logique de gestion des checkboxes
    const handleDayCheckbox = (type) => {
        if (type === 'feries') {
            setJoursFeries(!joursFeries);
            if (!joursFeries) {
                setParMois(false);
                setParAn(false);
            }
        } else if (type === 'semaine') {
            setJoursSemaine(!joursSemaine);
            if (!joursSemaine) {
                setParMois(false);
                setParAn(false);
            }
        }
    };

    const handlePeriodCheckbox = (type) => {
        if (type === 'mois') {
            setParMois(!parMois);
            if (!parMois) {
                setJoursFeries(false);
                setJoursSemaine(false);
            }
        } else if (type === 'an') {
            setParAn(!parAn);
            if (!parAn) {
                setJoursFeries(false);
                setJoursSemaine(false);
            }
        }
    };

    // État pour gérer l'affichage du graphique
    const [showGraph, setShowGraph] = useState(false);
    const [graphData, setGraphData] = useState(null);

    // Données du tableau
    const historiqueData = [
        { date: '25 Déc 2025', prevision: 418, confSup: 441, confiance: 91, statut: 'Normal' },
        { date: '24 Déc 2025', prevision: 445, confSup: 468, confiance: 93, statut: 'Pic Soir' },
        { date: '23 Déc 2025', prevision: 432, confSup: 454, confiance: 92, statut: 'Pic Matin' },
        { date: '22 Déc 2025', prevision: 425, confSup: 447, confiance: 91, statut: 'Normal' },
        { date: '21 Déc 2025', prevision: 438, confSup: 461, confiance: 92, statut: 'Pic Soir' },
    ];

    // Données pour les graphiques selon le type d'analyse
    const getGraphData = () => {
        // Si analyse d'un jour (24 heures)
        if (joursFeries || joursSemaine) {
            return {
                x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                y: [280, 265, 250, 245, 255, 270, 310, 360, 400, 425, 440, 455,
                    465, 460, 450, 445, 460, 490, 520, 510, 480, 420, 360, 310],
                title: 'Analyse Journalière'
            };
        }
        // Si analyse d'un mois (31 jours)
        else if (parMois) {
            return {
                x: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
                y: Array.from({ length: 31 }, () => Math.floor(Math.random() * 200) + 350),
                title: 'Analyse Mensuelle'
            };
        }
        // Si analyse d'une année (12 mois)
        else if (parAn) {
            return {
                x: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
                y: [420, 410, 395, 385, 400, 425, 450, 460, 440, 430, 425, 435],
                title: 'Analyse Annuelle'
            };
        }
        return null;
    };

    const handleSearch = () => {
        const data = getGraphData();
        setGraphData(data);
        setShowGraph(true);
    };

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
                <p className="text-tertiary/70 text-lg font-poppins mb-2">Exploration et analyse des données historiques</p>
                <h1 className="text-5xl font-poppins font-bold bg-gradient-to-r from-tertiary to-blue-600 bg-clip-text text-transparent mb-2">
                    Analyse Historique
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-secondary to-tertiary rounded-full"></div>
            </div>

            {/* Formulaire de recherche */}
            <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 mb-8">
                <h2 className="text-white font-bold text-xl font-poppins mb-6 flex items-center gap-2">
                    <FaSearch className="text-secondary" />
                    Recherche de données
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Date */}
                    <div>
                        <label className="flex items-center gap-2 text-white/80 font-semibold mb-2">
                            <BsCalendarDate className="text-secondary text-xl" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                    </div>

                    {/* Région */}
                    <div>
                        <label className="flex items-center gap-2 text-white/80 font-semibold mb-2">
                            <BsBuilding className="text-secondary text-xl" />
                            Région
                        </label>
                        <select
                            value={region}
                            onChange={handleRegionChange}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer"
                        >
                            <option value="" className="bg-tertiary text-white">Sélectionnez une région</option>
                            <option value="Maritime" className="bg-tertiary text-white">Maritime</option>
                            <option value="Plateaux" className="bg-tertiary text-white">Plateaux</option>
                            <option value="Centrale" className="bg-tertiary text-white">Centrale</option>
                            <option value="Kara" className="bg-tertiary text-white">Kara</option>
                            <option value="Savanes" className="bg-tertiary text-white">Savanes</option>
                        </select>
                    </div>

                    {/* Ville */}
                    <div>
                        <label className="flex items-center gap-2 text-white/80 font-semibold mb-2">
                            <GiModernCity className="text-secondary text-xl" />
                            Ville
                        </label>
                        <select
                            value={ville}
                            onChange={(e) => setVille(e.target.value)}
                            disabled={!region}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="" className="bg-tertiary text-white">
                                {region ? 'Sélectionnez une ville' : 'Sélectionnez d\'abord une région'}
                            </option>
                            {getAvailableCities().map((city) => (
                                <option key={city} value={city} className="bg-tertiary text-white">
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filtres par période */}
                <div className="mb-6">
                    <h3 className="text-white/80 font-semibold mb-3">Filtres de période</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Jours Fériés */}
                        <label className="flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all">
                            <input
                                type="checkbox"
                                checked={joursFeries}
                                onChange={() => handleDayCheckbox('feries')}
                                disabled={parMois || parAn}
                                className="w-5 h-5 accent-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={parMois || parAn ? 'opacity-50' : ''}>Jours Fériés</span>
                        </label>

                        {/* Jours de la semaine */}
                        <label className="flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all">
                            <input
                                type="checkbox"
                                checked={joursSemaine}
                                onChange={() => handleDayCheckbox('semaine')}
                                disabled={parMois || parAn}
                                className="w-5 h-5 accent-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={parMois || parAn ? 'opacity-50' : ''}>Jours de la semaine</span>
                        </label>

                        {/* Par mois */}
                        <label className="flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all">
                            <input
                                type="checkbox"
                                checked={parMois}
                                onChange={() => handlePeriodCheckbox('mois')}
                                disabled={joursFeries || joursSemaine || parAn}
                                className="w-5 h-5 accent-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={joursFeries || joursSemaine || parAn ? 'opacity-50' : ''}>Par mois</span>
                        </label>

                        {/* Par An */}
                        <label className="flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all">
                            <input
                                type="checkbox"
                                checked={parAn}
                                onChange={() => handlePeriodCheckbox('an')}
                                disabled={joursFeries || joursSemaine || parMois}
                                className="w-5 h-5 accent-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={joursFeries || joursSemaine || parMois ? 'opacity-50' : ''}>Par An</span>
                        </label>
                    </div>
                </div>

                {/* Bouton Rechercher */}
                <button
                    onClick={handleSearch}
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                    <FaSearch className="text-xl" />
                    Rechercher
                </button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300">
                    <h2 className="text-white/80 font-semibold mb-2 text-sm">Moyenne</h2>
                    <p className="text-white font-bold text-3xl font-poppins">425.3 <span className="text-lg text-secondary">MW</span></p>
                </div>
                <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300">
                    <h2 className="text-white/80 font-semibold mb-2 text-sm">Écart-type</h2>
                    <p className="text-white font-bold text-3xl font-poppins">78.5 <span className="text-lg text-secondary">MW</span></p>
                </div>
                <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300">
                    <h2 className="text-white/80 font-semibold mb-2 text-sm">Pic Maximum</h2>
                    <p className="text-white font-bold text-3xl font-poppins">652.1 <span className="text-lg text-secondary">MW</span></p>
                </div>
            </div>

            {/* Graphique */}
            {showGraph && graphData && (
                <ChartCard
                    title={graphData.title}
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

                    {/* Graphique Plotly */}
                    <Plot
                        data={[
                            {
                                x: graphData.x,
                                y: graphData.y,
                                type: 'scatter',
                                mode: 'lines+markers',
                                name: 'Consommation',
                                line: { color: '#E9FA00', width: 4 },
                                marker: { color: '#E9FA00', size: 8 },
                            }
                        ]}
                        layout={{
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: 'white', family: 'Poppins' },
                            xaxis: {
                                gridcolor: 'rgba(255,255,255,0.1)',
                                zerolinecolor: 'rgba(255,255,255,0.2)',
                                title: parAn ? 'Mois' : (parMois ? 'Jour' : 'Heure')
                            },
                            yaxis: {
                                gridcolor: 'rgba(255,255,255,0.1)',
                                zerolinecolor: 'rgba(255,255,255,0.2)',
                                title: 'Consommation (MW)'
                            },
                            margin: { t: 30, r: 40, b: 80, l: 80 },
                            showlegend: true
                        }}
                        style={{ width: '100%', height: '450px' }}
                        config={{ displayModeBar: true }}
                    />
                </ChartCard>
            )}

            {/* Tableau des résultats détaillés */}
            <div className="mt-8">
                <ChartCard
                    title="Résultats détaillés"
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
                                    <th className="text-left py-3 px-4 font-semibold text-secondary">Confiance</th>
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

