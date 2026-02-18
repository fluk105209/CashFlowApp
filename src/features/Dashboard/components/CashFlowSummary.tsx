
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { formatCurrency } from "@/utils/formatUtils"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, parseISO } from "date-fns"

import type { Income, Spending } from "@/types"

export function CashFlowSummary() {
    const { t } = useTranslation()
    const { incomes, spendings, currency, isAmountHidden } = useFinanceStore()

    // Process Data for Chart (Last 6 Months)
    const chartData = useMemo(() => {
        const today = new Date()
        const start = subMonths(startOfMonth(today), 5)
        const end = endOfMonth(today)

        const months = eachMonthOfInterval({ start, end })

        return months.map((month: Date) => {
            const monthValid = (dateStr: string) => isSameMonth(parseISO(dateStr.split('T')[0]), month)

            const inc = incomes.filter((i: Income) => monthValid(i.date)).reduce((sum: number, i: Income) => sum + i.amount, 0)
            const exp = spendings.filter((s: Spending) => monthValid(s.date)).reduce((sum: number, s: Spending) => sum + s.amount, 0)

            return {
                name: format(month, 'MMM'),
                income: inc,
                expense: exp,
                net: inc - exp
            }
        })
    }, [incomes, spendings])

    // Current Month Stats
    const currentMonthStats = useMemo(() => {
        const currentData = chartData[chartData.length - 1] || { income: 0, expense: 0 }
        return currentData
    }, [chartData])

    const incomeColor = "#10b981" // Emerald
    const expenseColor = "#f43f5e" // Rose

    return (
        <Card className="border-border/40 bg-card/50 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.cash_flow', { defaultValue: 'Cash Flow' })}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>6 Months</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            {t('dashboard.income')}
                        </p>
                        <p className="text-lg font-bold text-emerald-500">
                            {formatCurrency(currentMonthStats.income, currency, isAmountHidden)}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <ArrowDownRight className="w-3 h-3 text-rose-500" />
                            {t('dashboard.expenses', { defaultValue: 'Expenses' })}
                        </p>
                        <p className="text-lg font-bold text-rose-500">
                            {formatCurrency(currentMonthStats.expense, currency, isAmountHidden)}
                        </p>
                    </div>
                </div>

                <div className="h-[180px] w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={incomeColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={incomeColor} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={expenseColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={expenseColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                                itemStyle={{ padding: 0 }}
                                formatter={(value: any) => (isAmountHidden ? '****' : Number(value).toLocaleString())}
                                labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke={incomeColor}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke={expenseColor}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
