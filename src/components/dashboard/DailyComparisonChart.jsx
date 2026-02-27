import React from 'react';
import Plot from 'react-plotly.js';
import { MdShowChart } from 'react-icons/md';
import { ChartCard, LoadingSpinner } from '../common';
import { getPlotlyLayout } from '../../utils/dataTransformers';

export default function DailyComparisonChart({ data }) {
    return (
        <ChartCard
            title="Compraison de la consommation du jour precedent et du jour en cours"
            icon={<MdShowChart />}
        >
            {data ? (
                <div className="w-full h-[350px]">
                    <Plot
                        data={data}
                        layout={{
                            ...getPlotlyLayout('', 'Heure', 'Consommation (MW)'),
                            margin: { t: 30, r: 40, b: 100, l: 100 },
                            legend: { orientation: 'h', y: -0.3, x: 0, xanchor: 'left' },
                            autosize: true,
                            xaxis: {
                                title: {
                                    text: 'Heure',
                                    font: { size: 14, weight: 'bold', color: '#374151' },
                                    standoff: 40
                                },
                                type: 'date',
                                tickformat: '%H',
                                tickangle: 0,
                                dtick: 7200000,
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

