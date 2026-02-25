import { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaFileCsv, FaFileExcel, FaFileExport, FaFileImage, FaHistory, FaSearch, FaSpinner } from "react-icons/fa";
import { MdShowChart } from "react-icons/md";
import { BsCalendarDate } from "react-icons/bs";
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist-min';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useSeries } from '../hooks/useSeries';
import { AnalyticsService } from '../services/AnalyticsService';
import {
    transformSeriesData,
    calculateStatistics,
    getPlotlyLayout
} from '../utils/dataTransformers';

export default function AnalyseHistorique() {
    // Référence pour le graphique Plotly (export PNG)
    const plotlyRef = useRef(null);

    // Hook pour récupérer les données API
    const { series, loading, error, fetchSeries } = useSeries();

    // États pour les filtres - Dates par défaut: dernière semaine de Décembre 2017
    const [startDate, setStartDate] = useState('2017-12-25'); // Format interne YYYY-MM-DD
    const [endDate, setEndDate] = useState('2017-12-31');
    const [resample, setResample] = useState('D'); // Par défaut : journalier
    const [typeConsommation, setTypeConsommation] = useState('CONSOMMATION_TOTALE');

    // États pour les données transformées
    const [transformedData, setTransformedData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [showGraph, setShowGraph] = useState(false);

    // États pour les peaks et troughs
    const [peaksData, setPeaksData] = useState(null);
    const [troughsData, setTroughsData] = useState(null);
    const [peaksTroughsLoading, setPeaksTroughsLoading] = useState(false);

    // États pour la pagination du tableau
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20; // Nombre de lignes par page

    // Fonction pour convertir une date du format interne (YYYY-MM-DD) vers l'affichage (DD-MM-YYYY)
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return format(date, 'dd-MM-yyyy');
        } catch {
            return dateString;
        }
    };

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
        setPeaksData(null);
        setTroughsData(null);

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

            // Récupérer les peaks et troughs en parallèle
            console.log('📡 Appel API peaks_troughs...');
            setPeaksTroughsLoading(true);
            try {
                const peaksTroughsResponse = await AnalyticsService.getAnalyticsPeaksTroughs(
                    startDate,
                    endDate,
                    resample,
                    typeConsommation,
                    null, // min_prominence
                    1     // min_distance
                );

                console.log('✅ Peaks/Troughs reçus:', peaksTroughsResponse.data);

                if (peaksTroughsResponse.data) {
                    // Stocker les peaks
                    if (peaksTroughsResponse.data.peaks) {
                        console.log('📈 Peaks détectés:', peaksTroughsResponse.data.peaks.length);
                        setPeaksData(peaksTroughsResponse.data.peaks);
                    }
                    // Stocker les troughs
                    if (peaksTroughsResponse.data.troughs) {
                        console.log('📉 Troughs détectés:', peaksTroughsResponse.data.troughs.length);
                        setTroughsData(peaksTroughsResponse.data.troughs);
                    }
                }
            } catch (peaksError) {
                console.warn('⚠️ Impossible de récupérer les peaks/troughs:', peaksError.message);
                // On continue même si les peaks/troughs échouent
            } finally {
                setPeaksTroughsLoading(false);
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

        // Réinitialiser la pagination à la première page
        setCurrentPage(1);

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
                line: { color: '#E3001B', width: 3 },
                marker: {
                    color: '#E3001B',
                    size: 8,
                    line: { color: '#FDB913', width: 2 }
                },
                fill: 'tonexty',
                fillcolor: 'rgba(227, 0, 27, 0.1)',
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
            loading,
            hasPeaks: peaksData?.length || 0,
            hasTroughs: troughsData?.length || 0
        });
    }, [showGraph, statistics, transformedData, rawData, loading, peaksData, troughsData]);

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

            // Copier les données de base (courbe de consommation)
            const plotData = [...transformedData];

            // Fonction pour formater les dates des peaks/troughs AU MÊME FORMAT que la courbe de consommation
            // Le format doit correspondre EXACTEMENT à celui utilisé dans transformSeriesData
            const formatPeakDate = (peak) => {
                // L'API renvoie probablement 'time' ou 'timestamp' ou 'date'
                const rawDate = peak.time || peak.timestamp || peak.date || peak.index;
                if (!rawDate) return null;

                try {
                    const date = new Date(rawDate);

                    // IMPORTANT: Utiliser exactement le même format que transformSeriesData
                    switch (resample) {
                        case '30min':
                            // Format: "JJ/MM/AAAA HH:MM"
                            return date.toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        case 'H':
                            // Format: "JJ/MM/AAAA HH:00"
                            return date.toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit'
                            }) + ':00';
                        case 'D':
                            // Format: "JJ/MM/AAAA"
                            return date.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                        case 'W':
                        case 'W-MON':
                            // Format: "Semaine du JJ/MM/AAAA"
                            return 'Semaine du ' + date.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                        default:
                            return date.toLocaleDateString('fr-FR');
                    }
                } catch (e) {
                    console.warn('Erreur formatage date peak:', e, rawDate);
                    return null;
                }
            };

            // Ajouter les peaks (pics) - marqueurs rouges triangles vers le haut
            if (peaksData && peaksData.length > 0) {
                console.log('📈 Peaks bruts:', peaksData);
                console.log('📈 Premier peak:', peaksData[0]);

                const peaksX = peaksData.map(p => formatPeakDate(p)).filter(x => x !== null);
                const peaksY = peaksData.map(p => p.value || p.y || p.CONSOMMATION_TOTALE);

                console.log('📈 Peaks formatés - X:', peaksX);
                console.log('📈 Peaks formatés - Y:', peaksY);
                console.log('📈 Comparaison avec X de la courbe:', transformedData[0]?.x?.slice(0, 3));

                if (peaksX.length > 0 && peaksY.length > 0) {
                    const peaksTrace = {
                        x: peaksX,
                        y: peaksY,
                        type: 'scatter',
                        mode: 'markers',
                        name: 'Pics (Max)',
                        marker: {
                            color: '#E3001B',
                            size: 16,
                            symbol: 'triangle-up',
                            line: { color: '#ffffff', width: 2 }
                        },
                        hovertemplate: '<b>🔺 Pic Maximum</b><br>Date: %{x}<br>Valeur: %{y:.2f} MW<extra></extra>'
                    };
                    plotData.push(peaksTrace);
                }
            }

            // Ajouter les troughs (creux) - marqueurs jaunes triangles vers le bas
            if (troughsData && troughsData.length > 0) {
                console.log('📉 Troughs bruts:', troughsData);
                console.log('📉 Premier trough:', troughsData[0]);

                const troughsX = troughsData.map(t => formatPeakDate(t)).filter(x => x !== null);
                const troughsY = troughsData.map(t => t.value || t.y || t.CONSOMMATION_TOTALE);

                console.log('📉 Troughs formatés - X:', troughsX);
                console.log('📉 Troughs formatés - Y:', troughsY);

                if (troughsX.length > 0 && troughsY.length > 0) {
                    const troughsTrace = {
                        x: troughsX,
                        y: troughsY,
                        type: 'scatter',
                        mode: 'markers',
                        name: 'Creux (Min)',
                        marker: {
                            color: '#FDB913',
                            size: 16,
                            symbol: 'triangle-down',
                            line: { color: '#ffffff', width: 2 }
                        },
                        hovertemplate: '<b>🔻 Creux Minimum</b><br>Date: %{x}<br>Valeur: %{y:.2f} MW<extra></extra>'
                    };
                    plotData.push(troughsTrace);
                }
            }

            // Ajouter indication dans le titre si peaks/troughs présents
            const hasPeaks = peaksData && peaksData.length > 0;
            const hasTroughs = troughsData && troughsData.length > 0;
            if (hasPeaks || hasTroughs) {
                title += ' avec Pics et Creux';
            }

            return {
                type: 'line',
                title: title,
                data: plotData
            };
        }

        return null;
    };

    // ========== FONCTIONS D'EXPORT ==========

    /**
     * Export du graphique en PNG via Plotly
     */
    const handleExportPNG = () => {
        if (!plotlyRef.current || !plotlyRef.current.el) {
            alert('Aucun graphique à exporter');
            return;
        }

        Plotly.downloadImage(plotlyRef.current.el, {
            format: 'png',
            filename: `analyse_historique_${startDate}_${endDate}`,
            width: 1200,
            height: 600,
            scale: 2
        });
    };

    /**
     * Export des données en CSV
     */
    const handleExportCSV = () => {
        if (!rawData || rawData.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }

        const headers = ['Période', 'Consommation (MW)'];
        const rows = rawData.map(row => [row.periode, row.consommation]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analyse_historique_${startDate}_${endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * Export des données en Excel via SheetJS (xlsx)
     */
    const handleExportExcel = () => {
        if (!rawData || rawData.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }

        const excelData = rawData.map(row => ({
            'Période': row.periode,
            'Consommation (MW)': parseFloat(row.consommation)
        }));

        // Ajouter les statistiques
        if (statistics) {
            excelData.push({});
            excelData.push({ 'Période': 'STATISTIQUES', 'Consommation (MW)': '' });
            excelData.push({ 'Période': 'Moyenne', 'Consommation (MW)': parseFloat(statistics.moyenne) });
            excelData.push({ 'Période': 'Écart-type', 'Consommation (MW)': parseFloat(statistics.ecartType) });
            excelData.push({ 'Période': 'Pic Maximum', 'Consommation (MW)': parseFloat(statistics.picMax) });
        }

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analyse Historique');

        worksheet['!cols'] = [
            { wch: 25 },
            { wch: 20 }
        ];

        XLSX.writeFile(workbook, `analyse_historique_${startDate}_${endDate}.xlsx`);
    };

    // ========== FIN FONCTIONS D'EXPORT ==========

    const ChartCard = ({ title, children, icon }) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
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
                <p className="text-gray-500 text-sm font-poppins mb-1">Exploration et analyse des données historiques</p>
                <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                    Analyse Historique
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>

            {/* Formulaire de recherche */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
                <h2 className="text-gray-900 font-bold text-xl font-poppins mb-6 flex items-center gap-2">
                    <FaSearch className="text-[#E3001B]" />
                    Recherche de données
                </h2>

                {/* Période : Date début et fin */}
                <div className="mb-6">
                    <h3 className="text-gray-700 font-semibold mb-3">Période</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date de début */}
                        <div>
                            <label className="flex items-center gap-2 text-gray-600 font-semibold mb-2">
                                <BsCalendarDate className="text-[#E3001B] text-xl" />
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                            />
                            <p className="text-gray-400 text-sm mt-1">
                                {startDate ? `📅 ${formatDateForDisplay(startDate)}` : 'Format: JJ-MM-AAAA'}
                            </p>
                        </div>

                        {/* Date de fin */}
                        <div>
                            <label className="flex items-center gap-2 text-gray-600 font-semibold mb-2">
                                <BsCalendarDate className="text-[#E3001B] text-xl" />
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                            />
                            <p className="text-gray-400 text-sm mt-1">
                                {endDate ? `📅 ${formatDateForDisplay(endDate)}` : 'Format: JJ-MM-AAAA'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Intervalle de période */}
                <div className="mb-6">
                    <h3 className="text-gray-700 font-semibold mb-3">Intervalle de période</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Par 30 minutes */}
                        <label className={`flex items-center gap-3 text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all border ${resample === '30min' ? 'bg-red-50 border-2 border-[#E3001B] text-[#E3001B]' : 'border-gray-200'}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="30min"
                                checked={resample === '30min'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-[#E3001B] cursor-pointer"
                            />
                            <span className="font-medium">Par 30 min</span>
                        </label>

                        {/* Par heure */}
                        <label className={`flex items-center gap-3 text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all border ${resample === 'H' ? 'bg-red-50 border-2 border-[#E3001B] text-[#E3001B]' : 'border-gray-200'}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="H"
                                checked={resample === 'H'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-[#E3001B] cursor-pointer"
                            />
                            <span className="font-medium">Par heure</span>
                        </label>

                        {/* Par jour */}
                        <label className={`flex items-center gap-3 text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all border ${resample === 'D' ? 'bg-red-50 border-2 border-[#E3001B] text-[#E3001B]' : 'border-gray-200'}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="D"
                                checked={resample === 'D'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-[#E3001B] cursor-pointer"
                            />
                            <span className="font-medium">Par jour</span>
                        </label>

                        {/* Par semaine */}
                        <label className={`flex items-center gap-3 text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all border ${resample === 'W' ? 'bg-red-50 border-2 border-[#E3001B] text-[#E3001B]' : 'border-gray-200'}`}>
                            <input
                                type="radio"
                                name="resample"
                                value="W"
                                checked={resample === 'W'}
                                onChange={(e) => setResample(e.target.value)}
                                className="w-5 h-5 accent-[#E3001B] cursor-pointer"
                            />
                            <span className="font-medium">Par semaine</span>
                        </label>
                    </div>
                </div>

                {/* Type de consommation */}
                <div className="mb-6">
                    <h3 className="text-gray-700 font-semibold mb-3">Type de consommation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all border border-gray-200">
                            <input
                                type="checkbox"
                                checked={typeConsommation === 'CONSOMMATION_TOTALE'}
                                onChange={(e) => setTypeConsommation(e.target.checked ? 'CONSOMMATION_TOTALE' : '')}
                                className="w-5 h-5 accent-[#E3001B] cursor-pointer"
                            />
                            <span className="font-medium">Consommation Totale</span>
                        </label>

                        {/* Placeholder pour futurs types */}
                        <div className="flex items-center gap-3 text-gray-400 cursor-not-allowed bg-gray-50 p-3 rounded-lg opacity-50 border border-gray-200">
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
                    className="w-full md:w-auto bg-[#E3001B] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaSearch className="text-xl" />
                    {loading ? 'Chargement...' : 'Rechercher'}
                </button>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
                    <p className="font-semibold">⚠️ Erreur: {error}</p>
                </div>
            )}

            {/* Indicateur de chargement */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-[#E3001B] text-6xl mx-auto mb-4" />
                        <p className="text-gray-600 text-xl font-semibold">Chargement des données...</p>
                    </div>
                </div>
            )}

            {/* Statistiques dynamiques */}
            {showGraph && statistics && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <h2 className="text-gray-500 font-semibold mb-2 text-sm">Moyenne</h2>
                        <p className="text-gray-900 font-bold text-3xl font-poppins">{statistics.moyenne} <span className="text-lg text-[#E3001B]">MW</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <h2 className="text-gray-500 font-semibold mb-2 text-sm">Écart-type</h2>
                        <p className="text-gray-900 font-bold text-3xl font-poppins">{statistics.ecartType} <span className="text-lg text-[#FDB913]">MW</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <h2 className="text-gray-500 font-semibold mb-2 text-sm">Pic Maximum</h2>
                        <p className="text-gray-900 font-bold text-3xl font-poppins">{statistics.picMax} <span className="text-lg text-[#E3001B]">MW</span></p>
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
                        {/* Boutons d'export + indicateurs */}
                        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <FaFileExport />
                                    Export :
                                </span>
                                <button
                                    onClick={handleExportPNG}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200"
                                >
                                    <FaFileImage />
                                    PNG
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200"
                                >
                                    <FaFileCsv />
                                    CSV
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                                >
                                    <FaFileExcel />
                                    Excel
                                </button>
                            </div>

                            {/* Indicateur de statut peaks/troughs */}
                            <div className="flex items-center gap-4 text-sm">
                                {peaksTroughsLoading && (
                                    <span className="flex items-center gap-2 text-gray-500">
                                        <FaSpinner className="animate-spin" />
                                        Chargement pics/creux...
                                    </span>
                                )}
                                {peaksData && peaksData.length > 0 && (
                                    <span className="flex items-center gap-2 text-[#E3001B]">
                                        <span className="w-3 h-3 bg-[#E3001B] rounded-full"></span>
                                        {peaksData.length} pic{peaksData.length > 1 ? 's' : ''}
                                    </span>
                                )}
                                {troughsData && troughsData.length > 0 && (
                                    <span className="flex items-center gap-2 text-[#FDB913]">
                                        <span className="w-3 h-3 bg-[#FDB913] rounded-full"></span>
                                        {troughsData.length} creux
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Message pour fonctionnalités désactivées */}
                        {visualization.type === 'message' ? (
                            <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                                <FaHistory className="text-[#E3001B] text-6xl mx-auto mb-4" />
                                <h3 className="text-gray-900 text-xl font-bold mb-2">{visualization.title}</h3>
                                <p className="text-gray-600 text-lg">{visualization.message}</p>
                                <p className="text-gray-400 text-sm mt-4">Le backend sera mis à jour prochainement</p>
                            </div>
                        ) : (
                            /* Graphique Plotly */
                            <div className="w-full h-[500px]">
                                <Plot
                                    ref={plotlyRef}
                                    data={visualization.data}
                                    layout={{
                                        ...getPlotlyLayout('',
                                            visualization.type === 'bar' ? 'Mois' : 'Période',
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
                                        autosize: true,
                                        showlegend: true,
                                        legend: {
                                            orientation: 'h',
                                            yanchor: 'bottom',
                                            y: 1.02,
                                            xanchor: 'right',
                                            x: 1,
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            bordercolor: '#E5E7EB',
                                            borderwidth: 1
                                        }
                                    }}
                                    style={{ width: '100%', height: '100%' }}
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
                                    useResizeHandler={true}
                                />
                            </div>
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
                        {/* Bouton Export Excel au-dessus du tableau */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 text-sm">
                                {rawData.length} enregistrement{rawData.length > 1 ? 's' : ''} au total
                            </span>
                            <button
                                onClick={handleExportExcel}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                            >
                                <FaFileExcel />
                                Exporter Excel
                            </button>
                        </div>

                        {/* Tableau */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-gray-700">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Période</th>
                                        <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Consommation (MW)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawData
                                        .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                        .map((row, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{row.periode}</td>
                                                <td className="py-3 px-4 text-right font-bold text-[#E3001B]">{row.consommation}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {rawData.length > rowsPerPage && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
                                {/* Info pagination */}
                                <div className="text-gray-500 text-sm">
                                    Affichage de{' '}
                                    <span className="font-semibold text-gray-700">
                                        {(currentPage - 1) * rowsPerPage + 1}
                                    </span>
                                    {' '}à{' '}
                                    <span className="font-semibold text-gray-700">
                                        {Math.min(currentPage * rowsPerPage, rawData.length)}
                                    </span>
                                    {' '}sur{' '}
                                    <span className="font-semibold text-gray-700">
                                        {rawData.length}
                                    </span>
                                    {' '}lignes
                                </div>

                                {/* Boutons de navigation */}
                                <div className="flex items-center gap-2">
                                    {/* Bouton Première page */}
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Première page"
                                    >
                                        <span className="text-sm font-medium">1</span>
                                    </button>

                                    {/* Bouton Précédent */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <FaChevronLeft className="text-sm" />
                                        <span className="hidden sm:inline text-sm">Précédent</span>
                                    </button>

                                    {/* Indicateur de page actuelle */}
                                    <div className="flex items-center gap-2 px-4">
                                        <span className="text-gray-500 text-sm">Page</span>
                                        <span className="bg-[#E3001B] text-white px-3 py-1 rounded-lg font-semibold text-sm">
                                            {currentPage}
                                        </span>
                                        <span className="text-gray-500 text-sm">sur {Math.ceil(rawData.length / rowsPerPage)}</span>
                                    </div>

                                    {/* Bouton Suivant */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(rawData.length / rowsPerPage)))}
                                        disabled={currentPage >= Math.ceil(rawData.length / rowsPerPage)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline text-sm">Suivant</span>
                                        <FaChevronRight className="text-sm" />
                                    </button>

                                    {/* Bouton Dernière page */}
                                    <button
                                        onClick={() => setCurrentPage(Math.ceil(rawData.length / rowsPerPage))}
                                        disabled={currentPage >= Math.ceil(rawData.length / rowsPerPage)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Dernière page"
                                    >
                                        <span className="text-sm font-medium">{Math.ceil(rawData.length / rowsPerPage)}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </div>
            )}
        </div>
    );
}

