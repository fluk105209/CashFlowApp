import { useState, useMemo } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday,
    parseISO
} from "date-fns"
import { ChevronLeft, ChevronRight, BarChart3, Calendar as CalendarIcon, LineChart, PieChart as PieChartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DayDetailModal } from "./DayDetailModal"
import { FinanceChart } from "./FinanceChart"
import { SpendingPieChart } from "../Transactions/SpendingPieChart"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { formatCurrency, getCurrencySymbol } from "@/utils/formatUtils"

export function CalendarView() {
    const { t, i18n } = useTranslation()
    const { incomes, spendings, currency, isAmountHidden } = useFinanceStore()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'pie' | 'graph-month' | 'graph-year'>('grid')

    // ... (rest of useMemo hooks remain unchanged)

    // Compute Calendar Grid
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const calendarDays = useMemo(() => {
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [currentDate]) // eslint-disable-line react-hooks/exhaustive-deps

    // Group Data by Date (Memoized)
    const dailyData = useMemo(() => {
        const map = new Map<string, { income: number; expense: number }>()

        incomes.forEach(inc => {
            const dateKey = inc.date.split('T')[0]
            const current = map.get(dateKey) || { income: 0, expense: 0 }
            map.set(dateKey, { ...current, income: current.income + inc.amount })
        })

        spendings.forEach(sp => {
            const dateKey = sp.date.split('T')[0]
            const current = map.get(dateKey) || { income: 0, expense: 0 }
            map.set(dateKey, { ...current, expense: current.expense + sp.amount })
        })

        return map
    }, [incomes, spendings])

    // Monthly Summary
    const monthlySummary = useMemo(() => {
        let income = 0
        let expense = 0

        incomes.forEach(i => {
            const d = parseISO(i.date)
            if (isSameMonth(d, currentDate)) income += i.amount
        })
        spendings.forEach(s => {
            const d = parseISO(s.date)
            if (isSameMonth(d, currentDate)) expense += s.amount
        })

        return { income, expense, net: income - expense }
    }, [incomes, spendings, currentDate])

    // Calculate Previous Balance (Global carryover for Month View)
    const previousBalance = useMemo(() => {
        let income = 0;
        let expense = 0;

        incomes.forEach(i => {
            if (parseISO(i.date) < monthStart) income += i.amount;
        });

        spendings.forEach(s => {
            if (parseISO(s.date) < monthStart) expense += s.amount;
        });

        return income - expense;
    }, [incomes, spendings, monthStart]);

    // Chart Data Construction
    const chartData = useMemo(() => {
        if (viewMode === 'graph-month') {
            // Daily data for current month (Cumulative Net with Carryover)
            const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

            let runningBalance = previousBalance; // Start with historical balance

            return daysInMonth.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const data = dailyData.get(dateKey) || { income: 0, expense: 0 }

                // Update running balance
                runningBalance += (data.income - data.expense);

                return {
                    date: dateKey,
                    label: format(day, 'd'),
                    income: data.income,
                    expense: data.expense,
                    net: runningBalance // Accumulated Balance including history
                }
            })
        } else if (viewMode === 'graph-year') {
            // Monthly data for current year (Annual Net Trends)
            const yearStart = new Date(currentDate.getFullYear(), 0, 1)
            const yearEnd = new Date(currentDate.getFullYear(), 11, 31)
            const months = eachDayOfInterval({ start: yearStart, end: yearEnd })
                .filter(d => d.getDate() === 1) // Get 1st of each month

            // Calculate balance prior to this year
            let runningYearBalance = 0;
            incomes.forEach(i => {
                if (new Date(i.date) < yearStart) runningYearBalance += i.amount;
            });
            spendings.forEach(s => {
                if (new Date(s.date) < yearStart) runningYearBalance += s.amount;
            });

            return months.map(month => {
                let inc = 0
                let exp = 0
                incomes.forEach(i => {
                    if (isSameMonth(new Date(i.date), month)) inc += i.amount
                })
                spendings.forEach(s => {
                    if (isSameMonth(new Date(s.date), month)) exp += s.amount
                })

                runningYearBalance += (inc - exp);

                return {
                    date: format(month, 'yyyy-MM-dd'),
                    label: i18n.language.startsWith('th')
                        ? t(`months.${month.getMonth()}`).substring(0, 3)
                        : format(month, 'MMM'),
                    income: inc,
                    expense: exp,
                    net: runningYearBalance // Cumulative Year Savings and prior history
                }
            })
        }
        return []
    }, [viewMode, currentDate, dailyData, incomes, spendings, monthStart, monthEnd, previousBalance, i18n.language, t])


    // Handlers
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const goToday = () => setCurrentDate(new Date())

    const handleDayClick = (day: Date) => {
        setSelectedDate(day)
    }


    // Modal Data Filtering
    const selectedDateData = useMemo(() => {
        if (!selectedDate) return { incomes: [], spendings: [] }
        const selDateKey = format(selectedDate, 'yyyy-MM-dd')
        return {
            incomes: incomes.filter(i => i.date.split('T')[0] === selDateKey),
            spendings: spendings.filter(s => s.date.split('T')[0] === selDateKey)
        }
    }, [selectedDate, incomes, spendings])

    return (
        <div className="space-y-4 pb-20">
            {/* Header Controls */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {viewMode === 'graph-year'
                            ? i18n.language.startsWith('th')
                                ? (currentDate.getFullYear() + 543).toString()
                                : format(currentDate, 'yyyy')
                            : i18n.language.startsWith('th')
                                ? `${t(`months.${currentDate.getMonth()}`)} ${currentDate.getFullYear() + 543}`
                                : format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={goToday} className="text-xs">
                            {t('common.today')}
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between items-center px-1">
                    {/* View Switcher */}
                    <div className="grid grid-cols-4 bg-muted rounded-xl p-1 text-[10px] w-full gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 font-bold", viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                        >
                            <CalendarIcon className="h-3.5 w-3.5" /> <span>{t('calendar.grid')}</span>
                        </button>
                        <button
                            onClick={() => setViewMode('pie')}
                            className={cn("py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 font-bold", viewMode === 'pie' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                        >
                            <PieChartIcon className="h-3.5 w-3.5" /> <span>{t('common.proportion', { defaultValue: 'Ratio' })}</span>
                        </button>
                        <button
                            onClick={() => setViewMode('graph-month')}
                            className={cn("py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 font-bold", viewMode === 'graph-month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                        >
                            <BarChart3 className="h-3.5 w-3.5" /> <span>{t('calendar.month')}</span>
                        </button>
                        <button
                            onClick={() => setViewMode('graph-year')}
                            className={cn("py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 font-bold", viewMode === 'graph-year' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                        >
                            <LineChart className="h-3.5 w-3.5" /> <span>{t('calendar.year')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Monthly Summary Bar (Show only in Grid or Month Graph) */}
            {(viewMode === 'grid' || viewMode === 'graph-month') && (
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] px-1">
                    <div className="bg-card border p-2 rounded-2xl shadow-sm">
                        <div className="text-muted-foreground mb-1">{t('dashboard.income')}</div>
                        <div className="font-bold text-emerald-600">
                            {formatCurrency(monthlySummary.income, currency, isAmountHidden, { showSymbol: false, signDisplay: 'always' })}
                        </div>
                    </div>
                    <div className="bg-card border p-2 rounded-2xl shadow-sm">
                        <div className="text-muted-foreground mb-1">{t('dashboard.spending')}</div>
                        <div className="font-bold text-rose-600">
                            {formatCurrency(-monthlySummary.expense, currency, isAmountHidden, { showSymbol: false, signDisplay: 'always' })}
                        </div>
                    </div>
                    <div className="bg-card border p-2 rounded-2xl shadow-sm">
                        <div className="text-muted-foreground mb-1">{t('common.net')} ({getCurrencySymbol(currency)})</div>
                        <div className={cn("font-bold", monthlySummary.net >= 0 ? "text-blue-600" : "text-orange-600")}>
                            {formatCurrency(monthlySummary.net, currency, isAmountHidden, { showSymbol: false })}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {viewMode === 'grid' ? (
                <div className="px-1">
                    {/* Calendar Grid Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1">
                        {[
                            t('calendar.sun'),
                            t('calendar.mon'),
                            t('calendar.tue'),
                            t('calendar.wed'),
                            t('calendar.thu'),
                            t('calendar.fri'),
                            t('calendar.sat')
                        ].map(d => (
                            <div key={d} className="text-muted-foreground font-bold py-1">{d}</div>
                        ))}
                    </div>
                    {/* Calendar Grid Body */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {calendarDays.map((day, idx) => {
                            const dateKey = format(day, 'yyyy-MM-dd')
                            const data = dailyData.get(dateKey)
                            const isCurrentMonth = isSameMonth(day, currentDate)
                            const isTodayDay = isToday(day)

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "min-h-[70px] p-1.5 border-2 rounded-2xl cursor-pointer transition-all relative flex flex-col justify-between overflow-hidden",
                                        isCurrentMonth ? "bg-card border-muted/50" : "bg-muted/10 text-muted-foreground border-transparent",
                                        isTodayDay && "border-primary shadow-[0_0_12px_rgba(var(--primary),0.2)]",
                                        "hover:border-primary/30"
                                    )}
                                >
                                    <div className="text-right text-[11px] font-bold">
                                        {format(day, 'd')}
                                    </div>

                                    {/* Dots / Indicators */}
                                    {(data?.income || data?.expense) ? (
                                        <div className="space-y-1">
                                            {data.income > 0 && (
                                                <div className="text-[8px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded-lg truncate text-center">
                                                    {isAmountHidden ? "***" : `+${data.income >= 1000 ? (data.income / 1000).toFixed(1) + 'k' : data.income}`}
                                                </div>
                                            )}
                                            {data.expense > 0 && (
                                                <div className="text-[8px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-1 py-0.5 rounded-lg truncate text-center">
                                                    {isAmountHidden ? "***" : `-${data.expense >= 1000 ? (data.expense / 1000).toFixed(1) + 'k' : data.expense}`}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : viewMode === 'pie' ? (
                <div className="px-1 animate-in fade-in zoom-in-95 duration-300">
                    <SpendingPieChart
                        selectedMonth={currentDate.getMonth().toString()}
                        selectedYear={currentDate.getFullYear().toString()}
                    />
                </div>
            ) : (
                <div className="bg-card border-none bg-muted/20 rounded-3xl p-2 min-h-[340px] px-1">
                    <FinanceChart
                        data={chartData}
                    />
                </div>
            )}

            <DayDetailModal
                date={selectedDate}
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                incomes={selectedDateData.incomes}
                spendings={selectedDateData.spendings}
            />
        </div>
    )
}
