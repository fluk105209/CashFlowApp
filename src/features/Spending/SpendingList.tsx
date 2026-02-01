import { useFinanceStore } from "@/stores/useFinanceStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ExternalLink, HelpCircle } from "lucide-react"
import { SpendingModal } from "./AddSpendingModal"
import { format, parseISO } from "date-fns"
import type { Spending } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getCategoryMetadata } from "@/constants/categories"
import { formatCurrency } from "@/utils/formatUtils"

interface Props {
    limit?: number
    items?: Spending[]
}

export function SpendingList({ limit, items }: Props) {
    const { t, i18n } = useTranslation()
    const { spendings: storeSpendings, categoryColors, currency, isAmountHidden } = useFinanceStore()

    const dataSource = [...(items || storeSpendings)].sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
    });

    if (dataSource.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-[2rem] bg-muted/20">
                {t('spending.no_expenses', { defaultValue: t('common.no_items_found') })}
            </div>
        )
    }

    const displayedSpendings = limit ? dataSource.slice(0, limit) : dataSource

    return (
        <div className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
                {displayedSpendings.map((spending, index) => {
                    const metadata = getCategoryMetadata(spending.category);
                    const Icon = metadata?.icon || HelpCircle;
                    const color = categoryColors[spending.category] || '#94a3b8';

                    return (
                        <motion.div
                            key={spending.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-card rounded-[1.5rem] shadow-sm border border-border/40"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: color + '15', color: color }}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-sm truncate">{spending.name}</div>
                                        {spending.kind === 'obligation-payment' && (
                                            <Badge variant="secondary" className="text-[8px] h-4 px-1 rounded-full bg-primary/5 text-primary border-none">
                                                {t('spending.obligation_badge')}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        <span className="font-medium whitespace-nowrap">{t(`categories.${spending.category}`, { defaultValue: spending.category })}</span>
                                        <span className="opacity-30">•</span>
                                        <span className="whitespace-nowrap">
                                            {i18n.language.startsWith('th')
                                                ? `${format(parseISO(spending.date), 'd')} ${t(`months.${parseISO(spending.date).getMonth()}`).substring(0, 3)}`
                                                : format(parseISO(spending.date), 'MMM d')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                                <div className="text-right mr-2">
                                    <div className="font-black text-rose-500 text-sm whitespace-nowrap">
                                        -{formatCurrency(spending.amount, currency, isAmountHidden)}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <SpendingModal
                                        initialData={spending}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-primary hover:bg-primary/5 bg-muted/20">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {limit && dataSource.length > limit && (
                <Link to="/transactions?tab=expense" className="block px-2">
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-primary text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 h-10 rounded-2xl bg-muted/30"
                    >
                        {t('common.view_all_with_count', { count: dataSource.length })} <ExternalLink className="h-3 w-3" />
                    </Button>
                </Link>
            )}
        </div>
    )
}
