import { useState, useEffect, useCallback } from 'react';
import { ModelService } from '../services/ModelService';

/**
 * Hook personnalisé pour gérer la page Performance des Modèles
 */
export function usePerformanceModeles() {
    const [metricsData, setMetricsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // État pour le modèle sélectionné
    const [selectedModel, setSelectedModel] = useState('catboost');

    // Liste des modèles disponibles
    const availableModels = [
        { id: 'catboost', name: 'CatBoost' }
        // Les futurs modèles seront ajoutés ici
    ];

    // Fonction pour charger les métriques
    const loadMetrics = useCallback(async (modelId = selectedModel) => {
        try {
            setLoading(true);
            setError(null);
            const response = await ModelService.getModelMetrics(modelId);
            console.log('📊 Métriques reçues:', response.data);
            setMetricsData(response.data);
        } catch (err) {
            console.error('❌ Erreur chargement métriques:', err);
            setError('Impossible de charger les métriques du modèle. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    }, [selectedModel]);

    // Charger les métriques au montage
    useEffect(() => {
        loadMetrics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Gérer le changement de modèle
    const handleModelChange = useCallback((newModel) => {
        setSelectedModel(newModel);
        loadMetrics(newModel);
    }, [loadMetrics]);

    // Fonction pour rafraîchir les métriques
    const handleRefresh = useCallback(() => {
        loadMetrics(selectedModel);
    }, [loadMetrics, selectedModel]);

    return {
        // États
        metricsData,
        loading,
        error,
        selectedModel,
        availableModels,
        // Fonctions
        handleModelChange,
        handleRefresh
    };
}

