import { useState, useMemo, useEffect, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import * as XLSX from 'xlsx';
import { ModelService } from '../services/ModelService';

/**
 * Hook personnalisé pour gérer les prévisions 24h
 */
export function usePrevision24h() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    // États pour le formulaire
    const [horizon, setHorizon] = useState(24);
    const [model, setModel] = useState('catboost');

    // Paramètres fixes
    const fixedParams = {
        measurement: 'dataset',
        field: 'CONSOMMATION_TOTALE',
        start: '2014-01-01',
        stop: '2019-10-07',
        lags: 72
    };

    // État pour les données de prévision
    const [apiResponse, setApiResponse] = useState(null);

    // Parser la réponse API
    const parsePredictionResponse = (response) => {
        if (!response || !response.predictions || !Array.isArray(response.predictions)) {
            return null;
        }

        const predictions = response.predictions;
        const tableauDonnees = predictions.map(item => ({
            heure: item.hour.toString().padStart(2, '0'),
            consommation: item.prediction
        }));

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

    // Données parsées
    const predictionData = useMemo(() => {
        return parsePredictionResponse(apiResponse);
    }, [apiResponse]);

    // Données du tableau détaillé
    const detailedData = useMemo(() => {
        if (!predictionData || !predictionData.tableauDonnees) return [];

        return predictionData.tableauDonnees.map((row) => {
            const value = row.consommation;
            const hourNum = parseInt(row.heure);

            let statut = 'Normal';
            if (value > 130) {
                statut = hourNum >= 6 && hourNum <= 12 ? 'Pic Matin' : 'Pic Soir';
            }

            return {
                heure: `${row.heure}:00`,
                prevision: value.toFixed(2),
                statut
            };
        });
    }, [predictionData]);

    // Statistiques
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

    // Charger les prévisions
    const loadPrediction = useCallback(async (horizonValue = horizon) => {
        try {
            setLoading(true);
            setError(null);
            setShowNotification(false);
            setSuccessMessage(null);

            const params = {
                measurement: fixedParams.measurement,
                field: fixedParams.field,
                start: `${fixedParams.start}T00:00:00Z`,
                stop: `${fixedParams.stop}T00:00:00Z`,
                lags: fixedParams.lags,
                horizon: horizonValue
            };

            const response = await ModelService.predictNextDay(params);

            setApiResponse(response.data);
            setSuccessMessage(`Prévision générée avec succès ! ${response.data.horizon_hours || horizonValue} heures prédites.`);

            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

        } catch (err) {
            console.error('Erreur lors de la prévision:', err);
            setError('Erreur Backend: Impossible de générer la prévision pour le moment.');
            setShowNotification(true);

            setTimeout(() => {
                setShowNotification(false);
            }, 5000);
        } finally {
            setLoading(false);
        }
    }, [horizon, fixedParams]);

    // Chargement initial
    useEffect(() => {
        loadPrediction(horizon);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRefreshPrediction = useCallback(() => {
        loadPrediction(horizon);
    }, [loadPrediction, horizon]);

    // Exports
    const handleExportPNG = useCallback((plotlyRef) => {
        if (!plotlyRef?.current?.el) {
            alert('Aucun graphique à exporter');
            return;
        }

        Plotly.downloadImage(plotlyRef.current.el, {
            format: 'png',
            filename: `prevision_${fixedParams.stop}_${new Date().toISOString().split('T')[0]}`,
            width: 1200,
            height: 600,
            scale: 2
        });
    }, [fixedParams.stop]);

    const handleExportCSV = useCallback(() => {
        if (!predictionData || !predictionData.tableauDonnees) {
            alert('Aucune donnée à exporter');
            return;
        }

        const headers = ['Heure', 'Consommation Prévue (kWh)'];
        const rows = detailedData.map(row => [row.heure, row.prevision]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prevision_${fixedParams.stop}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [predictionData, detailedData, fixedParams.stop]);

    const handleExportExcel = useCallback(() => {
        if (!predictionData || !predictionData.tableauDonnees) {
            alert('Aucune donnée à exporter');
            return;
        }

        const excelData = detailedData.map(row => ({
            'Heure': row.heure,
            'Consommation Prevue (kWh)': parseFloat(row.prevision)
        }));

        if (predictionStats) {
            excelData.push({});
            excelData.push({ 'Heure': 'STATISTIQUES', 'Consommation Prevue (kWh)': '' });
            excelData.push({ 'Heure': 'Minimum', 'Consommation Prevue (kWh)': parseFloat(predictionStats.min) });
            excelData.push({ 'Heure': 'Maximum', 'Consommation Prevue (kWh)': parseFloat(predictionStats.max) });
            excelData.push({ 'Heure': 'Moyenne', 'Consommation Prevue (kWh)': parseFloat(predictionStats.avg) });
            excelData.push({ 'Heure': 'Total', 'Consommation Prevue (kWh)': parseFloat(predictionStats.total) });
        }

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Previsions');
        worksheet['!cols'] = [{ wch: 10 }, { wch: 25 }];
        XLSX.writeFile(workbook, `prevision_${fixedParams.stop}_${new Date().toISOString().split('T')[0]}.xlsx`);
    }, [predictionData, detailedData, predictionStats, fixedParams.stop]);

    return {
        // États
        loading,
        error,
        showNotification,
        successMessage,
        horizon,
        model,
        predictionData,
        detailedData,
        predictionStats,
        apiResponse,
        // Setters
        setHorizon,
        setModel,
        // Fonctions
        handleRefreshPrediction,
        handleExportPNG,
        handleExportCSV,
        handleExportExcel
    };
}

