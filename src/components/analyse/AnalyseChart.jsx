import React from 'react';
import Plot from 'react-plotly.js';
import { FaFileImage, FaFileCsv, FaFileExcel, FaSpinner } from 'react-icons/fa';
import { MdShowChart } from 'react-icons/md';
import { ChartCard } from '../common';

export default function AnalyseChart({
    plotlyRef,
    visualization,
    chartType,
    peaksTroughsLoading,
    peaksData,
    troughsData,
    onExportPNG,
    onExportCSV,
    onExportExcel
}) {
    if (!visualization) return null;

    return (
        <ChartCard title={visualization.title} icon={<MdShowChart />}>
            {/* Boutons d'export */}
            <div className="flex justify-end items-center gap-2 mb-4">
                <button
                    onClick={onExportPNG}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                >
                    <FaFileImage /> PNG
                </button>
                <button
                    onClick={onExportCSV}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200 text-sm"
                >
                    <FaFileCsv /> CSV
                </button>
                <button
                    onClick={onExportExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                >
                    <FaFileExcel /> Excel
                </button>
            </div>

            {/* Indicateur de statut peaks/troughs (uniquement pour Line Chart) */}
            {chartType === 'line' && (
                <div className="flex items-center gap-4 text-sm mb-4 justify-end">
                    {peaksTroughsLoading && (
                        <span className="flex items-center gap-2 text-gray-500">
                            <FaSpinner className="animate-spin" />
                            Chargement pics/creux...
                        </span>
                    )}
                    {peaksData && peaksData.length > 0 && (
                        <span className="flex items-center gap-2 text-[#E3001B]">
                            <span className="w-3 h-3 bg-[#E3001B] rounded-full"></span>
                            {peaksData.length} pic{peaksData.length > 1 ? 's' : ''}
                        </span>
                    )}
                    {troughsData && troughsData.length > 0 && (
                        <span className="flex items-center gap-2 text-[#FDB913]">
                            <span className="w-3 h-3 bg-[#FDB913] rounded-full"></span>
                            {troughsData.length} creux
                        </span>
                    )}
                </div>
            )}

            {/* Graphique Plotly */}
            <div className="w-full h-[500px]">
                <Plot
                    ref={plotlyRef}
                    data={visualization.data}
                    layout={{
                        ...visualization.layout,
                        margin: { t: 40, r: 50, b: 80, l: 80 },
                        autosize: true,
                        showlegend: true,
                        legend: {
                            orientation: 'h',
                            yanchor: 'bottom',
                            y: 1.02,
                            xanchor: 'right',
                            x: 1
                        }
                    }}
                    style={{ width: '100%', height: '100%' }}
                    config={{
                        displayModeBar: true,
                        responsive: true,
                        toImageButtonOptions: {
                            format: 'png',
                            filename: 'analyse_historique',
                            height: 500,
                            width: 800,
                            scale: 1
                        }
                    }}
                    useResizeHandler={true}
                />
            </div>
        </ChartCard>
    );
}

