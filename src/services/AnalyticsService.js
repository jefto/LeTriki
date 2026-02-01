/*
* API Analytics - Endpoints disponibles:
* - /api/summary (GET) - Alimente les cartes récapitulatives du tableau de bord
* - /api/lastday_curve (GET) - Fournit une courbe horaire pour le jour J-1 (24 points)
* - /api/weekday_hist (GET) - Histogramme des moyennes par jour de semaine (Lun → Dim)
* - /api/peaks_troughs (GET) - Détecte les pics et creux sur une période donnée
*/

import { api } from './api';
import { format } from 'date-fns';

// Les requêtes passent par le proxy configuré dans package.json
// qui redirige vers http://196.170.123.41:8000

export const AnalyticsService = {

    // Récupère le résumé pour les cartes du dashboard
    getAnalyticsSummary: () => {
        console.log('📡 AnalyticsService.getAnalyticsSummary - Appel /api/summary');
        return api.get('/api/summary');
    },

    // Récupère la courbe du dernier jour (24 points horaires)
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
