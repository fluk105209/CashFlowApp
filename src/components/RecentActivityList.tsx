import { useFinanceStore } from "@/stores/useFinanceStore"
import { Button } from "@/components/ui/button"
import { HelpCircle, ExternalLink, ArrowUpRight, ArrowDownLeft, Edit } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { Income, Spending } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getCategoryMetadata } from "@/constants/categories"
import { IncomeModal } from "@/features/Income/AddIncomeModal"
import { SpendingModal } from "@/features/Spending/AddSpendingModal"

export function RecentActivityList({ limit = 8 }: { limit?: number }) {
    const { t, i18n } = useTranslation()
    const { incomes, spendings, categoryColors } = useFinanceStore()

    const combinedActivities = [
        ...incomes.map(i => ({
            id: i.id,
            type: 'income' as const,
            name: i.name,
            amount: i.amount,
            category: i.category,
            date: i.date,
            created_at: i.created_at,
            originalData: i
        })),
        ...spendings.map(s => ({
            id: s.id,
            type: 'spending' as const,
            name: s.name,
            amount: s.amount,
            category: s.category,
            date: s.date,
            created_at: s.created_at,
            originalData: s
        }))
    ].sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
    });

    if (combinedActivities.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-[2rem] bg-muted/20">
                {t('common.no_items_found')}
            </div>
        )
    }

    const displayedItems = combinedActivities.slice(0, limit)

    return (
        <div className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
                {displayedItems.map((item, index) => {
                    const metadata = getCategoryMetadata(item.category);
                    const Icon = metadata?.icon || HelpCircle;
                    const color = categoryColors[item.category] || (item.type === 'income' ? '#e2e8f0' : '#e2e8f0');

                    return (
                        <motion.div
                            key={`${item.type}-${item.id}`}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-card rounded-[1.5rem] shadow-sm border border-border/40"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: color + (color.length === 7 ? '15' : ''),
                                        color: color
                                    }}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-sm truncate">{item.name}</div>
                                        <div className={`p-1 rounded-full ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {item.type === 'income' ? <ArrowDownLeft className="w-2 h-2" /> : <ArrowUpRight className="w-2 h-2" />}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        <span className="font-medium whitespace-nowrap">
                                            {t(`categories.${item.category}`, { defaultValue: item.category })}
                                        </span>
                                        <span className="opacity-30">•</span>
                                        <span className="whitespace-nowrap">
                                            {i18n.language.startsWith('th')
                                                ? `${format(parseISO(item.date), 'd')} ${t(`months.${parseISO(item.date).getMonth()}`).substring(0, 3)}`
                                                : format(parseISO(item.date), 'MMM d')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                                <div className="text-right mr-2">
                                    <div className={`font-black text-sm whitespace-nowrap ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {item.type === 'income' ? '+' : '-'}฿{item.amount.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    {item.type === 'income' ? (
                                        <IncomeModal
                                            initialData={item.originalData as Income}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-primary hover:bg-primary/5 bg-muted/20">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                    ) : (
                                        <SpendingModal
                                            initialData={item.originalData as Spending}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-primary hover:bg-primary/5 bg-muted/20">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            <Link to="/transactions" className="block px-2">
                <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-primary text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 h-12 rounded-2xl bg-muted/30"
                >
                    {t('common.view_all', { defaultValue: 'View All Activity' })} <ExternalLink className="h-3 w-3" />
                </Button>
            </Link>
        </div>
    )
}
