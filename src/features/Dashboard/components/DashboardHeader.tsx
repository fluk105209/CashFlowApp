
import { Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { formatCurrency } from "@/utils/formatUtils"
import { motion, AnimatePresence } from "framer-motion"
import type { Income, Spending } from "@/types"

export function DashboardHeader() {
    const { t } = useTranslation()
    const { isAmountHidden, toggleAmountVisibility, currency, incomes, spendings } = useFinanceStore()

    // Calculate Net Worth

    // Note: Asset calculation might need refinement based on asset type (e.g. gold price), but for now using base value
    // Actually, let's just use the store logic if available, or simple sum for now.
    // Real calculation should happen in store or service, but for UI display we can sum up valid numbers.

    // Let's refine Net Worth calculation to be robust:

    // Net Worth = Assets - Liabilities + (Current Cash Balance from Income - Expense)
    // Actually "Total Balance" usually means current liquid cash + assets.
    // Let's stick to "Total Balance" as (Income - Expense) + Assets(Cash) for the big number
    // And "Net Worth" for everything.

    const totalIncome = incomes.reduce((sum: number, i: Income) => sum + Number(i.amount), 0)
    const totalSpending = spendings.reduce((sum: number, s: Spending) => sum + Number(s.amount), 0)
    const currentCashBalance = totalIncome - totalSpending

    // Let's display "Net Worth" as the primary big number as it's the truest measure of wealth
    // User Feedback: "Total Balance" should be "Cash Flow" amount (Income - Expense).
    const netWorth = currentCashBalance

    return (
        <header className="flex flex-col gap-2 pt-0 pb-6 px-1">
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest pl-1">
                        {t('dashboard.total_balance', { defaultValue: 'Total Net Worth' })}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={toggleAmountVisibility}
                    >
                        {isAmountHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tighter">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isAmountHidden ? 'hidden' : 'visible'}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {formatCurrency(netWorth, currency, isAmountHidden)}
                            </motion.span>
                        </AnimatePresence>
                    </h2>
                </div>
            </div>
        </header>
    )
}
