import { useState } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { Button } from "@/components/ui/button"
import {
    Smartphone,
    CreditCard,
    Banknote,
    Car,
    Home,
    HelpCircle,
    Trash2,
    Edit,
    Calendar,
    ChevronUp,
    ExternalLink
} from "lucide-react"
import { ObligationModal } from "./AddObligationModal"
import { format, parseISO } from "date-fns"
import type { Obligation } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface Props {
    limit?: number
    items?: Obligation[]
}

export function ObligationList({ limit, items }: Props) {
    const { t, i18n } = useTranslation()
    const { obligations: storeObligations, deleteObligation } = useFinanceStore()
    const [isExpanded, setIsExpanded] = useState(false)

    // Use items prop if provided (for filtering), otherwise use store
    const dataSource = items || storeObligations

    if (dataSource.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                {t('common.no_items_found')}
            </div>
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'installment': return <Smartphone className="h-4 w-4" />
            case 'credit-card': return <CreditCard className="h-4 w-4" />
            case 'personal-loan': return <Banknote className="h-4 w-4" />
            case 'car-loan': return <Car className="h-4 w-4" />
            case 'home-loan': return <Home className="h-4 w-4" />
            default: return <HelpCircle className="h-4 w-4" />
        }
    }

    const displayedObligations = (limit && !isExpanded) ? dataSource.slice(0, limit) : dataSource

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
                {displayedObligations.map((ob, index) => (
                    <motion.div
                        key={ob.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-full text-muted-foreground">
                                {getIcon(ob.type)}
                            </div>
                            <div>
                                <div className="font-medium text-sm">{ob.name}</div>
                                <div className="flex flex-col gap-0.5">
                                    <div className="text-[10px] text-muted-foreground capitalize">
                                        {t(`obligation_types.${ob.type}`, { defaultValue: ob.type.replace('-', ' ') })}
                                        {ob.interestRate ? ` • ${t('common.apr')} ${ob.interestRate}%` : ''}
                                    </div>
                                    {ob.startDate && (
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Calendar className="h-2.5 w-2.5" />
                                            {t('obligations.start_date')}: {i18n.language.startsWith('th')
                                                ? `${format(parseISO(ob.startDate), 'd')} ${t(`months.${parseISO(ob.startDate).getMonth()}`).substring(0, 3)} ${parseISO(ob.startDate).getFullYear() + 543}`
                                                : format(parseISO(ob.startDate), 'MMM d, yyyy')}
                                        </div>
                                    )}
                                    <div className="mt-1">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                            ob.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                        )}>
                                            {t(`obligations.${ob.status}`)}
                                        </span>
                                    </div>
                                </div>
                                {ob.type === 'installment' && ob.totalMonths && (
                                    <div className="mt-1 w-24 h-1 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${Math.min(100, ((ob.paidMonths || 0) / ob.totalMonths) * 100)}%` }}
                                        />
                                    </div>
                                )}
                                {ob.type === 'credit-card' && ob.creditLimit && ob.balance !== undefined && (
                                    <div className="mt-1 w-24 h-1 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${Math.min(100, (ob.balance / ob.creditLimit) * 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-right mr-2">
                                <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                                    ฿{ob.amount.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">{t('common.per_month')}</span>
                                </div>
                                {ob.balance && (
                                    <div className="text-[10px] text-muted-foreground">
                                        {t('obligations.balance')}: ฿{ob.balance.toLocaleString()}
                                    </div>
                                )}
                                {ob.type === 'installment' && ob.totalMonths && (
                                    <div className="text-[9px] text-muted-foreground text-right mt-0.5">
                                        {ob.paidMonths || 0}/{ob.totalMonths} {t('obligations.paid_months').toLowerCase()}
                                    </div>
                                )}
                                {ob.type === 'credit-card' && ob.creditLimit && (
                                    <div className="text-[9px] text-muted-foreground text-right mt-0.5">
                                        {t('obligations.limit')}: ฿{ob.creditLimit.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-0">
                                <ObligationModal
                                    initialData={ob}
                                    trigger={
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                    }
                                />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteObligation(ob.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {limit && dataSource.length > limit && !isExpanded && (
                <Link to="/transactions?tab=obligation" className="block">
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
