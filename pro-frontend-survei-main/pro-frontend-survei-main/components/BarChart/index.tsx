'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from 'recharts'
type Props = {
    datasets: { name: string, value: number }[],
    height: number
}
export default function HorizontalBarChart({ datasets, height }: Props) {
    const total = datasets.reduce((acc, item) => acc + item.value, 0);
    const renderCustomLabel = (props: any) => {
        const { x, y, width, height, value } = props;
        const percent = ((value / total) * 100).toFixed(1);
        return (
            <text
                x={x + width + 5}
                y={y + height / 2}
                dy={4}
                fontSize={12}
                fill="#555"
            >
                {value} ({percent}%)
            </text>
        );
    };
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                layout="vertical" // 👈 This makes it horizontal
                data={datasets}
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }}
                    width={300} />
                <Tooltip formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Value']} />
                <Bar dataKey="value" fill="#1E77BD">
                    <LabelList dataKey="value" content={renderCustomLabel} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
