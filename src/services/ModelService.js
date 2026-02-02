/*
* API Model - Endpoints pour le modèle de prévision:
* - /api/hourly/metrics (GET) - Récupère les métriques de performance du modèle
* - /api/catboost/predict_next_day (POST) - Génère les prévisions pour le jour suivant
*/

import { api } from './api';

export const ModelService = {

    /**
     * Récupère les métriques de performance du modèle
     * @returns {Promise} - { metrics: {RMSE, MAE, MAPE, SMAPE, R2}, n_train, n_val, n_test, split_date, params }
     */
    getModelMetrics: () => {
        return api.get('/api/hourly/metrics');
    },

    /**
     * Génère les prévisions pour le jour suivant
     * @param {Object} params - Paramètres de la prévision
     * @param {string} params.measurement - Nom de la mesure (ex: "dataset")
     * @param {string} params.field - Champ cible (ex: "CONSOMMATION_TOTALE")
     * @param {string} params.start - Date de début (format ISO: "2014-01-01T00:00:00Z")
     * @param {string} params.stop - Date de fin (format ISO: "2020-01-01T00:00:00Z")
     * @param {number} params.lags - Nombre de lags pour le modèle (ex: 72)
     * @param {number} params.horizon - Horizon de prévision en heures (ex: 24)
     * @returns {Promise} - Réponse avec les prévisions
     */
    predictNextDay: (params) => {
        return api.post('/api/catboost/predict_next_day', params);
    }
};

export default ModelService;
