import { useState, useCallback } from 'react';
import { AnalyticsService } from '../services/AnalyticsService';

export const useAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [lastdayCurve, setLastdayCurve] = useState(null);
    const [weekdayHist, setWeekdayHist] = useState(null);
    const [peaksTroughs, setPeaksTroughs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Récupérer le résumé (summary)
    const fetchSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsSummary();
            setSummary(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération du résumé');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Récupérer la courbe du dernier jour
    const fetchLastdayCurve = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsLastdayCurve();
            setLastdayCurve(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération de la courbe');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Récupérer l'histogramme hebdomadaire
    const fetchWeekdayHist = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsWeekdayHist();
            setWeekdayHist(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération de l\'histogramme');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Récupérer les pics et creux
    const fetchPeaksTroughs = useCallback(async (start, end, resample = 'D', target = 'CONSOMATION_TOTALE', min_prominence = 'min_prominence', min_distance = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AnalyticsService.getAnalyticsPeaksTroughs(start, end, resample, target, min_prominence, min_distance);
            setPeaksTroughs(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération des pics/creux');
            throw err;
        } finally {
            setLoading(false);
        }
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
        fetchPeaksTroughs
    };
};
