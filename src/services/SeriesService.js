/*
* Rôle : Renvoie la série de consommation sur une période au pas choisi, prête à tracer.
* Endpoint: /api/series
* Paramètres:
*   - start, end (obligatoire, YYYY-MM-DD)
*   - resample (def: D) : règle pandas (D, W-MON, H, 30min, M…)
*   - target (def: CONSOMMATION_TOTALE)
*   - agg (optionnel: sum|mean|min|max)
*/

import { api } from './api';
import { format } from 'date-fns';

// Les requêtes passent par le proxy configuré dans package.json

const SeriesService = {

    getSeries: (start, end, resample = "D", target = "CONSOMMATION_TOTALE", agg = null, dateFormat = 'yyyy-MM-dd') => {
        const formattedStart = format(new Date(start), dateFormat);
        const formattedEnd = format(new Date(end), dateFormat);

        const params = new URLSearchParams({
            start: formattedStart,
            end: formattedEnd,
            resample: resample,
            target: target
        });

        if (agg) {
            params.append('agg', agg);
        }

        console.log('📡 SeriesService.getSeries - Appel /api/series');
        return api.get(`/api/series?${params.toString()}`);
    }

}

export default SeriesService;