import React from 'react';
import Plot from 'react-plotly.js';
import { FaCalendarAlt } from 'react-icons/fa';
import { ChartCard, LoadingSpinner } from '../common';
import { getPlotlyLayout } from '../../utils/dataTransformers';

export default function WeeklyConsumptionChart({ data }) {
    return (
        <ChartCard
            title="Consommation total par Jour de la Semaine"
            icon={<FaCalendarAlt />}
        >
            {data ? (
                <div className="w-full h-[350px]">
                    <Plot
                        data={data}
                        layout={{
                            ...getPlotlyLayout('', 'Jour de la semaine', 'Consommation (MW)'),
                            margin: { t: 30, r: 40, b: 100, l: 100 },
                            autosize: true,
                            showlegend: false,
                            xaxis: {
                                title: {
                                    text: 'Jour de la semaine',
                                    font: { size: 14, weight: 'bold', color: '#374151' },
                                    standoff: 40
                                },
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

