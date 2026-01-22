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
    const { obligations: storeObligations, deleteObligation } = useFinanceStore()

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
                            className="flex items-center justify-between p-4 bg-card rounded-[1.5rem] shadow-sm border border-border/40"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: color + '15', color: color }}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-sm truncate">{ob.name}</div>
                                        <Badge status={ob.status} label={t(`obligations.${ob.status}`)} />
                                    </div>
                                    <div className="text-[10px] text-muted-foreground flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="font-medium whitespace-nowrap capitalize">
                                                {t(`obligation_types.${ob.type}`, { defaultValue: ob.type.replace('-', ' ') })}
                                            </span>
                                            {ob.interestRate !== undefined && (
                                                <>
                                                    <span className="opacity-30">•</span>
                                                    <span className="whitespace-nowrap">{t('common.apr')} {ob.interestRate}%</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Progress bars for specific types */}
                                        <div className="w-[140px] sm:w-[180px] shrink-0">
                                            {ob.type === 'installment' && ob.totalMonths && (
                                                <div className="space-y-1 mt-1">
                                                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                                                        <span>{t('obligations.progress')}:</span>
                                                        <span className="whitespace-nowrap">{ob.paidMonths || 0} / {ob.totalMonths} {t('common.months')}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, ((ob.paidMonths || 0) / ob.totalMonths) * 100)}%` }}
                                                            className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    </div>
                                                    {ob.balance !== undefined && (
                                                        <div className="text-[7px] text-muted-foreground/50 font-medium text-right uppercase truncate">
                                                            {t('obligations.total_amount', { defaultValue: 'Total' })}: ฿{(ob.amount * ob.totalMonths).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {ob.type === 'credit-card' && ob.creditLimit && ob.balance !== undefined && (
                                                <div className="space-y-1 mt-1">
                                                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                                                        <span>{t('obligations.limit_usage')}:</span>
                                                        <span className="whitespace-nowrap">฿{(ob.creditLimit - ob.balance).toLocaleString()} {t('common.left')}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (ob.balance / ob.creditLimit) * 100)}%` }}
                                                            className="h-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                        />
                                                    </div>
                                                    <div className="text-[7px] text-muted-foreground/50 font-medium text-right uppercase truncate">
                                                        {t('obligations.limit')}: ฿{ob.creditLimit.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                                <div className="text-right mr-2">
                                    <div className="font-black text-rose-500 text-sm whitespace-nowrap">
                                        ฿{ob.amount.toLocaleString()}
                                    </div>
                                    <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">
                                        {t('common.per_month')}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ObligationModal
                                        initialData={ob}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-primary hover:bg-primary/5">
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                        }
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5"
                                        onClick={() => deleteObligation(ob.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
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
