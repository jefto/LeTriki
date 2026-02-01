import axios from "axios";

// Le proxy est configuré dans package.json : "proxy": "http://196.170.123.41:8000"
// Les requêtes vers /api seront automatiquement redirigées vers le serveur distant
export const api = axios.create({
    baseURL: "",  // URL vide = utilise le proxy
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 secondes de timeout
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.config?.url, error.message);
        if (error.code === 'ECONNABORTED') {
            console.error('⏱️ Timeout de la requête');
            error.message = 'La requête a pris trop de temps. Veuillez réessayer.';
        } else if (!error.response) {
            console.error('🌐 Erreur réseau');
            error.message = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        }
        return Promise.reject(error);
    }
);

