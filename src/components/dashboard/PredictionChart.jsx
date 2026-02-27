import React from 'react';
import Plot from 'react-plotly.js';
import { FaBrain } from 'react-icons/fa';
import { ChartCard, LoadingSpinner } from '../common';
import { getPlotlyLayout } from '../../utils/dataTransformers';

export default function PredictionChart({ data }) {
    return (
        <ChartCard
            title="Prevision de la consommation des prochains 24h"
            icon={<FaBrain />}
        >
            {data ? (
                <div className="w-full h-[500px]">
                    <Plot
                        data={data}
                        layout={{
                            ...getPlotlyLayout('', 'Heure (24h)', 'Consommation (MW)'),
                            margin: { t: 30, r: 40, b: 130, l: 100 },
                            legend: { orientation: 'h', y: -0.4, x: 0.5, xanchor: 'center' },
                            autosize: true,
                            xaxis: {
                                title: {
                                    text: 'Heure (24h)',
                                    font: { size: 14, weight: 'bold', color: '#374151' },
                                    standoff: 40
                                },
                                type: 'category',
                                tickangle: 0,
                                showline: false,
                                showgrid: false
                            },
                            yaxis: {
                                title: {
                                    text: 'Consommation (MW)',
                                    font: { size: 14, weight: 'bold', color: '#374151' },
                                    standoff: 40
                                },
                                showline: false,
                                showgrid: true,
                                gridcolor: '#E5E7EB'
                            }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler={true}
                    />
                </div>
            ) : (
                <LoadingSpinner size="md" className="h-[350px]" />
            )}
        </ChartCard>
    );
}

