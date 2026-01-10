import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IncomeModal } from "@/features/Income/AddIncomeModal"
import { IncomeList } from "@/features/Income/IncomeList"
import { SpendingModal } from "@/features/Spending/AddSpendingModal"
import { SpendingList } from "@/features/Spending/SpendingList"
import { ObligationModal } from "@/features/Obligation/AddObligationModal"
import { ObligationList } from "@/features/Obligation/ObligationList"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardPage() {
    const { incomes, spendings, obligations, isLoading, initialize } = useFinanceStore()

    useEffect(() => {
        initialize()
    }, [initialize])

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0)
    const totalSpending = spendings.reduce((sum, item) => sum + item.amount, 0)
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

    const netCashFlow = totalIncome - totalSpending

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

    return (
        <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary-foreground/70">Actual Monthly Net</CardDescription>
                        <CardTitle className="text-4xl font-bold">฿ {netCashFlow.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-sm opacity-90 mt-2">
                            <div>
                                <span className="block text-xs opacity-70">Income</span>
                                <span className="text-emerald-300">+฿ {totalIncome.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs opacity-70">Actual Expenses</span>
                                <span className="text-rose-300">-฿ {totalSpending.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <Card className="border-dashed bg-muted/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Obligations Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Total Planned Payment</span>
                            <span className="font-semibold text-rose-500">฿ {totalObligationsPlanned.toLocaleString()}</span>
                        </div>
                        <div className="h-[1px] bg-border/50" />

                        <div className="flex justify-between items-center text-xs font-medium">
                            <span>Total Debt Balance</span>
                            <span>฿ {(totalInstallmentBalance + totalDebtBalance).toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
                            <div>
                                <span className="block opacity-70 text-[10px]">Installments</span>
                                <span className="font-medium">฿ {totalInstallmentBalance.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                                <span className="block opacity-70 text-[10px]">Consumer Debt</span>
                                <span className="font-medium">฿ {totalDebtBalance.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/50">
                            <span>Est. Monthly Interest</span>
                            <span>฿ {estMonthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="space-y-6">
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">Incomes</h3>
                        <IncomeModal />
                    </div>
                    <IncomeList limit={3} />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">Expenses</h3>
                        <SpendingModal />
                    </div>
                    <SpendingList limit={3} />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">Obligations</h3>
                        <ObligationModal />
                    </div>
                    <ObligationList limit={3} />
                </section>
            </div>
        </motion.main>
    )
}
