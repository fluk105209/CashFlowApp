import { useState, useMemo } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday
} from "date-fns"
import { ChevronLeft, ChevronRight, BarChart3, Calendar as CalendarIcon, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DayDetailModal } from "./DayDetailModal"
import { FinanceChart } from "./FinanceChart"
import { cn } from "@/lib/utils"

export function CalendarView() {
    const { incomes, spendings } = useFinanceStore()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'graph-month' | 'graph-year'>('grid')

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
            const dateKey = format(new Date(inc.date), 'yyyy-MM-dd')
            const current = map.get(dateKey) || { income: 0, expense: 0 }
            map.set(dateKey, { ...current, income: current.income + inc.amount })
        })

        spendings.forEach(sp => {
            const dateKey = format(new Date(sp.date), 'yyyy-MM-dd')
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
            if (isSameMonth(new Date(i.date), currentDate)) income += i.amount
        })
        spendings.forEach(s => {
            if (isSameMonth(new Date(s.date), currentDate)) expense += s.amount
        })

        return { income, expense, net: income - expense }
    }, [incomes, spendings, currentDate])

    // Calculate Previous Balance (Global carryover for Month View)
    const previousBalance = useMemo(() => {
        let income = 0;
        let expense = 0;

        incomes.forEach(i => {
            if (new Date(i.date) < monthStart) income += i.amount;
        });

        spendings.forEach(s => {
            if (new Date(s.date) < monthStart) expense += s.amount;
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
                    label: format(month, 'MMM'),
                    income: inc,
                    expense: exp,
                    net: runningYearBalance // Cumulative Year Savings and prior history
                }
            })
        }
        return []
    }, [viewMode, currentDate, dailyData, incomes, spendings, monthStart, monthEnd, previousBalance])


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
        return {
            incomes: incomes.filter(i => isSameDay(new Date(i.date), selectedDate)),
            spendings: spendings.filter(s => isSameDay(new Date(s.date), selectedDate))
        }
    }, [selectedDate, incomes, spendings])

    return (
        <div className="space-y-4 pb-20">
            {/* Header Controls */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {viewMode === 'graph-year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={goToday} className="text-xs">
                            Today
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    {/* View Switcher */}
                    <div className="flex bg-muted rounded-lg p-1 text-xs">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("px-3 py-1.5 rounded-md transition-all flex items-center gap-1", viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                        >
                            <CalendarIcon className="h-3 w-3" /> Grid
                        </button>
                        <button
                            onClick={() => setViewMode('graph-month')}
                            className={cn("px-3 py-1.5 rounded-md transition-all flex items-center gap-1", viewMode === 'graph-month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                        >
                            <BarChart3 className="h-3 w-3" /> Month
                        </button>
                        <button
                            onClick={() => setViewMode('graph-year')}
                            className={cn("px-3 py-1.5 rounded-md transition-all flex items-center gap-1", viewMode === 'graph-year' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                        >
                            <LineChart className="h-3 w-3" /> Year
                        </button>
                    </div>

                </div>
            </div>

            {/* Monthly Summary Bar (Show only in Grid or Month Graph) */}
            {viewMode !== 'graph-year' && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-card border p-2 rounded-lg shadow-sm">
                        <div className="text-muted-foreground mb-1">Income</div>
                        <div className="font-bold text-emerald-600">+{monthlySummary.income.toLocaleString()}</div>
                    </div>
                    <div className="bg-card border p-2 rounded-lg shadow-sm">
                        <div className="text-muted-foreground mb-1">Expense</div>
                        <div className="font-bold text-rose-600">-{monthlySummary.expense.toLocaleString()}</div>
                    </div>
                    <div className="bg-card border p-2 rounded-lg shadow-sm">
                        <div className="text-muted-foreground mb-1">Net</div>
                        <div className={cn("font-bold", monthlySummary.net >= 0 ? "text-blue-600" : "text-orange-600")}>
                            {monthlySummary.net.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {viewMode === 'grid' ? (
                <>
                    {/* Calendar Grid Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-muted-foreground font-medium py-1">{d}</div>
                        ))}
                    </div>
                    {/* Calendar Grid Body */}
                    <div className="grid grid-cols-7 gap-1">
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
                                        "min-h-[60px] p-1 border rounded-md cursor-pointer transition-colors relative flex flex-col justify-between",
                                        isCurrentMonth ? "bg-card" : "bg-muted/30 text-muted-foreground",
                                        isTodayDay && "ring-2 ring-primary ring-offset-1",
                                        "hover:border-primary/50"
                                    )}
                                >
                                    <div className="text-right text-[10px] font-medium">
                                        {format(day, 'd')}
                                    </div>

                                    {/* Dots / Indicators */}
                                    {(data?.income || data?.expense) ? (
                                        <div className="space-y-0.5">
                                            {data.income > 0 && (
                                                <div className="text-[9px] bg-emerald-100 text-emerald-700 px-0.5 rounded-sm truncate">
                                                    +{data.income >= 1000 ? (data.income / 1000).toFixed(1) + 'k' : data.income}
                                                </div>
                                            )}
                                            {data.expense > 0 && (
                                                <div className="text-[9px] bg-rose-100 text-rose-700 px-0.5 rounded-sm truncate">
                                                    -{data.expense >= 1000 ? (data.expense / 1000).toFixed(1) + 'k' : data.expense}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            )
                        })}
                    </div>
                </>
            ) : (
                <div className="bg-card border rounded-lg p-2 min-h-[300px]">
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
