import { useState, useEffect } from "react";
import { FaDownload, FaFileCsv, FaFileExcel, FaFileExport, FaFileImage, FaHistory, FaSearch, FaSpinner } from "react-icons/fa";
import { MdShowChart } from "react-icons/md";
import { BsCalendarDate } from "react-icons/bs";
import Plot from 'react-plotly.js';
import { useSeries } from '../hooks/useSeries';
import {
    transformSeriesData,
    calculateStatistics,
    getPlotlyLayout
} from '../utils/dataTransformers';

export default function AnalyseHistorique() {
    // Hook pour récupérer les données API
    const { series, loading, error, fetchSeries } = useSeries();

    // États pour les nouveaux filtres
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [resample, setResample] = useState('D'); // Par défaut : journalier
    const [typeConsommation, setTypeConsommation] = useState('CONSOMMATION_TOTALE');

    // États pour les données transformées
    const [transformedData, setTransformedData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [showGraph, setShowGraph] = useState(false);

    // Fonction pour charger les données depuis l'API
    const handleSearch = async () => {
        console.log('🔍 ===== DEBUT handleSearch =====');
        console.log('🔍 Paramètres de recherche:');
        console.log('  - startDate:', startDate);
        console.log('  - endDate:', endDate);
        console.log('  - resample:', resample);
        console.log('  - typeConsommation:', typeConsommation);

        if (!startDate || !endDate) {
            console.error('❌ Dates manquantes');
            alert('Veuillez sélectionner une date de début et une date de fin');
            return;
        }

        // Vérifier que la date de fin est après la date de début
        if (new Date(endDate) < new Date(startDate)) {
            console.error('❌ Date de fin avant date de début');
            alert('La date de fin doit être postérieure à la date de début');
            return;
        }

        console.log('✅ Validation des dates OK');
        console.log('🔄 Reset de showGraph à false...');
        setShowGraph(false);

        try {
            console.log('📡 Appel fetchSeries avec paramètres:', {
                startDate,
                endDate,
                resample,
                typeConsommation
            });

            // Appel API avec les nouveaux paramètres
            const result = await fetchSeries(startDate, endDate, resample, typeConsommation);

            console.log('✅ fetchSeries terminé');
            console.log('📦 Résultat fetchSeries:', result);
            console.log('📦 Type de résultat:', typeof result);

            if (result) {
                console.log('✅ Données reçues de l\'API');
                console.log('📊 result.timestamps:', result.timestamps?.length, 'éléments');
                console.log('📊 result.values:', result.values?.length, 'éléments');
            } else {
                console.warn('⚠️ Pas de résultat de fetchSeries');
            }

            console.log('✅ Appel API réussi');
            // Note: showGraph sera activé dans le useEffect après transformation
        } catch (err) {
            console.error('❌ ===== ERREUR dans handleSearch =====');
            console.error('❌ Type d\'erreur:', err.name);
            console.error('❌ Message:', err.message);
            console.error('❌ Stack:', err.stack);
            console.error('❌ Erreur complète:', err);

            if (err.response) {
                console.error('❌ Réponse HTTP:', err.response.status);
                console.error('❌ Données réponse:', err.response.data);
            }

            alert('Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue'));
        }

        console.log('🔍 ===== FIN handleSearch =====');
    };

    // Transformer et préparer les données quand elles arrivent de l'API
    useEffect(() => {
        console.log('🔍 ===== DEBUT useEffect =====');
        console.log('🔍 series existe?', !!series);
        console.log('🔍 series =', series);

        if (!series) {
            console.log('❌ AnalyseHistorique: Pas de données series');
            setTransformedData(null);
            setRawData([]);
            setStatistics(null);
            setShowGraph(false);
            console.log('🔍 ===== FIN useEffect (pas de données) =====');
            return;
        }

        console.log('✅ AnalyseHistorique: Données reçues');
        console.log('📊 Type de series:', typeof series);
        console.log('📊 Clés de series:', Object.keys(series));
        console.log('📊 series.timestamps existe?', !!series.timestamps);
        console.log('📊 series.values existe?', !!series.values);
        console.log('📊 Nombre de timestamps:', series.timestamps?.length);
        console.log('📊 Nombre de values:', series.values?.length);
        console.log('📊 resample actuel:', resample);

        // Transformer en tableau simple
        console.log('🔄 Début transformation avec transformSeriesData...');
        const tableauDonnees = transformSeriesData(series, resample);
        console.log('📋 Résultat transformSeriesData:', tableauDonnees);
        console.log('📋 Type du résultat:', typeof tableauDonnees);
        console.log('📋 Est un tableau?', Array.isArray(tableauDonnees));
        console.log('📋 Longueur du tableau:', tableauDonnees?.length);

        if (tableauDonnees && tableauDonnees.length > 0) {
            console.log('✅ Tableau valide avec', tableauDonnees.length, 'lignes');
            console.log('📋 Premier élément du tableau:', tableauDonnees[0]);
            console.log('📋 Structure attendue: {periode, timestamp, date, consommation}');
            setRawData(tableauDonnees);
            console.log('✅ setRawData appelé avec succès');
        } else {
            console.error('❌ Le tableau de données est vide ou invalide');
            console.error('❌ tableauDonnees =', tableauDonnees);
            setRawData([]);
        }

        // Calculer les statistiques
        console.log('📊 Calcul des statistiques...');

        // Adapter le format: le backend renvoie {time_index, y} au lieu de {timestamps, values}
        const valuesArray = series.values || series.y;

        if (valuesArray && Array.isArray(valuesArray) && valuesArray.length > 0) {
            console.log('✅ Valeurs trouvées:', valuesArray.length, 'éléments');
            console.log('📊 Premières valeurs:', valuesArray.slice(0, 5));
            const stats = calculateStatistics(valuesArray);
            console.log('✅ Statistiques calculées:', stats);
            setStatistics(stats);
        } else {
            console.warn('⚠️ Pas de valeurs pour les statistiques');
            console.warn('⚠️ series.values =', series.values);
            console.warn('⚠️ series.y =', series.y);
            setStatistics(null);
        }

        // Créer l'objet Plotly à partir du tableau
        console.log('📈 Création de l\'objet Plotly...');
        if (tableauDonnees && tableauDonnees.length > 0) {
            console.log('✅ Tableau valide pour Plotly, création en cours...');

            const xData = tableauDonnees.map(row => row.periode);
            const yData = tableauDonnees.map(row => row.consommation);

            console.log('📈 Données X (5 premiers):', xData.slice(0, 5));
            console.log('📈 Données Y (5 premiers):', yData.slice(0, 5));

            const plotlyData = [{
                x: xData,
                y: yData,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Consommation',
                line: { color: '#E9FA00', width: 3 },
                marker: {
                    color: '#E9FA00',
                    size: 8,
                    line: { color: '#1e3a8a', width: 2 }
                },
                fill: 'tonexty',
                fillcolor: 'rgba(233, 250, 0, 0.1)',
                hovertemplate: '<b>%{x}</b><br>Consommation: %{y:.1f} MW<extra></extra>'
            }];

            console.log('✅ Objet Plotly créé:', plotlyData);
            setTransformedData(plotlyData);
            console.log('✅ setTransformedData appelé');

            setShowGraph(true);
            console.log('✅ showGraph activé - Tout est prêt pour l\'affichage');
        } else {
            console.error('❌ Impossible de créer le graphique Plotly');
            console.error('❌ tableauDonnees est vide ou invalide');
            setTransformedData(null);
            setShowGraph(false);
        }

        console.log('🔍 ===== FIN useEffect =====');
        console.log('🔍 État final: showGraph =', showGraph, 'rawData.length =', tableauDonnees?.length);
    }, [series, resample]);

    // Debug: Logger les changements d'état
    useEffect(() => {
        console.log('🎯 États actuels:', {
            showGraph,
            hasStatistics: !!statistics,
            hasTransformedData: !!transformedData,
            hasRawData: rawData.length,
            loading
        });
    }, [showGraph, statistics, transformedData, rawData, loading]);

    // Génération des visualisations selon le filtre actif
    const getVisualization = () => {
        // Utiliser les données API transformées
        if (transformedData) {
            // Déterminer le titre selon l'intervalle
            let title = 'Consommation';
            switch(resample) {
                case 'H': title = 'Consommation Horaire'; break;
                case '30min': title = 'Consommation par 30 Minutes'; break;
                case 'D': title = 'Consommation Journalière'; break;
                case 'W': title = 'Consommation Hebdomadaire'; break;
                default: title = 'Consommation';
            }

            return {
                type: 'line',
                title: title,
                data: transformedData
            };
        }

        return null;
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

                {/* Période : Date début et fin */}
                <div className="mb-6">
                    <h3 className="text-white/80 font-semibold mb-3">Période</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date de début */}
                        <div>
                            <label className="flex items-center gap-2 text-white/80 font-semibold mb-2">
                                <BsCalendarDate className="text-secondary text-xl" />
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                            />
                        </div>

                        {/* Date de fin */}
                        <div>
                            <label className="flex items-center gap-2 text-white/80 font-semibold mb-2">
                                <BsCalendarDate className="text-secondary text-xl" />
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Intervalle de période */}
                <div className="mb-6">
                    <h3 className="text-white/80 font-semibold mb-3">Intervalle de période</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Par 30 minutes */}
                        <label className={`flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all ${resample === '30min' ? 'bg-secondary/20 border-2 border-secondary' : ''}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="30min"
                                checked={resample === '30min'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-secondary cursor-pointer"
                            />
                            <span className="font-medium">Par 30 min</span>
                        </label>

                        {/* Par heure */}
                        <label className={`flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all ${resample === 'H' ? 'bg-secondary/20 border-2 border-secondary' : ''}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="H"
                                checked={resample === 'H'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-secondary cursor-pointer"
                            />
                            <span className="font-medium">Par heure</span>
                        </label>

                        {/* Par jour */}
                        <label className={`flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all ${resample === 'D' ? 'bg-secondary/20 border-2 border-secondary' : ''}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="D"
                                checked={resample === 'D'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-secondary cursor-pointer"
                            />
                            <span className="font-medium">Par jour</span>
                        </label>

                        {/* Par semaine */}
                        <label className={`flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all ${resample === 'W' ? 'bg-secondary/20 border-2 border-secondary' : ''}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="W"
                                checked={resample === 'W'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-secondary cursor-pointer"
                            />
                            <span className="font-medium">Par semaine</span>
                        </label>
                    </div>
                </div>

                {/* Type de consommation */}
                <div className="mb-6">
                    <h3 className="text-white/80 font-semibold mb-3">Type de consommation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 text-white cursor-pointer bg-black/10 p-3 rounded-lg hover:bg-black/20 transition-all">
                            <input
                                type="checkbox"
                                checked={typeConsommation === 'CONSOMMATION_TOTALE'}
                                onChange={(e) => setTypeConsommation(e.target.checked ? 'CONSOMMATION_TOTALE' : '')}
                                className="w-5 h-5 accent-secondary cursor-pointer"
                            />
                            <span className="font-medium">Consommation Totale</span>
                        </label>

                        {/* Placeholder pour futurs types */}
                        <div className="flex items-center gap-3 text-white/30 cursor-not-allowed bg-black/5 p-3 rounded-lg opacity-50">
                            <input
                                type="checkbox"
                                disabled
                                className="w-5 h-5 cursor-not-allowed opacity-50"
                            />
                            <span className="font-medium">Autres types (à venir)</span>
                        </div>
                    </div>
                </div>

                {/* Bouton Rechercher */}
                <button
                    onClick={handleSearch}
                    disabled={!startDate || !endDate || loading}
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaSearch className="text-xl" />
                    {loading ? 'Chargement...' : 'Rechercher'}
                </button>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl mb-8">
                    <p className="font-semibold">⚠️ Erreur: {error}</p>
                </div>
            )}

            {/* Indicateur de chargement */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-secondary text-6xl mx-auto mb-4" />
                        <p className="text-tertiary text-xl font-semibold">Chargement des données...</p>
                    </div>
                </div>
            )}

            {/* Statistiques dynamiques */}
            {showGraph && statistics && !loading && (
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

                        {/* Message pour fonctionnalités désactivées */}
                        {visualization.type === 'message' ? (
                            <div className="bg-black/20 rounded-xl p-8 text-center border border-white/10">
                                <FaHistory className="text-secondary text-6xl mx-auto mb-4" />
                                <h3 className="text-white text-xl font-bold mb-2">{visualization.title}</h3>
                                <p className="text-white/70 text-lg">{visualization.message}</p>
                                <p className="text-white/50 text-sm mt-4">Le backend sera mis à jour prochainement</p>
                            </div>
                        ) : (
                            /* Graphique Plotly */
                            <Plot
                                data={visualization.data}
                                layout={{
                                    ...getPlotlyLayout('',
                                        visualization.type === 'bar' ? 'Mois' : 'Jour',
                                        'Consommation (MW)'
                                    ),
                                    xaxis: {
                                        ...getPlotlyLayout('', '', '').xaxis,
                                        tickangle: visualization.type === 'bar' ? -45 : 0,
                                    },
                                    margin: {
                                        t: 40,
                                        r: 50,
                                        b: visualization.type === 'bar' ? 120 : 80,
                                        l: 80
                                    },
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
                        )}
                    </ChartCard>
                );
            })()}

            {/* Tableau des données brutes */}
            {showGraph && rawData.length > 0 && !loading && (
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
                                        <th className="text-left py-3 px-4 font-semibold text-secondary">Période</th>
                                        <th className="text-right py-3 px-4 font-semibold text-secondary">Consommation (MW)</th>
                                        <th className="text-center py-3 px-4 font-semibold text-secondary">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawData.slice(0, 20).map((row, index) => (
                                        <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 font-medium">{row.periode}</td>
                                            <td className="py-3 px-4 text-right font-bold text-secondary">{row.consommation}</td>
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
                            {rawData.length > 20 && (
                                <div className="mt-4 text-center text-white/60 text-sm">
                                    Affichage de 20 lignes sur {rawData.length} au total
                                </div>
                            )}
                        </div>
                    </ChartCard>
                </div>
            )}
        </div>
    );
}

