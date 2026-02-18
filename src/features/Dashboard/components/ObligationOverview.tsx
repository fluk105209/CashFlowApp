
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { formatCurrency } from "@/utils/formatUtils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock } from "lucide-react"

import type { Obligation } from "@/types"

export function ObligationOverview() {
    const { t } = useTranslation()
    const { obligations, currency, isAmountHidden } = useFinanceStore()

    // Process Data for Donut Chart
    const chartData = useMemo(() => {
        const categories = {
            'Installment': 0,
            'Debt': 0
        }

        obligations.forEach((o: Obligation) => {
            if (o.type === 'installment') {
                categories['Installment'] += Number(o.balance) || 0
            } else {
                categories['Debt'] += Number(o.balance) || 0
            }
        })

        return [
            { name: 'Installment', value: categories['Installment'], color: '#3b82f6' }, // Blue
            { name: 'Debt', value: categories['Debt'], color: '#f59e0b' }, // Amber
        ].filter(item => item.value > 0)
    }, [obligations])

    // Calculate Total Monthly Payment
    const totalMonthlyPayment = obligations.reduce((sum: number, o: Obligation) => sum + (Number(o.amount) || 0), 0)

    const totalDebt = obligations.reduce((sum: number, o: Obligation) => sum + (Number(o.balance) || 0), 0)

    if (obligations.length === 0) {
        return (
            <Card className="border-border/40 bg-card/50 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('obligations.title')}</CardTitle>
                </CardHeader>
                <CardContent className="h-[150px] flex flex-col items-center justify-center text-muted-foreground text-xs">
                    <p>{t('common.no_data', { defaultValue: 'No obligations yet' })}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full border-border/40 bg-card shadow-sm rounded-[1.5rem]">
            <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {t('obligations.title')}
                    <span className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                        {obligations.length} items
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    {/* Donut Chart with improved sizing */}
                    <div className="h-[120px] w-[120px] shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={38}
                                    outerRadius={55}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => (isAmountHidden ? '****' : formatCurrency(value, currency, false))}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: 'none', fontSize: '10px' }}
                                    itemStyle={{ padding: 0 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Total</span>
                                <span className="font-black text-foreground text-sm tracking-tight">
                                    {isAmountHidden ? '****' : (totalDebt / 1000).toFixed(1) + 'k'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details - Expanded Area */}
                    <div className="flex-1 w-full space-y-4">
                        {/* Legend */}
                        <div className="flex gap-3 flex-wrap">
                            {chartData.map(item => (
                                <div key={item.name} className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-md">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] text-muted-foreground font-medium">{item.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Upcoming Payment Highlight */}
                        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] uppercase text-primary font-bold tracking-wider">
                                    {t('obligations.total_upcoming', { defaultValue: 'Total Upcoming' })}
                                </p>

                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-background/80 p-2 rounded-lg text-primary shadow-sm shrink-0">
                                    <CalendarClock className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold truncate text-foreground leading-tight">
                                        {isAmountHidden ? '****' : formatCurrency(totalMonthlyPayment, currency)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {t('obligations.per_month', { defaultValue: 'Per Month' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
