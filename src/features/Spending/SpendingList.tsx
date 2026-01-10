import { useState } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Trash2, ExternalLink, ChevronUp } from "lucide-react"
import { SpendingModal } from "./AddSpendingModal"
import { format, parseISO } from "date-fns"
import type { Spending } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface Props {
    limit?: number
    items?: Spending[]
}

export function SpendingList({ limit, items }: Props) {
    const { t, i18n } = useTranslation()
    const { spendings: storeSpendings, deleteSpending } = useFinanceStore()
    const [isExpanded, setIsExpanded] = useState(false)

    // Use items prop if provided (for filtering), otherwise use store
    const dataSource = items || storeSpendings

    if (dataSource.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                {t('spending.no_expenses', { defaultValue: t('common.no_items_found') })}
            </div>
        )
    }

    const displayedSpendings = (limit && !isExpanded) ? dataSource.slice(0, limit) : dataSource

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
                {displayedSpendings.map((spending, index) => (
                    <motion.div
                        key={spending.id}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="font-medium">{spending.name}</div>
                                {spending.kind === 'obligation-payment' && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                        {t('spending.obligation_badge')}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="capitalize">{t(`categories.${spending.category}`, { defaultValue: spending.category })}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {i18n.language.startsWith('th')
                                        ? `${format(parseISO(spending.date), 'd')} ${t(`months.${parseISO(spending.date).getMonth()}`).substring(0, 3)} ${parseISO(spending.date).getFullYear() + 543}`
                                        : format(parseISO(spending.date), 'MMM d, yyyy')}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="font-bold text-rose-600 dark:text-rose-400 mr-2">
                                -฿{spending.amount.toLocaleString()}
                            </div>
                            <SpendingModal
                                initialData={spending}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteSpending(spending.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {limit && dataSource.length > limit && !isExpanded && (
                <Link to="/transactions?tab=expense" className="block">
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
