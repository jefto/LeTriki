// ============================================
// TRANSFORMERS - Conversion API → Tableaux de Données
// Architecture: Les transformers NE créent PAS les objets Plotly
// Ils retournent uniquement des tableaux de données simples
// Le frontend React crée les graphiques Plotly à partir de ces tableaux
// ============================================

/**
 * API: /api/analytics/summary
 * Transforme les données de summary en objet simple pour les cartes métriques
 * @param {Object} summaryData - { prev_day_total, prev_vs_prevday, weekly_avg, monthly_avg }
 * @returns {Object} { prevDayTotal, prevVsPrevday, weeklyAvg, monthlyAvg }
 */
export const transformSummaryData = (summaryData) => {
    if (!summaryData) {
        console.warn('⚠️ transformSummaryData: Données invalides');
        return null;
    }

    console.log('📊 transformSummaryData: Transformation...', summaryData);

    return {
        prevDayTotal: summaryData.prev_day_total || 0,
        prevVsPrevday: (summaryData.prev_vs_prevday || 0) * 100, // Convertir en pourcentage
        weeklyAvg: summaryData.weekly_avg || 0,
        monthlyAvg: summaryData.monthly_avg || 0
    };
};

/**
 * API: /api/analytics/lastday_curve
 * Transforme la courbe du dernier jour en tableau simple (24 points)
 * @param {Object} curveData - { timestamps: [], values: [] }
 * @returns {Array} [{ heure, timestamp, consommation }, ...]
 */
export const transformLastdayCurve = (curveData) => {
    if (!curveData) {
        console.warn('⚠️ transformLastdayCurve: Données invalides');
        return [];
    }

    console.log('📊 transformLastdayCurve: Transformation...', {
        nbPoints: curveData.timestamps?.length || curveData.time_index?.length
    });

    // Adaptateur: gérer {time_index, y} ET {timestamps, values}
    const timestamps = curveData.timestamps || curveData.time_index;
    const values = curveData.values || curveData.y;

    if (!timestamps || !values) {
        console.warn('⚠️ transformLastdayCurve: timestamps ou values manquant');
        return [];
    }

    const tableau = timestamps.map((timestamp, index) => ({
        heure: new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestamp: timestamp,
        consommation: Math.round(values[index] * 10) / 10
    }));

    console.log('✅ transformLastdayCurve: Tableau généré avec', tableau.length, 'points');
    return tableau;
};

/**
 * API: /api/analytics/weekday_hist
 * Transforme l'histogramme hebdomadaire en tableau simple (7 jours)
 * @param {Object} histData - { weekdays: [], averages: [] }
 * @returns {Array} [{ jour, jourEn, moyenne }, ...]
 */
export const transformWeekdayHist = (histData) => {
    if (!histData || !histData.weekdays || !histData.averages) {
        console.warn('⚠️ transformWeekdayHist: Données invalides');
        return [];
    }

    console.log('📊 transformWeekdayHist: Transformation...', {
        nbJours: histData.weekdays.length
    });

    const joursFr = {
        'Monday': 'Lundi',
        'Tuesday': 'Mardi',
        'Wednesday': 'Mercredi',
        'Thursday': 'Jeudi',
        'Friday': 'Vendredi',
        'Saturday': 'Samedi',
        'Sunday': 'Dimanche'
    };

    const tableau = histData.weekdays.map((day, index) => ({
        jour: joursFr[day] || day,
        jourEn: day,
        moyenne: Math.round(histData.averages[index] * 10) / 10
    }));

    console.log('✅ transformWeekdayHist: Tableau généré avec', tableau.length, 'jours');
    return tableau;
};

/**
 * API: /api/analytics/peaks_troughs
 * Transforme les données de pics et creux en tableau simple
 * @param {Object} peaksData - { timestamps, values, peaks: [{timestamp, value, prominence}], troughs: [...] }
 * @returns {Object} {
 *   serie: [{ timestamp, date, heure, consommation }, ...],
 *   pics: [{ timestamp, date, heure, consommation, proeminence }, ...],
 *   creux: [{ timestamp, date, heure, consommation, proeminence }, ...]
 * }
 */
export const transformPeaksTroughs = (peaksData) => {
    if (!peaksData) {
        console.warn('⚠️ transformPeaksTroughs: Données invalides');
        return null;
    }

    console.log('📊 transformPeaksTroughs: Transformation...', peaksData);

    const result = {
        serie: [],
        pics: [],
        creux: []
    };

    // Adaptateur: gérer {time_index, y} ET {timestamps, values}
    const timestamps = peaksData.timestamps || peaksData.time_index;
    const values = peaksData.values || peaksData.y;

    // Série complète
    if (timestamps && values) {
        result.serie = timestamps.map((timestamp, index) => ({
            timestamp: timestamp,
            date: new Date(timestamp).toLocaleDateString('fr-FR'),
            heure: new Date(timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            consommation: Math.round(values[index] * 10) / 10
        }));
    }

    // Pics (max locaux)
    if (peaksData.peaks && Array.isArray(peaksData.peaks)) {
        result.pics = peaksData.peaks.map(peak => ({
            timestamp: peak.timestamp,
            date: new Date(peak.timestamp).toLocaleDateString('fr-FR'),
            heure: new Date(peak.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            consommation: Math.round(peak.value * 10) / 10,
            proeminence: peak.prominence ? Math.round(peak.prominence * 10) / 10 : null
        }));
    }

    // Creux (min locaux)
    if (peaksData.troughs && Array.isArray(peaksData.troughs)) {
        result.creux = peaksData.troughs.map(trough => ({
            timestamp: trough.timestamp,
            date: new Date(trough.timestamp).toLocaleDateString('fr-FR'),
            heure: new Date(trough.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            consommation: Math.round(trough.value * 10) / 10,
            proeminence: trough.prominence ? Math.round(trough.prominence * 10) / 10 : null
        }));
    }

    console.log('✅ transformPeaksTroughs: Tableau généré', {
        nbPoints: result.serie.length,
        nbPics: result.pics.length,
        nbCreux: result.creux.length
    });

    return result;
};

/**
 * API: /api/series
 * Transforme les données de série temporelle en tableau simple
 * @param {Object} seriesData - { timestamps: [], values: [] }
 * @param {String} resample - Intervalle ('30min', 'H', 'D', 'W', 'W-MON', 'M')
 * @returns {Array} [{ periode, timestamp, date, consommation }, ...]
 */
export const transformSeriesData = (seriesData, resample = 'D') => {
    console.log('🔄 ===== DEBUT transformSeriesData =====');
    console.log('🔄 Paramètres reçus:');
    console.log('  - seriesData:', seriesData);
    console.log('  - resample:', resample);
    console.log('  - Type de seriesData:', typeof seriesData);

    if (!seriesData) {
        console.error('❌ transformSeriesData: seriesData est null/undefined');
        return [];
    }

    console.log('🔄 Vérification de la structure...');

    // 🆕 ADAPTATEUR: Le backend renvoie {time_index, y} au lieu de {timestamps, values}
    // On va adapter les deux formats
    let timestamps, values;

    if (seriesData.time_index && seriesData.y) {
        console.log('✅ Format backend détecté: {time_index, y}');
        console.log('🔄 Adaptation en cours...');
        timestamps = seriesData.time_index;
        values = seriesData.y;
        console.log('✅ Adaptation réussie');
    } else if (seriesData.timestamps && seriesData.values) {
        console.log('✅ Format standard détecté: {timestamps, values}');
        timestamps = seriesData.timestamps;
        values = seriesData.values;
    } else {
        console.error('❌ transformSeriesData: Format de données non reconnu');
        console.error('  - Clés disponibles:', Object.keys(seriesData));
        console.error('  - Format attendu: {time_index, y} OU {timestamps, values}');
        return [];
    }

    if (!timestamps || !values) {
        console.error('❌ transformSeriesData: timestamps ou values manquant après adaptation');
        console.error('  - timestamps:', timestamps);
        console.error('  - values:', values);
        return [];
    }

    console.log('✅ Structure valide après adaptation');
    console.log('📊 Nombre de timestamps:', timestamps.length);
    console.log('📊 Nombre de values:', values.length);
    console.log('📊 Premier timestamp:', timestamps[0]);
    console.log('📊 Première value:', values[0]);
    console.log('📊 Intervalle (resample):', resample);

    const tableau = timestamps.map((timestamp, index) => {
        const date = new Date(timestamp);
        let periodeFormatee = '';

        // Formater la période selon l'intervalle choisi
        switch (resample) {
            case '30min':
                // Format: "JJ/MM/AAAA HH:MM"
                periodeFormatee = date.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                break;

            case 'H':
                // Format: "JJ/MM/AAAA HH:00"
                periodeFormatee = date.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit'
                }) + ':00';
                break;

            case 'D':
                // Format: "JJ/MM/AAAA"
                periodeFormatee = date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                break;

            case 'W':
            case 'W-MON':
                // Format: "Semaine du JJ/MM/AAAA"
                periodeFormatee = 'Semaine du ' + date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                break;

            case 'M':
                // Format: "Mois MM/AAAA"
                periodeFormatee = date.toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                });
                break;

            default:
                periodeFormatee = date.toLocaleDateString('fr-FR');
        }

        return {
            periode: periodeFormatee,
            timestamp: timestamp,
            date: date.toLocaleDateString('fr-FR'),
            consommation: Math.round(values[index] * 10) / 10
        };
    });

    console.log('✅ Transformation terminée');
    console.log('📋 Tableau généré avec', tableau.length, 'lignes');
    if (tableau.length > 0) {
        console.log('📋 Premier élément du tableau:', tableau[0]);
        console.log('📋 Structure:', Object.keys(tableau[0]));
    }
    console.log('🔄 ===== FIN transformSeriesData =====');

    return tableau;
};

// ============================================
// UTILITAIRES
// ============================================

/**
 * Calcule les statistiques sur un ensemble de valeurs
 * @param {Array} values - Tableau de valeurs numériques
 * @returns {Object} { moyenne, ecartType, picMax, picMin }
 */
export const calculateStatistics = (values) => {
    if (!values || values.length === 0) {
        return { moyenne: 0, ecartType: 0, picMax: 0, picMin: 0 };
    }

    const moyenne = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - moyenne, 2), 0) / values.length;
    const ecartType = Math.sqrt(variance);
    const picMax = Math.max(...values);
    const picMin = Math.min(...values);

    return {
        moyenne: Math.round(moyenne * 10) / 10,
        ecartType: Math.round(ecartType * 10) / 10,
        picMax: Math.round(picMax * 10) / 10,
        picMin: Math.round(picMin * 10) / 10
    };
};

/**
 * Formate une date pour l'affichage
 * @param {String|Date} date - Date à formater
 * @param {String} format - Type de format ('short', 'time', 'long')
 * @returns {String} Date formatée
 */
export const formatDate = (date, format = 'long') => {
    const d = new Date(date);

    if (format === 'short') {
        return d.toLocaleDateString('fr-FR');
    }

    if (format === 'time') {
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// ============================================
// CONFIGURATION PLOTLY (à utiliser dans le frontend)
// ============================================

/**
 * Configuration de layout Plotly réutilisable
 * @param {String} title - Titre du graphique
 * @param {String} xAxisTitle - Titre de l'axe X
 * @param {String} yAxisTitle - Titre de l'axe Y
 * @returns {Object} Configuration Plotly
 */
export const getPlotlyLayout = (title, xAxisTitle = '', yAxisTitle = 'Consommation (MW)') => {
    return {
        title: {
            text: title,
            font: { color: 'white', size: 18, family: 'Poppins' }
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: 'white', family: 'Poppins' },
        xaxis: {
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.2)',
            title: xAxisTitle,
            titlefont: { size: 14 }
        },
        yaxis: {
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.2)',
            title: yAxisTitle,
            titlefont: { size: 14 }
        },
        legend: {
            orientation: 'h',
            y: -0.15,
            x: 0.5,
            xanchor: 'center',
            font: { color: 'white', size: 12 }
        },
        margin: { t: 60, r: 40, b: 80, l: 80 },
        showlegend: true,
        hovermode: 'closest'
    };
};

/**
 * Couleurs réutilisables pour les graphiques
 */
export const CHART_COLORS = {
    primary: '#E9FA00',      // Jaune (secondary dans votre thème)
    blue: '#60A5FA',         // Bleu
    red: '#FF6B6B',          // Rouge
    turquoise: '#4ECDC4',    // Turquoise
    cyan: '#45B7D1',         // Cyan
    dark: '#1e3a8a'          // Bleu foncé (tertiary)
};
