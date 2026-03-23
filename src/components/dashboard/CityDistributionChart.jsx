import React from 'react';
import Plot from 'react-plotly.js';
import { FaCity, FaSpinner } from 'react-icons/fa';
import { ChartCard } from '../common';
import { getPlotlyLayout } from '../../utils/dataTransformers';

const CHART_COLORS = [
    '#E3001B', '#FDB913', '#FF6B35', '#8B0000', '#F59E0B',
    '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'
];

export default function CityDistributionChart({ data, loading }) {
    const isEmpty = !data || data.length === 0;

    return (
        <ChartCard
            title="Répartition de la consommation par localité"
            icon={<FaCity />}
        >
            {loading && (
                <div className="flex items-center justify-center h-[350px] text-gray-400 gap-3">
                    <FaSpinner className="animate-spin text-2xl" />
                    <span>Chargement des données...</span>
                </div>
            )}

            {!loading && isEmpty && (
                <div className="flex items-center justify-center h-[350px] text-gray-400">
                    <span>Données de répartition indisponibles</span>
                </div>
            )}

            {!loading && !isEmpty && (
                <div className="w-full h-[350px]">
                    <Plot
                        data={[{
                            values: data.map(c => c.value),
                            labels: data.map(c => c.city),
                            type: 'pie',
                            hole: 0.6,
                            marker: {
                                colors: CHART_COLORS.slice(0, data.length)
                            },
                            textinfo: 'label+percent',
                            hoverinfo: 'label+value+percent',
                            hovertemplate: '<b>%{label}</b><br>%{value:.0f} MW·total<br>%{percent}<extra></extra>'
                        }]}
                        layout={{
                            ...getPlotlyLayout('', '', ''),
                            margin: { t: 20, r: 20, b: 20, l: 20 },
                            showlegend: true,
                            legend: { orientation: 'v', x: 1, y: 0.5 }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler={true}
                    />
                </div>
            )}
        </ChartCard>
    );
}
