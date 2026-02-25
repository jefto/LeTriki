/*
* API Analytics - Endpoints disponibles:
* - /api/summary (GET) - Alimente les cartes récapitulatives du tableau de bord
* - /api/lastday_curve (GET) - Fournit une courbe horaire pour le jour J-1 (24 points)
* - /api/weekday_hist (GET) - Histogramme des moyennes par jour de semaine (Lun → Dim)
* - /api/peaks_troughs (GET) - Détecte les pics et creux sur une période donnée
* - /api/series (GET) - Renvoie la série de consommation sur une période au pas choisi
*/

import { api } from './api';
import { format } from 'date-fns';

// Les requêtes passent par le proxy configuré dans package.json
// qui redirige vers http://196.170.123.41:8000

export const AnalyticsService = {

    // ===== NOUVEL ENDPOINT PRINCIPAL =====
    // Récupère la série de consommation pour une période donnée
    // Paramètres: start, stop (dates au format YYYY-MM-DD), resample (D, H, W, 30min, M)
    getSeries: (start, stop, resample = 'H', target = 'CONSOMMATION_TOTALE') => {
        const formattedStart = format(new Date(start), 'yyyy-MM-dd');
        const formattedStop = format(new Date(stop), 'yyyy-MM-dd');

        const params = new URLSearchParams({
            start: formattedStart,
            end: formattedStop,
            resample: resample,
            target: target
        });

        console.log(`📡 AnalyticsService.getSeries - Appel /api/series?${params.toString()}`);
        return api.get(`/api/series?${params.toString()}`);
    },

    // Récupère le résumé pour les cartes du dashboard (conservé pour rétrocompatibilité)
    getAnalyticsSummary: () => {
        console.log('📡 AnalyticsService.getAnalyticsSummary - Appel /api/summary');
        return api.get('/api/summary');
    },

    // Récupère la courbe du dernier jour (conservé pour rétrocompatibilité)
    getAnalyticsLastdayCurve: () => {
        console.log('📡 AnalyticsService.getAnalyticsLastdayCurve - Appel /api/lastday_curve');
        return api.get('/api/lastday_curve');
    },

    // Récupère l'histogramme hebdomadaire (7 jours)
    getAnalyticsWeekdayHist: () => {
        console.log('📡 AnalyticsService.getAnalyticsWeekdayHist - Appel /api/weekday_hist');
        return api.get('/api/weekday_hist');
    },

    // Récupère les pics et creux
    getAnalyticsPeaksTroughs: (start, end, resample = "D", target = "CONSOMMATION_TOTALE", min_prominence = null, min_distance = 1, dateFormat = 'yyyy-MM-dd') => {
        const formattedStart = format(new Date(start), dateFormat);
        const formattedEnd = format(new Date(end), dateFormat);

        const params = new URLSearchParams({
            start: formattedStart,
            end: formattedEnd,
            resample: resample,
            target: target,
            min_distance: min_distance.toString()
        });

        if (min_prominence !== null) {
            params.append('min_prominence', min_prominence.toString());
        }

        console.log('📡 AnalyticsService.getAnalyticsPeaksTroughs - Appel /api/peaks_troughs');

        return api.get(`/api/peaks_troughs?${params.toString()}`);
    }
};
