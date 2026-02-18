
import { useTranslation } from "react-i18next"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { formatCurrency } from "@/utils/formatUtils"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Landmark, Banknote, Bitcoin, TrendingUp } from "lucide-react"

export function AssetSummary() {
    const { t } = useTranslation()
    const { assets, currency, isAmountHidden } = useFinanceStore()

    if (!assets || assets.length === 0) return null

    const categories = {
        'cash': { icon: Banknote, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Cash' },
        'savings': { icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Savings' },
        'gold': { icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Gold' },
        'crypto': { icon: Bitcoin, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Crypto' },
        'stock': { icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Stock' },
        'other': { icon: Coins, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Other' },
    }

    const assetSummary = assets.reduce((acc, asset) => {
        const type = asset.type || 'other'
        const value = (asset.type === 'cash' || asset.type === 'savings')
            ? Number(asset.quantity)
            : Number(asset.quantity) * (Number(asset.purchasePrice || 0))

        acc[type] = (acc[type] || 0) + value
        return acc
    }, {} as Record<string, number>)

    // Sort by value desc
    const sortedAssets = Object.entries(assetSummary)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4) // Top 4

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sortedAssets.map(([type, value]) => {
                const config = categories[type as keyof typeof categories] || categories['other']
                const Icon = config.icon

                return (
                    <Card key={type} className="border-border/40 bg-card/50 backdrop-blur-md shadow-sm">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center ${config.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold truncate">
                                    {t(`assets.types.${type}`, { defaultValue: config.label })}
                                </p>
                                <p className="text-xs font-bold text-foreground truncate">
                                    {formatCurrency(value, currency, isAmountHidden)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
