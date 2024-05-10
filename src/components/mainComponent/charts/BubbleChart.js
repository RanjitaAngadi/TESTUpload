import React from 'react'
import Chart from 'react-apexcharts'

const PumpStatusWiseChart = ({ pumpProcessChartData }) => {

    const mainData = {
        series: pumpProcessChartData?.series,
        options: {
            colors: ['#4576b5', '#b84644', '#006622', '#e68a00', '#282828'],
            chart: {
                height: 350,
                type: 'bubble',
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: false
                },
            },
            fill: {
                opacity: 0.8,
                type: 'gradient',
            },
            title: {
                text: 'Inspection Status - Open',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: undefined,
                    color: '#111'
                },
            },
            xaxis: {
                labels: {
                    show: true,
                    rotate: -30,
                    rotateAlways: true,
                },
                categories: ['Visual', 'Disassembly', 'Assembly', 'Final 1',
                    'Pressure Wash', 'Truck Removal', 'Level II- Disassembly', "Level II- Assembly",
                    'Air Test 1', 'Performance Test', 'Air Test 2', 'Paint 1', 'Data Tag',
                    'Truck Install', 'Level II- Final',
                ],
                tickPlacement: 'on',
                tickAmount: undefined,
            },
            yaxis: {
                // title: {
                //     text: 'Quantity',
                //     style: {
                //         color: undefined,
                //         fontSize: '10px',
                //         fontFamily: undefined,
                //         fontWeight: undefined,
                //     }
                // },
                max: pumpProcessChartData?.maxValue
            },
            dataLabels: {
                enabled: false
            },
            tooltip: {
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    const name = w.globals.initialSeries[seriesIndex].name
                    const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                    return `
                            <div style="padding:8px;">
                                <b>${name}</b><br/>
                                ${data.x}: ${data.y}                                    
                            </div>
                        `
                }
            },

        }
    }

    return (
        <div id="chart">
            <Chart
                options={mainData?.options}
                series={mainData?.series}
                type="bubble"
                height={350} />
        </div>);
}

export default PumpStatusWiseChart