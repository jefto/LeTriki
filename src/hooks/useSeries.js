import { useState, useCallback } from 'react';
import SeriesService from '../services/SeriesService';

export const useSeries = () => {
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSeries = useCallback(async (start, end, resample = 'D', target = 'CONSOMMATION_TOTALE') => {
        console.log('🔄 ===== DEBUT useSeries.fetchSeries =====');
        console.log('📡 Paramètres reçus:', { start, end, resample, target });

        setLoading(true);
        setError(null);
        setSeries(null); // Reset des données précédentes

        try {
            console.log('📡 Appel SeriesService.getSeries...');
            const response = await SeriesService.getSeries(start, end, resample, target);

            console.log('✅ Réponse reçue de l\'API');
            console.log('📦 Type de response:', typeof response);
            console.log('📦 Clés de response:', Object.keys(response));
            console.log('📦 response.data:', response.data);

            if (response.data) {
                console.log('✅ response.data existe');
                console.log('📊 Type de response.data:', typeof response.data);
                console.log('📊 Clés de response.data:', Object.keys(response.data));
                console.log('📊 response.data.timestamps:', response.data.timestamps?.length, 'éléments');
                console.log('📊 response.data.values:', response.data.values?.length, 'éléments');

                setSeries(response.data);
                console.log('✅ setSeries appelé avec response.data');
                return response.data;
            } else {
                console.error('❌ response.data est null/undefined');
                throw new Error('Aucune donnée reçue du serveur');
            }
        } catch (err) {
            console.error('❌ ===== ERREUR dans useSeries.fetchSeries =====');
            console.error('❌ Type:', err.name);
            console.error('❌ Message:', err.message);
            console.error('❌ Stack:', err.stack);

            if (err.response) {
                console.error('❌ HTTP Status:', err.response.status);
                console.error('❌ HTTP Data:', err.response.data);
            }

            const errorMessage = err.message || 'Erreur lors de la récupération des séries';
            setError(errorMessage);
            throw err;
        } finally {
            console.log('🏁 useSeries.fetchSeries: setLoading(false)');
            setLoading(false);
            console.log('🔄 ===== FIN useSeries.fetchSeries =====');
        }
    }, []);

    const clearSeries = useCallback(() => {
        setSeries(null);
        setError(null);
    }, []);

    return {
        series,
        loading,
        error,
        fetchSeries,
        clearSeries
    };
};
