import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QuickAddIcon } from "@/components/UnifiedAddModal"
import { RecentActivityList } from "@/components/RecentActivityList"
import { ObligationModal } from "@/features/Obligation/AddObligationModal"
import { ObligationList } from "@/features/Obligation/ObligationList"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "react-i18next"
import { isSameMonth } from "date-fns"
import { Utensils, Car, Zap, Loader2 } from "lucide-react"

export function DashboardPage() {
    const { t } = useTranslation()
    const { incomes, spendings, obligations, isLoading, initialize } = useFinanceStore()

    const [pullDistance, setPullDistance] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleDrag = (_: any, info: any) => {
        if (info.offset.y > 0 && !isRefreshing) {
            setPullDistance(Math.min(info.offset.y, 80))
        }
    }

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.y > 60 && !isRefreshing) {
            setIsRefreshing(true)
            setPullDistance(50)
            initialize().finally(() => {
                setTimeout(() => {
                    setIsRefreshing(false)
                    setPullDistance(0)
                }, 500)
            })
        } else {
            setPullDistance(0)
        }
    }

    useEffect(() => {
        initialize()
    }, [initialize])

    // Filter for Current Month
    const { monthlyIncome, monthlySpending } = useMemo(() => {
        const now = new Date()

        const mIncomes = incomes.filter(i => isSameMonth(new Date(i.date), now))
        const mSpendings = spendings.filter(s => isSameMonth(new Date(s.date), now))

        const mIncomeSum = mIncomes.reduce((sum, i) => sum + i.amount, 0)
        const mSpendingSum = mSpendings.reduce((sum, s) => sum + s.amount, 0)

        const tIncomeSum = incomes.reduce((sum, i) => sum + i.amount, 0)
        const tSpendingSum = spendings.reduce((sum, s) => sum + s.amount, 0)

        return {
            monthlyIncome: mIncomeSum,
            monthlySpending: mSpendingSum,
            totalIncome: tIncomeSum,
            totalSpending: tSpendingSum
        }
    }, [incomes, spendings])

    const totalObligationsPlanned = obligations.reduce((sum, item) => sum + item.amount, 0)

    const installmentObligations = obligations.filter(o => o.type === 'installment')
    const debtObligations = obligations.filter(o => ['credit-card', 'personal-loan', 'car-loan', 'home-loan', 'other'].includes(o.type))

    const totalInstallmentBalance = installmentObligations.reduce((sum, item) => sum + (item.balance || 0), 0)
    const totalDebtBalance = debtObligations.reduce((sum, item) => sum + (item.balance || 0), 0)

    const estMonthlyInterest = debtObligations.reduce((sum, item) => {
        if (item.balance && item.interestRate) {
            return sum + ((item.balance * item.interestRate / 100) / 12)
        }
        return sum
    }, 0)

    const netCashFlow = monthlyIncome - monthlySpending
    const totalVolume = monthlyIncome + monthlySpending
    const incomePercent = totalVolume > 0 ? (monthlyIncome / totalVolume) * 100 : 0

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[140px] w-full" />
                <Skeleton className="h-[180px] w-full" />
                <div className="space-y-6 pt-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                            <Skeleton className="h-[70px] w-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const openQuickAdd = (prefill: any) => {
        window.dispatchEvent(new CustomEvent('open-unified-add', { detail: prefill }));
    }

    return (
        <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
        >
            {/* Pull to Refresh Indicator */}
            <motion.div
                style={{ height: pullDistance, opacity: pullDistance / 50 }}
                className="flex items-center justify-center overflow-hidden"
            >
                <Loader2 className={`h-6 w-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <Card className="bg-card border-none shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2 text-center pt-8">
                        <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">{t('dashboard.net_monthly')}</CardDescription>
                        <CardTitle className="text-5xl font-black text-primary tracking-tighter py-2">
                            ฿ {netCashFlow.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-8">
                        <div className="grid grid-cols-2 gap-4 mt-4 bg-muted/30 p-4 rounded-3xl">
                            <div className="flex flex-col items-center border-r border-border/50">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">{t('dashboard.income')}</span>
                                <span className="text-emerald-500 font-black text-sm text-center">+฿ {monthlyIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">{t('dashboard.actual_expenses')}</span>
                                <span className="text-rose-500 font-black text-sm text-center">-฿ {monthlySpending.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${incomePercent}%` }}
                                className="h-full bg-emerald-400"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="flex justify-around items-center px-2 py-4">
                <QuickAddIcon
                    icon={Utensils}
                    label={t('categories.Food')}
                    color="#ef4444"
                    onClick={() => openQuickAdd({ type: 'expense', name: 'Lunch', category: 'Food' })}
                />
                <QuickAddIcon
                    icon={Utensils}
                    label={t('common.dinner', { defaultValue: 'Dinner' })}
                    color="#f97316"
                    onClick={() => openQuickAdd({ type: 'expense', name: 'Dinner', category: 'Food' })}
                />
                <QuickAddIcon
                    icon={Car}
                    label={t('categories.Transport')}
                    color="#3b82f6"
                    onClick={() => openQuickAdd({ type: 'expense', name: 'Gas', category: 'Transport' })}
                />
                <QuickAddIcon
                    icon={Zap}
                    label={t('categories.Utilities')}
                    color="#eab308"
                    onClick={() => openQuickAdd({ type: 'expense', name: 'Internet', category: 'Utilities' })}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <Card className="border-dashed bg-muted/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.obligations_breakdown')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">{t('dashboard.total_planned')}</span>
                            <span className="font-semibold text-rose-500">฿ {totalObligationsPlanned.toLocaleString()}</span>
                        </div>
                        <div className="h-[1px] bg-border/50" />

                        <div className="flex justify-between items-center text-xs font-medium">
                            <span>{t('dashboard.total_debt_balance')}</span>
                            <span>฿ {(totalInstallmentBalance + totalDebtBalance).toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
                            <div>
                                <span className="block opacity-70 text-[10px]">{t('dashboard.installments')}</span>
                                <span className="font-medium">฿ {totalInstallmentBalance.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                                <span className="block opacity-70 text-[10px]">{t('dashboard.consumer_debt')}</span>
                                <span className="font-medium">฿ {totalDebtBalance.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/50">
                            <span>{t('dashboard.est_interest')}</span>
                            <span>฿ {estMonthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>


            <div className="space-y-8 pb-10">
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-black text-secondary-foreground uppercase tracking-tight text-xs opacity-60">
                            {t('common.recent_activity', { defaultValue: 'Recent Activity' })}
                        </h3>
                    </div>
                    <RecentActivityList limit={8} />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-black text-secondary-foreground uppercase tracking-tight text-xs opacity-60">
                            {t('obligations.title')}
                        </h3>
                        <ObligationModal />
                    </div>
                    <ObligationList limit={3} />
                </section>
            </div>
        </motion.main >
    )
}
