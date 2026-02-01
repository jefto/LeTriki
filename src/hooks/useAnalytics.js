import { useState, useCallback } from 'react';
import { AnalyticsService } from '../services/AnalyticsService';

export const useAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [lastdayCurve, setLastdayCurve] = useState(null);
    const [weekdayHist, setWeekdayHist] = useState(null);
    const [peaksTroughs, setPeaksTroughs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fonction utilitaire pour gérer les erreurs
    const handleError = (err, defaultMessage) => {
        console.error('❌ Erreur:', err);

        let errorMessage = defaultMessage;

        if (err.response) {
            // Erreur HTTP
            errorMessage = `Erreur serveur (${err.response.status}): ${err.response.data?.detail || err.response.statusText}`;
        } else if (err.request) {
            // Pas de réponse
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur API est démarré et accessible.';
        } else {
            errorMessage = err.message || defaultMessage;
        }

        setError(errorMessage);
        return errorMessage;
    };

    // Récupérer le résumé (summary)
    const fetchSummary = useCallback(async () => {
        console.log('🔄 useAnalytics.fetchSummary - Début');
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsSummary();
            console.log('✅ useAnalytics.fetchSummary - Réponse:', response.data);
            setSummary(response.data);
            return response.data;
        } catch (err) {
            handleError(err, 'Erreur lors de la récupération du résumé');
            throw err;
        } finally {
            setLoading(false);
            console.log('🔄 useAnalytics.fetchSummary - Fin');
        }
    }, []);

    // Récupérer la courbe du dernier jour
    const fetchLastdayCurve = useCallback(async () => {
        console.log('🔄 useAnalytics.fetchLastdayCurve - Début');
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsLastdayCurve();
            console.log('✅ useAnalytics.fetchLastdayCurve - Réponse:', response.data);
            setLastdayCurve(response.data);
            return response.data;
        } catch (err) {
            handleError(err, 'Erreur lors de la récupération de la courbe');
            throw err;
        } finally {
            setLoading(false);
            console.log('🔄 useAnalytics.fetchLastdayCurve - Fin');
        }
    }, []);

    // Récupérer l'histogramme hebdomadaire
    const fetchWeekdayHist = useCallback(async () => {
        console.log('🔄 useAnalytics.fetchWeekdayHist - Début');
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsWeekdayHist();
            console.log('✅ useAnalytics.fetchWeekdayHist - Réponse:', response.data);
            setWeekdayHist(response.data);
            return response.data;
        } catch (err) {
            handleError(err, 'Erreur lors de la récupération de l\'histogramme');
            throw err;
        } finally {
            setLoading(false);
            console.log('🔄 useAnalytics.fetchWeekdayHist - Fin');
        }
    }, []);

    // Récupérer les pics et creux
    const fetchPeaksTroughs = useCallback(async (start, end, resample = 'D', target = 'CONSOMMATION_TOTALE', min_prominence = null, min_distance = 1) => {
        console.log('🔄 useAnalytics.fetchPeaksTroughs - Début', { start, end, resample, target });
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsPeaksTroughs(start, end, resample, target, min_prominence, min_distance);
            console.log('✅ useAnalytics.fetchPeaksTroughs - Réponse:', response.data);
            setPeaksTroughs(response.data);
            return response.data;
        } catch (err) {
            handleError(err, 'Erreur lors de la récupération des pics/creux');
            throw err;
        } finally {
            setLoading(false);
            console.log('🔄 useAnalytics.fetchPeaksTroughs - Fin');
        }
    }, []);

    // Réinitialiser toutes les données
    const resetAll = useCallback(() => {
        setSummary(null);
        setLastdayCurve(null);
        setWeekdayHist(null);
        setPeaksTroughs(null);
        setError(null);
    }, []);

    return {
        summary,
        lastdayCurve,
        weekdayHist,
        peaksTroughs,
        loading,
        error,
        fetchSummary,
        fetchLastdayCurve,
        fetchWeekdayHist,
        fetchPeaksTroughs,
        resetAll
    };
};
