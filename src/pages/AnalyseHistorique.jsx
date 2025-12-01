import { useState, useMemo } from "react";
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

    // Données brutes générées (simulation)
    const generateRawData = () => {
        const data = [];
        const currentRegion = region || 'Maritime';
        const currentVille = ville || 'Lomé';
        const baseDate = selectedDate ? new Date(selectedDate) : new Date('2025-12-26');

        // Génération selon le filtre actif
        if (joursFeries || joursSemaine) {
            // Données horaires pour un jour (24 heures)
            for (let h = 0; h < 24; h++) {
                const hour = h.toString().padStart(2, '0') + ':00';
                const consommation = 250 + Math.random() * 300 + (h >= 8 && h <= 12 ? 100 : 0) + (h >= 17 && h <= 20 ? 150 : 0);
                data.push({
                    date: baseDate.toLocaleDateString('fr-FR'),
                    heure: hour,
                    region: currentRegion,
                    ville: currentVille,
                    consommation: Math.round(consommation * 10) / 10,
                    type: joursFeries ? 'Jour Férié' : 'Jour Semaine'
                });
            }
        } else if (parMois) {
            // Données journalières pour un mois (30 jours)
            for (let d = 1; d <= 30; d++) {
                const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), d);
                const consommation = 350 + Math.random() * 200;
                data.push({
                    date: date.toLocaleDateString('fr-FR'),
                    region: currentRegion,
                    ville: currentVille,
                    consommation: Math.round(consommation * 10) / 10,
                    type: 'Mensuel'
                });
            }
        } else if (parAn) {
            // Données mensuelles pour une année (12 mois)
            const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            for (let m = 0; m < 12; m++) {
                const consommation = 380 + Math.random() * 150 + (m >= 5 && m <= 8 ? 50 : 0);
                data.push({
                    date: `${mois[m]} ${baseDate.getFullYear()}`,
                    region: currentRegion,
                    ville: currentVille,
                    consommation: Math.round(consommation * 10) / 10,
                    type: 'Annuel'
                });
            }
        }

        return data;
    };

    const [rawData, setRawData] = useState([]);

    // Calcul des statistiques basées sur les données brutes
    const statistics = useMemo(() => {
        if (rawData.length === 0) {
            return { moyenne: 0, ecartType: 0, picMax: 0 };
        }

        const consommations = rawData.map(d => d.consommation);
        const moyenne = consommations.reduce((a, b) => a + b, 0) / consommations.length;
        const variance = consommations.reduce((a, b) => a + Math.pow(b - moyenne, 2), 0) / consommations.length;
        const ecartType = Math.sqrt(variance);
        const picMax = Math.max(...consommations);

        return {
            moyenne: Math.round(moyenne * 10) / 10,
            ecartType: Math.round(ecartType * 10) / 10,
            picMax: Math.round(picMax * 10) / 10
        };
    }, [rawData]);

    // Génération des visualisations selon le filtre actif
    const getVisualization = () => {
        if (rawData.length === 0) return null;

        // Boxplot pour jours fériés
        if (joursFeries) {
            // Générer des données pour plusieurs jours fériés
            const joursFeriesData = [
                { jour: 'Nouvel An', data: [] },
                { jour: 'Fête Nationale', data: [] },
                { jour: 'Noël', data: [] },
                { jour: 'Pâques', data: [] },
                { jour: 'Tabaski', data: [] }
            ];

            // Générer des valeurs de consommation pour chaque jour férié avec des patterns différents
            joursFeriesData.forEach((jourFerie, index) => {
                const baseConsommation = 280 + index * 20; // Base différente pour chaque jour
                for (let i = 0; i < 30; i++) { // 30 échantillons par jour
                    const variation = Math.random() * 100 - 50; // Variation de ±50
                    const valeur = Math.max(200, baseConsommation + variation);
                    jourFerie.data.push(Math.round(valeur * 10) / 10);
                }
            });

            return {
                type: 'boxplot',
                title: 'Distribution de la consommation - Jours Fériés',
                data: joursFeriesData.map((jf, index) => ({
                    y: jf.data,
                    type: 'box',
                    name: jf.jour,
                    boxmean: 'sd',
                    marker: {
                        color: ['#E9FA00', '#60A5FA', '#FF6B6B', '#4ECDC4', '#45B7D1'][index],
                        opacity: 0.7
                    },
                    line: {
                        color: ['#E9FA00', '#60A5FA', '#FF6B6B', '#4ECDC4', '#45B7D1'][index],
                        width: 2
                    },
                    fillcolor: ['rgba(233, 250, 0, 0.3)', 'rgba(96, 165, 250, 0.3)', 'rgba(255, 107, 107, 0.3)', 'rgba(78, 205, 196, 0.3)', 'rgba(69, 183, 209, 0.3)'][index]
                }))
            };
        }

        // Heatmap pour jours de semaine
        if (joursSemaine) {
            const joursDisplay = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
            const heures = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}h`);
            const matrix = [];

            for (let j = 0; j < 7; j++) {
                const row = [];
                for (let h = 0; h < 24; h++) {
                    let base = 250; // Consommation de base

                    // Pattern différent selon le jour
                    const isWeekend = j >= 5; // Samedi et Dimanche

                    if (!isWeekend) {
                        // Jours de semaine - pics le matin et le soir
                        if (h >= 6 && h <= 9) base += 80; // Pic matinal
                        if (h >= 11 && h <= 14) base += 50; // Légère augmentation midi
                        if (h >= 17 && h <= 21) base += 120; // Pic du soir
                        if (h >= 22 || h <= 5) base -= 80; // Nuit plus faible
                    } else {
                        // Weekend - pattern plus étalé
                        if (h >= 8 && h <= 11) base += 40; // Réveil plus tardif
                        if (h >= 12 && h <= 16) base += 60; // Activité après-midi
                        if (h >= 18 && h <= 22) base += 70; // Soirée
                        if (h >= 23 || h <= 6) base -= 60; // Nuit
                    }

                    // Variation selon le jour spécifique
                    if (j === 1 || j === 3) base += 20; // Mardi et Jeudi plus chargés
                    if (j === 6) base -= 15; // Dimanche plus calme

                    // Ajout de variation aléatoire
                    const valeur = Math.max(150, base + Math.random() * 40 - 20);
                    row.push(Math.round(valeur * 10) / 10);
                }
                matrix.push(row);
            }

            return {
                type: 'heatmap',
                title: 'Carte de chaleur - Consommation hebdomadaire',
                data: [{
                    z: matrix,
                    x: heures,
                    y: joursDisplay,
                    type: 'heatmap',
                    colorscale: [
                        [0, '#1e3a8a'],      // Bleu foncé pour les valeurs basses
                        [0.2, '#3B82F6'],    // Bleu
                        [0.4, '#60A5FA'],    // Bleu moyen
                        [0.6, '#E9FA00'],    // Jaune (couleur secondaire)
                        [0.8, '#FFA500'],    // Orange
                        [1, '#FF0000']       // Rouge pour les valeurs hautes
                    ],
                    showscale: true,
                    colorbar: {
                        title: {
                            text: 'Consommation<br>(MW)',
                            font: { color: 'white', size: 14 }
                        },
                        titleside: 'right',
                        tickfont: { color: 'white', size: 12 },
                        thickness: 25,
                        len: 0.8,
                        x: 1.02
                    },
                    hovertemplate: '<b>%{y}</b><br>Heure: %{x}<br>Consommation: %{z:.1f} MW<extra></extra>'
                }]
            };
        }

        // Graphique linéaire pour mensuel
        if (parMois) {
            const consommations = rawData.map(d => d.consommation);
            const jours = rawData.map((d, i) => i + 1);

            return {
                type: 'line',
                title: 'Évolution de la consommation mensuelle',
                data: [
                    {
                        x: jours,
                        y: consommations,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Consommation journalière',
                        line: { color: '#E9FA00', width: 3 },
                        marker: { 
                            color: '#E9FA00', 
                            size: 8,
                            line: { color: '#1e3a8a', width: 2 }
                        },
                        fill: 'tonexty',
                        fillcolor: 'rgba(233, 250, 0, 0.1)',
                        hovertemplate: '<b>Jour %{x}</b><br>Consommation: %{y:.1f} MW<extra></extra>'
                    }
                ]
            };
        }

        // Diagramme en barres pour annuel
        if (parAn) {
            const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            const consommations = rawData.map(d => d.consommation);

            // Couleurs dégradées pour les barres
            const colors = consommations.map(val => {
                const maxVal = Math.max(...consommations);
                const minVal = Math.min(...consommations);
                const ratio = (val - minVal) / (maxVal - minVal);

                if (ratio < 0.3) return '#60A5FA';
                else if (ratio < 0.6) return '#E9FA00';
                else return '#FF6B6B';
            });

            return {
                type: 'bar',
                title: 'Consommation annuelle par mois',
                data: [
                    {
                        x: mois,
                        y: consommations,
                        type: 'bar',
                        name: 'Consommation',
                        marker: {
                            color: colors,
                            line: {
                                color: '#1e3a8a',
                                width: 2
                            }
                        },
                        hovertemplate: '<b>%{x}</b><br>Consommation: %{y:.1f} MW<extra></extra>'
                    }
                ]
            };
        }

        return null;
    };

    const handleSearch = () => {
        const data = generateRawData();
        setRawData(data);
        setShowGraph(true);
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

            {/* Statistiques dynamiques */}
            {showGraph && rawData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300">
                        <h2 className="text-white/80 font-semibold mb-2 text-sm">Moyenne</h2>
                        <p className="text-white font-bold text-3xl font-poppins">{statistics.moyenne} <span className="text-lg text-secondary">MW</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300">
                        <h2 className="text-white/80 font-semibold mb-2 text-sm">Écart-type</h2>
                        <p className="text-white font-bold text-3xl font-poppins">{statistics.ecartType} <span className="text-lg text-secondary">MW</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-tertiary to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-400/30 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300">
                        <h2 className="text-white/80 font-semibold mb-2 text-sm">Pic Maximum</h2>
                        <p className="text-white font-bold text-3xl font-poppins">{statistics.picMax} <span className="text-lg text-secondary">MW</span></p>
                    </div>
                </div>
            )}

            {/* Visualisations dynamiques */}
            {showGraph && (() => {
                const visualization = getVisualization();
                if (!visualization) return null;

                return (
                    <ChartCard
                        title={visualization.title}
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
                            data={visualization.data}
                            layout={{
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: 'white', family: 'Poppins' },
                                xaxis: {
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    title: visualization.type === 'heatmap' ? 'Heures de la journée' :
                                           visualization.type === 'boxplot' ? '' :
                                           visualization.type === 'bar' ? 'Mois' :
                                           visualization.type === 'line' ? 'Jour du mois' : '',
                                    tickangle: visualization.type === 'bar' ? -45 : 0,
                                    showgrid: visualization.type !== 'heatmap'
                                },
                                yaxis: {
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    title: visualization.type === 'heatmap' ? 'Jour de la semaine' : 'Consommation (MW)',
                                    showgrid: visualization.type !== 'heatmap'
                                },
                                margin: { 
                                    t: 40, 
                                    r: visualization.type === 'heatmap' ? 100 : 50, 
                                    b: visualization.type === 'bar' ? 120 : 80, 
                                    l: 80 
                                },
                                showlegend: visualization.type === 'boxplot',
                                legend: {
                                    orientation: 'h',
                                    y: -0.2,
                                    x: 0.5,
                                    xanchor: 'center',
                                    font: { size: 12 }
                                },
                                bargap: visualization.type === 'bar' ? 0.4 : undefined,
                                height: 500
                            }}
                            style={{ width: '100%', height: '500px' }}
                            config={{ 
                                displayModeBar: true, 
                                responsive: true,
                                toImageButtonOptions: {
                                    format: 'png',
                                    filename: 'analyse_historique',
                                    height: 500,
                                    width: 800,
                                    scale: 1
                                }
                            }}
                        />
                    </ChartCard>
                );
            })()}

            {/* Tableau des données brutes */}
            {showGraph && rawData.length > 0 && (
                <div className="mt-8">
                    <ChartCard
                        title="Données brutes"
                        icon={<FaHistory />}
                    >
                        {/* Tableau */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-white">
                                <thead>
                                    <tr className="border-b border-white/20">
                                        <th className="text-left py-3 px-4 font-semibold text-secondary">Date</th>
                                        {(joursFeries || joursSemaine) && (
                                            <th className="text-left py-3 px-4 font-semibold text-secondary">Heure</th>
                                        )}
                                        <th className="text-left py-3 px-4 font-semibold text-secondary">Région</th>
                                        <th className="text-left py-3 px-4 font-semibold text-secondary">Ville</th>
                                        <th className="text-right py-3 px-4 font-semibold text-secondary">Consommation (MW)</th>
                                        <th className="text-center py-3 px-4 font-semibold text-secondary">Type</th>
                                        <th className="text-center py-3 px-4 font-semibold text-secondary">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawData.slice(0, 10).map((row, index) => (
                                        <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 font-medium">{row.date}</td>
                                            {(joursFeries || joursSemaine) && (
                                                <td className="py-3 px-4">{row.heure}</td>
                                            )}
                                            <td className="py-3 px-4">{row.region}</td>
                                            <td className="py-3 px-4">{row.ville}</td>
                                            <td className="py-3 px-4 text-right font-bold">{row.consommation}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                    {row.type}
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
                            {rawData.length > 10 && (
                                <div className="mt-4 text-center text-white/60 text-sm">
                                    Affichage de 10 lignes sur {rawData.length} au total
                                </div>
                            )}
                        </div>
                    </ChartCard>
                </div>
            )}
        </div>
    );
}

