import api from "./api";
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
