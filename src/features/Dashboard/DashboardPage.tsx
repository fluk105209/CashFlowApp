
import { QuickAddIcon } from "@/components/UnifiedAddModal"
import { RecentActivityList } from "@/components/RecentActivityList"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "react-i18next"
import { Utensils, Car, Zap, Loader2, ShoppingBag } from "lucide-react"
import { DashboardHeader } from "./components/DashboardHeader"
import { CashFlowSummary } from "./components/CashFlowSummary"
import { ObligationOverview } from "./components/ObligationOverview"
import { AssetSummary } from "./components/AssetSummary"

export function DashboardPage() {
    const { t } = useTranslation()
    const { isLoading, initialize } = useFinanceStore()

    const [pullDistance, setPullDistance] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [startY, setStartY] = useState(0)

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY)
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && startY > 0) {
            const currentY = e.touches[0].clientY
            const diff = currentY - startY
            if (diff > 0 && !isRefreshing) {
                const distance = Math.min(diff * 0.4, 80)
                setPullDistance(distance)
            }
        }
    }

    const handleTouchEnd = () => {
        if (pullDistance > 60 && !isRefreshing) {
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
        setStartY(0)
    }

    useEffect(() => {
        initialize()
    }, [initialize])

    const openQuickAdd = (prefill: any) => {
        window.dispatchEvent(new CustomEvent('open-unified-add', { detail: prefill }));
    }

    if (isLoading) {
        return (
            <div className="space-y-6 pt-4 px-2">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>
                <Skeleton className="h-[80px] w-full rounded-2xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-[100px] w-full rounded-xl" />
                    <Skeleton className="h-[100px] w-full rounded-xl" />
                </div>
                <Skeleton className="h-[200px] w-full rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="relative min-h-[calc(100vh-100px)]">
            {/* Pull to Refresh Indicator */}
            <div
                className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden pointer-events-none z-50 transition-all duration-300"
                style={{ height: pullDistance, opacity: pullDistance > 0 ? 1 : 0 }}
            >
                <Loader2 className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>

            <motion.main
                key="dashboard-modern"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 pb-24"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <DashboardHeader />

                {/* Staggered Animations for Sections */}
                <div className="space-y-6 px-1">

                    {/* 1. Quick Asset Summary (Top Cards) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <AssetSummary />
                    </motion.div>

                    {/* 2. Main Cash Flow Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <CashFlowSummary />
                    </motion.div>

                    {/* 3. Quick Actions Row */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex justify-around items-center py-2"
                    >
                        <QuickAddIcon
                            icon={Utensils}
                            label={t('categories.Food')}
                            color="#ef4444"
                            onClick={() => openQuickAdd({ type: 'expense', name: '', category: 'Food' })}
                        />
                        <QuickAddIcon
                            icon={Car}
                            label={t('categories.Transport')}
                            color="#3b82f6"
                            onClick={() => openQuickAdd({ type: 'expense', name: '', category: 'Transport' })}
                        />
                        <QuickAddIcon
                            icon={ShoppingBag}
                            label={t('categories.Shopping')}
                            color="#8b5cf6"
                            onClick={() => openQuickAdd({ type: 'expense', name: '', category: 'Shopping' })}
                        />
                        <QuickAddIcon
                            icon={Zap}
                            label={t('categories.Utilities')}
                            color="#eab308"
                            onClick={() => openQuickAdd({ type: 'expense', name: '', category: 'Utilities' })}
                        />
                    </motion.div>

                    {/* 4. Obligations Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="w-full"
                    >
                        <ObligationOverview />
                    </motion.div>

                    {/* 5. Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-2 mt-4 px-1">
                            <h3 className="font-bold text-sm text-foreground">
                                {t('common.recent_activity', { defaultValue: 'Recent Activity' })}
                            </h3>
                        </div>
                        <RecentActivityList limit={5} />
                    </motion.div>
                </div>
            </motion.main>
        </div>
    )
}
