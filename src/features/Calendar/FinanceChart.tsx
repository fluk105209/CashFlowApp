import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface DataPoint {
    date: string;
    income: number;
    expense: number;
    net: number;
    label: string;
}

interface FinanceChartProps {
    data: DataPoint[];
}

export function FinanceChart({ data }: FinanceChartProps) {

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold mb-1">{label}</p>
                    <p className="text-emerald-600">
                        Income: +{payload[0].value.toLocaleString()}
                    </p>
                    <p className="text-rose-600">
                        Expense: -{payload[1].value.toLocaleString()}
                    </p>
                    <div className="mt-1 pt-1 border-t flex justify-between gap-4 font-bold">
                        <span>Net:</span>
                        <span className={payload[2].value >= 0 ? "text-blue-600" : "text-orange-600"}>
                            {payload[2].value.toLocaleString()}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10b981" // emerald-500
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="expense"
                        name="Expense"
                        stroke="#f43f5e" // rose-500
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="net"
                        name="Net"
                        stroke="#2563eb" // blue-600
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
