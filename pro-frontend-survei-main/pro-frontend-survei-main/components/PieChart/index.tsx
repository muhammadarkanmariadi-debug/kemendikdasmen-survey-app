'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

type Props = {
    datasets: { name: string, value: number }[]
}
// const COLORS = ['#1E77BD', '#CCCCCC',];
const COLORS = [
    '#FF6633', '#FF33FF', '#00B3E6', '#E6B333',
    '#3366E6', '#99FF99', '#B34D4D', '#80B300', '#809900',
    '#6680B3', '#66991A', '#FF99E6', '#CCFF1A', '#FF1A66',
    '#E6331A', '#33FFCC', '#FF6600', '#FF0066', '#66FF33', '#FFFF99'
];

export default function PieCharts({ datasets }: Props) {
    const total = datasets.reduce((acc, item) => acc + item.value, 0);
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={datasets}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                >
                    {datasets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number, name: string) => [
                        `${value} (${((value / total) * 100).toFixed(1)}%)`,
                        name,
                    ]}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}
