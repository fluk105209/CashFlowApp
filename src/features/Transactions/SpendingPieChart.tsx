import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { useTranslation } from 'react-i18next'
import { parseISO, getMonth, getYear } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HelpCircle, Banknote } from 'lucide-react'
import { getCategoryMetadata } from '@/constants/categories'

interface SpendingPieChartProps {
    selectedMonth: string;
    selectedYear: string;
    showIncome?: boolean;
}

export function SpendingPieChart({ selectedMonth, selectedYear, showIncome = false }: SpendingPieChartProps) {
    const { t } = useTranslation()
    const { spendings, incomes, categoryColors } = useFinanceStore()

    const { chartData } = useMemo(() => {
        const filteredSpendings = spendings.filter(s => {
            const date = parseISO(s.date)
            const matchesMonth = selectedMonth === 'all' || getMonth(date).toString() === selectedMonth
            const matchesYear = getYear(date).toString() === selectedYear
            return matchesMonth && matchesYear
        })

        const categoryTotals: Record<string, { amount: number; type: 'income' | 'spending' | 'obligation'; key: string }> = {}
        let total = 0

        filteredSpendings.forEach(s => {
            const categoryKey = s.category // Keeping original case for matching
            const categoryLabel = t(`categories.${s.category}`, { defaultValue: s.category })
            if (!categoryTotals[categoryLabel]) {
                categoryTotals[categoryLabel] = { amount: 0, type: s.kind === 'obligation-payment' ? 'obligation' : 'spending', key: categoryKey }
            }
            categoryTotals[categoryLabel].amount += s.amount
            total += s.amount
        })

        if (showIncome) {
            const filteredIncomes = incomes.filter(i => {
                const date = parseISO(i.date)
                const matchesMonth = selectedMonth === 'all' || getMonth(date).toString() === selectedMonth
                const matchesYear = getYear(date).toString() === selectedYear
                return matchesMonth && matchesYear
            })

            filteredIncomes.forEach(i => {
                const categoryKey = i.category
                const categoryLabel = t(`categories.${i.category}`, { defaultValue: i.category })
                if (!categoryTotals[categoryLabel]) {
                    categoryTotals[categoryLabel] = { amount: 0, type: 'income', key: categoryKey }
                }
                categoryTotals[categoryLabel].amount += i.amount
                total += i.amount
            })
        }

        const data = Object.entries(categoryTotals)
            .map(([name, data]) => ({
                name,
                value: data.amount,
                type: data.type,
                key: data.key,
                color: categoryColors[data.key] || '#94a3b8',
                percentage: total > 0 ? ((data.amount / total) * 100).toFixed(1) : "0"
            }))
            .sort((a, b) => b.value - a.value)

        return { chartData: data }
    }, [spendings, incomes, selectedMonth, selectedYear, showIncome, t, categoryColors])

    const isEmpty = chartData.length === 0

    return (
        <Card className="shadow-sm border-none bg-muted/20">
            <CardHeader className="pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-primary" />
                        {t('dashboard.spending_by_category')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {selectedMonth === 'all'
                            ? t('transactions.all_months') + ` ${selectedYear}`
                            : `${t(`months.${selectedMonth}`)} ${selectedYear}`}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[340px] w-full">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-background/50 rounded-2xl border-2 border-dashed">
                            <p className="text-sm">{t('common.no_data')}</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="40%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1000}
                                    label={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke="hsl(var(--background))"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                    formatter={(value: any, name: any, item: any) => [
                                        `฿ ${Number(value || 0).toLocaleString()} (${item.payload.percentage}%)`,
                                        name || ''
                                    ]}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                        backgroundColor: 'hsl(var(--card))',
                                        padding: '12px'
                                    }}
                                    itemStyle={{
                                        color: 'hsl(var(--card-foreground))',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '11px', width: '100%' }}
                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                    content={(props: any) => {
                                        const { payload } = props;
                                        return (
                                            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {payload?.map((entry: any, index: number) => {
                                                    const metadata = getCategoryMetadata(entry.payload.key);
                                                    const Icon = metadata?.icon || HelpCircle;
                                                    return (
                                                        <li key={`item-${index}`} className="flex items-center gap-1.5 min-w-[100px]">
                                                            <div
                                                                className="w-2.5 h-2.5 rounded-full"
                                                                style={{ backgroundColor: entry.color }}
                                                            />
                                                            <Icon className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                                                {entry.value}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-foreground">
                                                                {entry.payload.percentage}%
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
