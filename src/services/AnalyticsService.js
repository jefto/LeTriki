/*
* summary (GET) - Rôle : Alimente les cartes récapitulatives du tableau de bord. Rempli automatiquement au démarrage (warmup).
* lastday-curve (GET) - Rôle : Fournit une courbe horaire pour le jour J-1 (24 points).
* weekday-hist (GET) - Rôle : Donne l’histogramme des moyennes par jour de semaine (Lun → Dim) sur tout l’historique chargé au démarrage.
* peaks-troughs (GET) - Rôle : Détecte les pics (max locaux) et creux (min locaux) sur une période et un pas donnés.
* */

import { api } from "./api";
import {format} from 'date-fns'

export const AnalyticsService = {
    getAnalyticsSummary: () => {
        return api.get('/api/analytics/summary');
    },

    getAnalyticsLastdayCurve: () => {
        return api.get('/api/analytics/lastday_curve');
    },

    getAnalyticsWeekdayHist:() => {
        return api.get('/api/analytics/weekday_hist');
    },

    getAnalyticsPeaksTroughs: (start, end, resample = "D", target = "CONSOMATION_TOTALE", min_prominence="min_prominence", min_distance = 1, dateFormat = 'yyyy-MM-dd') => {
        const formattedStart = format(new Date(start), dateFormat);
        const formattedEnd = format(new Date(end), dateFormat);
        return api.get(`/api/analytics/peaks_troughs?start=${formattedStart}&end=${formattedEnd}&resample=${resample}&target=${target}&min_prominence=${min_prominence}&min_distance=${min_distance}`);
    }
}
