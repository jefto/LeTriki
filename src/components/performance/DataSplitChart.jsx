import React from 'react';
import Plot from 'react-plotly.js';
import { MdPieChart } from 'react-icons/md';

export default function DataSplitChart({ metricsData }) {
    if (!metricsData) return null;

    const getDataSplitChart = () => [{
        values: [metricsData.n_train, metricsData.n_val, metricsData.n_test],
        labels: ['Entraînement', 'Validation', 'Test'],
        type: 'pie',
        hole: 0.5,
        marker: {
            colors: ['#E3001B', '#FDB913', '#10B981'],
            line: { color: '#ffffff', width: 2 }
        },
        textinfo: 'label+percent',
        textposition: 'outside',
        hovertemplate: '<b>%{label}</b><br>%{value:,} échantillons<br>(%{percent})<extra></extra>',
        textfont: { family: 'Poppins', size: 12 }
    }];

    const total = metricsData.n_train + metricsData.n_val + metricsData.n_test;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-[#E3001B] text-2xl">
                    <MdPieChart />
                </div>
                <h3 className="text-gray-900 font-bold text-xl font-poppins">Répartition des Données</h3>
            </div>

            <div className="mb-4">
                <p className="text-gray-500 text-sm mb-2">
                    Date de split : <span className="font-semibold text-gray-700">{metricsData.split_date || '--'}</span>
                </p>
            </div>

            {/* Graphique Pie */}
            <div className="w-full h-[350px]">
                <Plot
                    data={getDataSplitChart()}
                    layout={{
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        font: { family: 'Poppins', color: '#1F2937' },
                        showlegend: true,
                        legend: {
                            orientation: 'h',
                            y: -0.1,
                            x: 0.5,
                            xanchor: 'center',
                            font: { size: 12 }
                        },
                        margin: { t: 20, r: 20, b: 60, l: 20 },
                        annotations: [{
                            text: `<b>${total.toLocaleString()}</b><br>Total`,
                            showarrow: false,
                            font: { size: 14, family: 'Poppins' }
                        }],
                        autosize: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler={true}
                />
            </div>

            {/* Légende détaillée */}
            <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-red-50 p-3 rounded-xl text-center">
                    <p className="text-[#E3001B] font-bold text-lg">{metricsData.n_train?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">Entraînement</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl text-center">
                    <p className="text-[#FDB913] font-bold text-lg">{metricsData.n_val?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">Validation</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl text-center">
                    <p className="text-green-600 font-bold text-lg">{metricsData.n_test?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">Test</p>
                </div>
            </div>
        </div>
    );
}

