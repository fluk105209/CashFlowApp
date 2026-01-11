import { useState } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronUp, Edit, ExternalLink, Calendar } from "lucide-react"
import { IncomeModal } from "./AddIncomeModal"
import type { Income } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { useTranslation } from "react-i18next"

interface Props {
    limit?: number
    items?: Income[]
}

export function IncomeList({ limit, items }: Props) {
    const { t, i18n } = useTranslation()
    const { incomes: storeIncomes, deleteIncome } = useFinanceStore()
    const [isExpanded, setIsExpanded] = useState(false)

    // Use items prop if provided (for filtering), otherwise use store
    const dataSource = [...(items || storeIncomes)].sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        // If dates are equal, sort by created_at desc (newest created first)
        if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
    });

    if (dataSource.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                {t('common.no_items_found')}
            </div>
        )
    }

    const displayedIncomes = (limit && !isExpanded) ? dataSource.slice(0, limit) : dataSource

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
                {displayedIncomes.map((income, index) => (
                    <motion.div
                        key={income.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="font-medium">{income.name}</div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="capitalize">{t(`categories.${income.category}`, { defaultValue: income.category })}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {i18n.language.startsWith('th')
                                        ? `${format(parseISO(income.date), 'd')} ${t(`months.${parseISO(income.date).getMonth()}`).substring(0, 3)} ${parseISO(income.date).getFullYear() + 543}`
                                        : format(parseISO(income.date), 'MMM d, yyyy')}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                +฿{income.amount.toLocaleString()}
                            </div>
                            <IncomeModal
                                initialData={income}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title={t('common.edit')}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteIncome(income.id)}
                                title={t('common.delete')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {limit && dataSource.length > limit && !isExpanded && (
                <Link to="/transactions?tab=income" className="block">
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-primary text-xs flex items-center gap-1"
                    >
                        {t('common.view_all_with_count', { count: dataSource.length })} <ExternalLink className="h-3 w-3" />
                    </Button>
                </Link>
            )}

            {limit && isExpanded && (
                <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-primary text-xs"
                    onClick={() => setIsExpanded(false)}
                >
                    <div className="flex items-center gap-1">{t('common.show_less')} <ChevronUp className="h-3 w-3" /></div>
                </Button>
            )}
        </div>
    )
}
