import React from 'react';
import Plot from 'react-plotly.js';
import { FaSpinner, FaChartLine, FaFileImage, FaFileCsv, FaFileExcel } from 'react-icons/fa';
import { MdShowChart } from 'react-icons/md';
import { ChartCard } from '../common';

export default function PrevisionChart({
    plotlyRef,
    loading,
    predictionData,
    onExportPNG,
    onExportCSV,
    onExportExcel
}) {
    return (
        <ChartCard
            title={predictionData
                ? `Prévision de consommation - ${predictionData.horizonHours || 24}h`
                : "Prévision de consommation"
            }
            icon={<MdShowChart />}
        >
            {/* Actions Header */}
            {predictionData && (
                <div className="flex items-center gap-2 justify-end mb-4">
                    <button
                        onClick={onExportPNG}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                    >
                        <FaFileImage />
                        PNG
                    </button>
                    <button
                        onClick={onExportCSV}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                    >
                        <FaFileCsv />
                        CSV
                    </button>
                    <button
                        onClick={onExportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                    >
                        <FaFileExcel />
                        Excel
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-[400px] w-full">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-[#E3001B] text-6xl mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Calcul des prévisions en cours...</p>
                        <p className="text-gray-400 text-sm mt-2">Cela peut prendre quelques secondes</p>
                    </div>
                </div>
            ) : predictionData ? (
                <div className="w-full h-[400px]">
                    <Plot
                        ref={plotlyRef}
                        data={[
                            {
                                x: predictionData.x,
                                y: predictionData.y,
                                type: 'scatter',
                                mode: 'lines+markers',
                                name: 'Prévision',
                                line: {
                                    color: '#FDB913',
                                    width: 4,
                                    shape: 'spline'
                                },
                                marker: {
                                    color: '#FDB913',
                                    size: 8,
                                    line: { color: '#fff', width: 2 }
                                },
                                hovertemplate: '<b>%{x}</b><br>Prévision: %{y:.2f} kWh<extra></extra>'
                            }
                        ]}
                        layout={{
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#1F2937', family: 'Poppins' },
                            xaxis: {
                                type: 'category',
                                gridcolor: '#E5E7EB',
                                zerolinecolor: '#D1D5DB',
                                title: { text: 'heures (H)', font: { size: 14 } },
                                tickfont: { color: '#6B7280', size: 11 },
                                tickangle: 0
                            },
                            yaxis: {
                                gridcolor: '#E5E7EB',
                                zerolinecolor: '#D1D5DB',
                                title: { text: 'Consommation (kWh)', font: { size: 14 } },
                                tickfont: { color: '#6B7280' }
                            },
                            legend: {
                                orientation: 'h',
                                y: -0.25,
                                x: 0.5,
                                xanchor: 'center',
                                font: { color: '#1F2937', size: 12 }
                            },
                            margin: { t: 20, r: 40, b: 100, l: 80 },
                            showlegend: true,
                            hovermode: 'x unified',
                            autosize: true
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{
                            displayModeBar: true,
                            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                            displaylogo: false,
                            responsive: true
                        }}
                        useResizeHandler={true}
                    />
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center h-[400px] w-full text-center">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <FaChartLine className="text-gray-400 text-5xl" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">Aucune prévision générée</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Configurez les paramètres et cliquez sur "Lancer la prévision"
                    </p>
                </div>
            )}
        </ChartCard>
    );
}

