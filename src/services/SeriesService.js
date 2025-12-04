import api from "./api";
import {format} from 'date-fns'

const SeriesService = {

    getSeries: (start, end, resample = "D", target = "CONSOMMATION_TOTALE", dateFormat = 'yyyy-MM-dd') => {
        const formattedStart = format(new Date(start), dateFormat);
        const formattedEnd = format(new Date(end), dateFormat);
        return api.get(`/api/series?start=${formattedStart}&end=${formattedEnd}&resample=${resample}&target=${target}`);
    }

}

export default SeriesService;