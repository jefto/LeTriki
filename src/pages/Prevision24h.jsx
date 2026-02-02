import { useState, useMemo, useRef } from "react";
import {
    FaFileExcel,
    FaFileCsv,
    FaFileImage,
    FaChartLine,
    FaHistory,
    FaPlay,
    FaSpinner,
    FaExclamationTriangle,
    FaCogs,
    FaCheckCircle,
    FaCalendarAlt
} from "react-icons/fa";
import { MdShowChart, MdAccessTime } from "react-icons/md";
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist-min';
import * as XLSX from 'xlsx';
import { ModelService } from '../services/ModelService';

export default function Prevision24h() {
    // Référence pour le graphique Plotly (export PNG)
    const plotlyRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    // États pour le formulaire de prévision
    const [formData, setFormData] = useState({
        measurement: 'dataset',
        field: 'CONSOMMATION_TOTALE',
        start: '2014-01-01',
        stop: '2019-10-07',
        lags: 72,
        horizon: 24
    });

    // État pour les données de prévision de l'API
    const [apiResponse, setApiResponse] = useState(null);

    /**
     * Parse la réponse API et génère les données pour le graphique
     * L'API renvoie: { hour: 1, prediction: 96.88 } où hour=1 correspond à 01:00
     * @param {Object} response - Réponse de l'API
     * @returns {Object} - Données formatées pour Plotly
     */
    const parsePredictionResponse = (response) => {
        if (!response || !response.predictions || !Array.isArray(response.predictions)) {
            return null;
        }

        const predictions = response.predictions;

        // Créer le tableau de données : hour devient "01:00", "02:00", etc.
        // hour=1 → "01:00", hour=24 → "00:00" (minuit du jour suivant)
        const tableauDonnees = predictions.map(item => ({
            heure: item.hour === 24 ? '00:00' : `${item.hour.toString().padStart(2, '0')}:00`,
            consommation: item.prediction
        }));

        // Extraire les labels X (heures) et valeurs Y (consommations)
        const xLabels = tableauDonnees.map(row => row.heure);
        const yValues = tableauDonnees.map(row => row.consommation);

        return {
            x: xLabels,
            y: yValues,
            tableauDonnees,
            lastTimestamp: response.last_timestamp,
            horizonHours: response.horizon_hours || predictions.length
        };
    };

    // Données de prévision parsées (mémorisées pour performance)
    const predictionData = useMemo(() => {
        return parsePredictionResponse(apiResponse);
    }, [apiResponse]);

    // Données du tableau détaillé générées à partir des prévisions
    const detailedData = useMemo(() => {
        if (!predictionData || !predictionData.tableauDonnees) return [];

        return predictionData.tableauDonnees.map((row) => {
            const value = row.consommation;
            const hourNum = parseInt(row.heure.split(':')[0]);

            // Déterminer le statut basé sur la valeur et l'heure
            let statut = 'Normal';
            if (value > 130) {
                statut = hourNum >= 6 && hourNum <= 12 ? 'Pic Matin' : 'Pic Soir';
            }

            return {
                heure: row.heure,
                prevision: value.toFixed(2),
                statut
            };
        });
    }, [predictionData]);

    // Statistiques des prévisions
    const predictionStats = useMemo(() => {
        if (!predictionData?.y || predictionData.y.length === 0) return null;

        const values = predictionData.y;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const total = values.reduce((a, b) => a + b, 0);

        return {
            min: min.toFixed(2),
            max: max.toFixed(2),
            avg: avg.toFixed(2),
            total: total.toFixed(2),
            count: values.length
        };
    }, [predictionData]);

    // Gestion du formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lags' || name === 'horizon' ? parseInt(value) || 0 : value
        }));
    };

    // Soumission de la prévision
    const handleSubmitPrediction = async () => {
        try {
            setLoading(true);
            setError(null);
            setShowNotification(false);
            setSuccessMessage(null);
            setApiResponse(null);

            // Construire les paramètres pour l'API
            const params = {
                measurement: formData.measurement,
                field: formData.field,
                start: `${formData.start}T00:00:00Z`,
                stop: `${formData.stop}T00:00:00Z`,
                lags: formData.lags,
                horizon: formData.horizon
            };

            const response = await ModelService.predictNextDay(params);

            // Stocker la réponse brute
            setApiResponse(response.data);
            setSuccessMessage(`Prévision générée avec succès ! ${response.data.horizon_hours || 24} heures prédites.`);

            // Masquer le message de succès après 3 secondes
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

        } catch (err) {
            setError('Erreur Backend: Impossible de générer la prévision pour le moment.');
            setShowNotification(true);

            // Masquer la notification après 5 secondes
            setTimeout(() => {
                setShowNotification(false);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

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
            filename: `prevision_${formData.stop}_${new Date().toISOString().split('T')[0]}`,
            width: 1200,
            height: 600,
            scale: 2 // Haute résolution
        });
    };

    /**
     * Export des données en CSV
     */
    const handleExportCSV = () => {
        if (!predictionData || !predictionData.tableauDonnees) {
            alert('Aucune donnée à exporter');
            return;
        }

        // Créer l'entête CSV
        const headers = ['Heure', 'Consommation Prévue (kWh)', 'Statut'];

        // Créer les lignes de données
        const rows = detailedData.map(row => [
            row.heure,
            row.prevision,
            row.statut
        ]);

        // Assembler le CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Créer le Blob et télécharger
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prevision_${formData.stop}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * Export des données en Excel via SheetJS (xlsx)
     */
    const handleExportExcel = () => {
        if (!predictionData || !predictionData.tableauDonnees) {
            alert('Aucune donnée à exporter');
            return;
        }

        // Préparer les données pour Excel
        const excelData = detailedData.map(row => ({
            'Heure': row.heure,
            'Consommation Prévue (kWh)': parseFloat(row.prevision),
            'Statut': row.statut
        }));

        // Ajouter les statistiques en bas du tableau
        if (predictionStats) {
            excelData.push({}); // Ligne vide
            excelData.push({ 'Heure': 'STATISTIQUES', 'Consommation Prévue (kWh)': '', 'Statut': '' });
            excelData.push({ 'Heure': 'Minimum', 'Consommation Prévue (kWh)': parseFloat(predictionStats.min), 'Statut': 'kWh' });
            excelData.push({ 'Heure': 'Maximum', 'Consommation Prévue (kWh)': parseFloat(predictionStats.max), 'Statut': 'kWh' });
            excelData.push({ 'Heure': 'Moyenne', 'Consommation Prévue (kWh)': parseFloat(predictionStats.avg), 'Statut': 'kWh' });
            excelData.push({ 'Heure': 'Total', 'Consommation Prévue (kWh)': parseFloat(predictionStats.total), 'Statut': 'kWh' });
        }

        // Créer le workbook et la feuille
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Prévisions');

        // Ajuster la largeur des colonnes
        worksheet['!cols'] = [
            { wch: 10 },  // Heure
            { wch: 25 },  // Consommation
            { wch: 12 }   // Statut
        ];

        // Télécharger le fichier
        XLSX.writeFile(workbook, `prevision_${formData.stop}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // ========== FIN FONCTIONS D'EXPORT ==========

    const ChartCard = ({ title, children, icon, headerActions }) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-[#E3001B] text-2xl">
                        {icon}
                    </div>
                    <h3 className="text-gray-900 font-bold text-xl font-poppins">{title}</h3>
                </div>
                {headerActions}
            </div>
            {children}
        </div>
    );

    // Composant pour les cartes de statistiques
    const StatCard = ({ title, value, unit, icon, color }) => (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${color}`}>{icon}</span>
                <span className="text-gray-500 text-sm font-medium">{title}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                <span className="text-gray-500 text-sm">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen">
            {/* Notification Toast - Erreur */}
            {showNotification && error && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                    <FaExclamationTriangle className="text-2xl" />
                    <div>
                        <p className="font-semibold">{error}</p>
                        <p className="text-sm text-red-500">Vérifiez vos paramètres ou réessayez.</p>
                    </div>
                </div>
            )}

            {/* Notification Toast - Succès */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                    <FaCheckCircle className="text-2xl" />
                    <p className="font-semibold">{successMessage}</p>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <p className="text-gray-500 text-lg font-poppins mb-2">Génération et analyse des prévisions</p>
                <h1 className="text-5xl font-poppins font-bold text-gray-900 mb-2">
                    Prévision 24h
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-[#E3001B] to-[#FDB913] rounded-full"></div>
            </div>

            {/* Grid principale : Formulaire + Résultats */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Section Formulaire (1/3) */}
                <div className="xl:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 sticky top-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-[#E3001B] text-2xl">
                                <FaCogs />
                            </div>
                            <h3 className="text-gray-900 font-bold text-xl font-poppins">Paramètres</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Measurement */}
                            <div>
                                <label className="block text-gray-600 font-semibold mb-2 text-sm">Measurement</label>
                                <input
                                    type="text"
                                    name="measurement"
                                    value={formData.measurement}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                                />
                            </div>

                            {/* Field */}
                            <div>
                                <label className="block text-gray-600 font-semibold mb-2 text-sm">Field</label>
                                <input
                                    type="text"
                                    name="field"
                                    value={formData.field}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                                />
                            </div>

                            {/* Date Début */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-600 font-semibold mb-2 text-sm">
                                    <FaCalendarAlt className="text-[#E3001B]" />
                                    Date de début
                                </label>
                                <input
                                    type="date"
                                    name="start"
                                    value={formData.start}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                                />
                            </div>

                            {/* Date Fin */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-600 font-semibold mb-2 text-sm">
                                    <FaCalendarAlt className="text-[#FDB913]" />
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    name="stop"
                                    value={formData.stop}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                                />
                            </div>

                            {/* Lags & Horizon en 2 colonnes */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-600 font-semibold mb-2 text-sm">Lags</label>
                                    <input
                                        type="number"
                                        name="lags"
                                        value={formData.lags}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-600 font-semibold mb-2 text-sm">Horizon (h)</label>
                                    <input
                                        type="number"
                                        name="horizon"
                                        value={formData.horizon}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="168"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E3001B]/50 focus:border-[#E3001B]"
                                    />
                                </div>
                            </div>

                            {/* Bouton de soumission */}
                            <button
                                onClick={handleSubmitPrediction}
                                disabled={loading}
                                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
                                    loading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#E3001B] text-white hover:bg-[#c40018] hover:shadow-lg'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Calcul en cours...
                                    </>
                                ) : (
                                    <>
                                        <FaPlay />
                                        Lancer la prévision
                                    </>
                                )}
                            </button>

                            {/* Info */}
                            <p className="text-gray-400 text-xs text-center mt-4">
                                Les prévisions sont calculées avec le modèle CatBoost
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Résultats (2/3) */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Statistiques rapides (si données disponibles) */}
                    {predictionStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                title="Minimum"
                                value={predictionStats.min}
                                unit="kWh"
                                icon={<MdShowChart />}
                                color="text-green-600"
                            />
                            <StatCard
                                title="Maximum"
                                value={predictionStats.max}
                                unit="kWh"
                                icon={<MdShowChart />}
                                color="text-red-600"
                            />
                            <StatCard
                                title="Moyenne"
                                value={predictionStats.avg}
                                unit="kWh"
                                icon={<FaChartLine />}
                                color="text-[#FDB913]"
                            />
                            <StatCard
                                title="Heures prédites"
                                value={predictionStats.count}
                                unit="h"
                                icon={<MdAccessTime />}
                                color="text-[#E3001B]"
                            />
                        </div>
                    )}

                    {/* Graphique principal */}
                    <ChartCard
                        title={predictionData
                            ? `Prévision de consommation - ${predictionData.horizonHours || 24}h`
                            : "Prévision de consommation"
                        }
                        icon={<MdShowChart />}
                        headerActions={
                            predictionData && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleExportPNG}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                                    >
                                        <FaFileImage />
                                        PNG
                                    </button>
                                    <button
                                        onClick={handleExportCSV}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                                    >
                                        <FaFileCsv />
                                        CSV
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                                    >
                                        <FaFileExcel />
                                        Excel
                                    </button>
                                </div>
                            )
                        }
                    >
                        {loading ? (
                            <div className="flex justify-center items-center h-[400px]">
                                <div className="text-center">
                                    <FaSpinner className="animate-spin text-[#E3001B] text-6xl mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">Calcul des prévisions en cours...</p>
                                    <p className="text-gray-400 text-sm mt-2">Cela peut prendre quelques secondes</p>
                                </div>
                            </div>
                        ) : predictionData ? (
                            <Plot
                                ref={plotlyRef}
                                data={[
                                    // Courbe principale de prévision
                                    {
                                        x: predictionData.x,
                                        y: predictionData.y,
                                        type: 'scatter',
                                        mode: 'lines+markers',
                                        name: 'Prévision',
                                        line: {
                                            color: '#FDB913',
                                            width: 4,
                                            shape: 'spline'
                                        },
                                        marker: {
                                            color: '#FDB913',
                                            size: 8,
                                            line: { color: '#fff', width: 2 }
                                        },
                                        hovertemplate: '<b>%{x}</b><br>Prévision: %{y:.2f} kWh<extra></extra>'
                                    }
                                ]}
                                layout={{
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    font: { color: '#1F2937', family: 'Poppins' },
                                    xaxis: {
                                        gridcolor: '#E5E7EB',
                                        zerolinecolor: '#D1D5DB',
                                        title: { text: 'Date / Heure', font: { size: 14 } },
                                        tickfont: { color: '#6B7280', size: 11 },
                                        tickangle: -45
                                    },
                                    yaxis: {
                                        gridcolor: '#E5E7EB',
                                        zerolinecolor: '#D1D5DB',
                                        title: { text: 'Consommation (kWh)', font: { size: 14 } },
                                        tickfont: { color: '#6B7280' }
                                    },
                                    legend: {
                                        orientation: 'h',
                                        y: -0.25,
                                        x: 0.5,
                                        xanchor: 'center',
                                        font: { color: '#1F2937', size: 12 }
                                    },
                                    margin: { t: 20, r: 40, b: 100, l: 80 },
                                    showlegend: true,
                                    hovermode: 'x unified'
                                }}
                                style={{ width: '100%', height: '400px' }}
                                config={{
                                    displayModeBar: true,
                                    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                                    displaylogo: false
                                }}
                            />
                        ) : (
                            <div className="flex flex-col justify-center items-center h-[400px] text-center">
                                <div className="bg-gray-100 p-6 rounded-full mb-4">
                                    <FaChartLine className="text-gray-400 text-5xl" />
                                </div>
                                <p className="text-gray-500 font-medium text-lg">Aucune prévision générée</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Configurez les paramètres et cliquez sur "Lancer la prévision"
                                </p>
                            </div>
                        )}
                    </ChartCard>
                </div>
            </div>

            {/* Tableau des prévisions détaillées */}
            {predictionData && detailedData.length > 0 && (
                <ChartCard
                    title="Détails des prévisions horaires"
                    icon={<FaHistory />}
                    headerActions={
                        <button
                            onClick={handleExportExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                            <FaFileExcel />
                            Exporter Excel
                        </button>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-gray-700">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-semibold text-[#E3001B]">Heure</th>
                                    <th className="text-right py-3 px-4 font-semibold text-[#E3001B]">Prévision (kWh)</th>
                                    <th className="text-center py-3 px-4 font-semibold text-[#E3001B]">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedData.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium flex items-center gap-2">
                                            <MdAccessTime className="text-gray-400" />
                                            {row.heure}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-[#FDB913]">{row.prevision}</td>
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

                    {/* Résumé en bas du tableau */}
                    {predictionStats && (
                        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4 text-sm">
                            <div className="flex items-center gap-6">
                                <span className="text-gray-500">
                                    <strong className="text-gray-700">{predictionStats.count}</strong> heures prédites
                                </span>
                                <span className="text-gray-500">
                                    Total: <strong className="text-gray-700">{predictionStats.total}</strong> kWh
                                </span>
                            </div>
                            <div className="text-gray-400">
                                Dernière mise à jour: {apiResponse?.last_timestamp ? new Date(apiResponse.last_timestamp).toLocaleString('fr-FR') : '--'}
                            </div>
                        </div>
                    )}
                </ChartCard>
            )}
        </div>
    );
}

