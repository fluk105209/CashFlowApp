import { useFinanceStore } from "@/stores/useFinanceStore"
import { Button } from "@/components/ui/button"
import {
    Smartphone,
    CreditCard,
    Banknote,
    Car,
    Home,
    HelpCircle,
    Edit,
    ExternalLink
} from "lucide-react"
import { ObligationModal } from "./AddObligationModal"
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
    const { t } = useTranslation()
    const { obligations: storeObligations } = useFinanceStore()

    const dataSource = [...(items || storeObligations)].sort((a, b) => {
        if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
    });

    if (dataSource.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-[2rem] bg-muted/20">
                {t('common.no_items_found')}
            </div>
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'installment': return Smartphone
            case 'credit-card': return CreditCard
            case 'personal-loan': return Banknote
            case 'car-loan': return Car
            case 'home-loan': return Home
            default: return HelpCircle
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'installment': return '#3b82f6'
            case 'credit-card': return '#8b5cf6'
            case 'personal-loan': return '#f59e0b'
            case 'car-loan': return '#10b981'
            case 'home-loan': return '#ef4444'
            default: return '#94a3b8'
        }
    }

    const displayedObligations = limit ? dataSource.slice(0, limit) : dataSource

    return (
        <div className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
                {displayedObligations.map((ob, index) => {
                    const Icon = getIcon(ob.type);
                    const color = getTypeColor(ob.type);

                    return (
                        <motion.div
                            key={ob.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="relative flex flex-col p-4 bg-card rounded-[1.5rem] shadow-sm border border-border/40 gap-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: color + '15', color: color }}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="font-bold text-sm truncate mr-2">{ob.name}</div>
                                        <div className="text-[10px] text-muted-foreground truncate uppercase font-medium">
                                            {t(`obligation_types.${ob.type}`, { defaultValue: ob.type.replace('-', ' ') })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <Badge status={ob.status} label={t(`obligations.${ob.status}`)} />
                                    <div className="font-black text-rose-500 text-sm">
                                        ฿{ob.amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Progress bars for specific types */}
                                    <div className="w-full max-w-[200px]">
                                        {ob.type === 'installment' && ob.totalMonths && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                                                    <span>{t('obligations.progress')}:</span>
                                                    <span className="whitespace-nowrap">{ob.paidMonths || 0} / {ob.totalMonths} {t('common.months')}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, ((ob.paidMonths || 0) / ob.totalMonths) * 100)}%` }}
                                                        className="h-full bg-primary"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {ob.type === 'credit-card' && ob.creditLimit && ob.balance !== undefined && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                                                    <span>{t('obligations.limit_usage')}:</span>
                                                    <span className="whitespace-nowrap">฿{(ob.creditLimit - ob.balance).toLocaleString()} {t('common.left')}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (ob.balance / ob.creditLimit) * 100)}%` }}
                                                        className="h-full bg-rose-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <ObligationModal
                                        initialData={ob}
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
                <Link to="/transactions?tab=obligation" className="block px-2">
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

function Badge({ status, label }: { status: string, label: string }) {
    return (
        <span className={cn(
            "text-[8px] h-4 px-1.5 rounded-full flex items-center font-bold uppercase tracking-tighter border-none whitespace-nowrap",
            status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
        )}>
            {label}
        </span>
    )
}
