import React from 'react';
import Plot from 'react-plotly.js';
import { FaCity } from 'react-icons/fa';
import { ChartCard } from '../common';
import { getPlotlyLayout } from '../../utils/dataTransformers';

// Données Mock pour les villes
const citiesData = [
    { city: 'Lomé', value: 450 },
    { city: 'Kara', value: 120 },
    { city: 'Sokodé', value: 90 },
    { city: 'Atakpamé', value: 60 },
    { city: 'Dapaong', value: 40 }
];

export default function CityDistributionChart() {
    return (
        <ChartCard
            title="Repartition de laconsommation totale par ville"
            icon={<FaCity />}
        >
            <div className="w-full h-[350px]">
                <Plot
                    data={[{
                        values: citiesData.map(c => c.value),
                        labels: citiesData.map(c => c.city),
                        type: 'pie',
                        hole: 0.6,
                        marker: {
                            colors: ['#E3001B', '#FDB913', '#FF6B35', '#8B0000', '#F59E0B']
                        },
                        textinfo: 'label+percent',
                        hoverinfo: 'label+value+percent'
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
        </ChartCard>
    );
}

