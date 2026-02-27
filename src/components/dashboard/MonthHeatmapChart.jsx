import React from 'react';
import Plot from 'react-plotly.js';
import { MdBarChart } from 'react-icons/md';
import { ChartCard, LoadingSpinner } from '../common';
import { getPlotlyLayout } from '../../utils/dataTransformers';

export default function MonthHeatmapChart({ data }) {
    return (
        <ChartCard
            title="Consomation totale par heure en un mois"
            icon={<MdBarChart />}
        >
            {data ? (
                <div className="w-full h-[600px]">
                    <Plot
                        data={data}
                        layout={{
                            ...getPlotlyLayout('', 'jours du mois', 'Heures'),
                            margin: { t: 30, r: 50, b: 80, l: 80 },
                            xaxis: {
                                title: { text: 'Jours du mois', font: { size: 14, weight: 'bold' } },
                                tickangle: 0,
                                dtick: 1,
                                showline: false,
                                showgrid: false
                            },
                            yaxis: {
                                title: { text: 'Heures', font: { size: 14, weight: 'bold' } },
                                tickmode: 'linear',
                                dtick: 1,
                                showline: false,
                                showgrid: false
                            }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler={true}
                    />
                </div>
            ) : (
                <LoadingSpinner size="md" className="h-[400px]" />
            )}
        </ChartCard>
    );
}

