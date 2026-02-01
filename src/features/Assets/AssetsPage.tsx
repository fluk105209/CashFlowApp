import { useFinanceStore } from "@/stores/useFinanceStore"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, RefreshCcw, Landmark, TrendingUp, Wallet, Home, Box } from "lucide-react"
import { useEffect, useState } from "react"
import { AddAssetModal } from "./AddAssetModal"
import { formatCurrency } from "@/utils/formatUtils"

export function AssetsPage() {
    const { t } = useTranslation()
    const { assets, isAmountHidden, currency } = useFinanceStore()
    const [prices, setPrices] = useState<Record<string, number>>({ bitcoin: 0, gold: 0 })
    const [isFetching, setIsFetching] = useState(false)

    const fetchPrices = async () => {
        setIsFetching(true)
        try {
            // Fetch BTC from CoinGecko
            const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb')
            const btcData = await btcRes.json()

            // Fetch Gold (USD) and Exchange Rate
            const [goldRes, rateRes] = await Promise.all([
                fetch('https://api.gold-api.com/price/XAU'),
                fetch('https://api.exchangerate-api.com/v4/latest/USD')
            ])
            const goldData = await goldRes.json()
            const rateData = await rateRes.json()

            const usdThb = rateData.rates.THB || 35 // fallback
            const goldPricePerGram = goldData.price * usdThb / 31.1035 // Convert Ounce to Gram then to THB
            const goldPricePerBaht = goldPricePerGram * 15.24 // 1 Baht Gold ~ 15.24 grams

            setPrices({
                bitcoin: btcData.bitcoin.thb,
                gold: goldPricePerBaht
            })
        } catch (error) {
            console.error("Failed to fetch prices:", error)
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchPrices()
    }, [])

    const calculateTotalValue = () => {
        return (assets || []).reduce((total, asset) => {
            let currentPrice = 0
            if (asset.type === 'bitcoin') {
                currentPrice = prices.bitcoin
            } else if (asset.type === 'gold') {
                // Calculation based on unit
                const pricePerBaht = prices.gold
                const pricePerGram = prices.gold / 15.24

                switch (asset.unit.toLowerCase()) {
                    case 'baht':
                    case 'บาท':
                        currentPrice = pricePerBaht
                        break
                    case 'salung':
                    case 'สลึง':
                        currentPrice = pricePerBaht / 4
                        break
                    case 'satang':
                    case 'สตางค์':
                        currentPrice = pricePerBaht / 100
                        break
                    case 'gram':
                    case 'กรัม':
                        currentPrice = pricePerGram
                        break
                    default:
                        currentPrice = pricePerBaht
                }
            } else {
                // For stock, fund, real-estate, other: use purchasePrice as current if it exists
                currentPrice = asset.purchasePrice || 0
            }

            return total + (asset.quantity * currentPrice)
        }, 0)
    }

    const totalAssetsValue = calculateTotalValue()

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-primary uppercase">{t('assets.title')}</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <RefreshCcw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                        {t('assets.realtime_desc')}
                    </p>
                </div>
                <AddAssetModal />
            </div>

            <Card className="bg-primary text-primary-foreground border-none shadow-2xl rounded-[2rem] overflow-hidden">
                <CardContent className="pt-8 pb-8 px-6 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">{t('assets.total_value')}</span>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isAmountHidden ? 'hidden' : 'visible'}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                {formatCurrency(totalAssetsValue, currency, isAmountHidden)}
                            </motion.span>
                        </AnimatePresence>
                    </h3>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <PriceCard
                    title={t('assets.bitcoin')}
                    price={prices.bitcoin}
                    unit="BTC"
                    icon={<Coins className="h-4 w-4 text-orange-400" />}
                    currency={currency}
                />
                <PriceCard
                    title={t('assets.gold')}
                    price={prices.gold}
                    unit={t('assets.unit_baht', { defaultValue: 'Baht' })}
                    icon={<Landmark className="h-4 w-4 text-yellow-500" />}
                    currency={currency}
                />
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-sm text-muted-foreground uppercase px-1">{t('common.records', { defaultValue: 'My Assets' })}</h4>
                {(!assets || assets.length === 0) ? (
                    <div className="text-center py-10 bg-muted/20 border-2 border-dashed rounded-[2rem] text-muted-foreground text-sm">
                        {t('assets.no_assets')}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assets.map((asset) => (
                            <AssetItem
                                key={asset.id}
                                asset={asset}
                                currency={currency}
                                currentPrice={
                                    asset.type === 'bitcoin' ? prices.bitcoin :
                                        asset.type === 'gold' ? prices.gold :
                                            asset.purchasePrice || 0
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

function PriceCard({ title, price, unit, icon, currency }: any) {
    return (
        <Card className="bg-card border-none shadow-lg rounded-3xl">
            <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                    {icon}
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">{title}</span>
                <span className="text-sm font-black text-primary mt-1">
                    {price > 0 ? formatCurrency(price, currency, false) : '...'}
                </span>
                <span className="text-[9px] text-muted-foreground opacity-50 uppercase">/ {unit}</span>
            </CardContent>
        </Card>
    )
}

function AssetItem({ asset, currentPrice, currency }: any) {
    const { t } = useTranslation()
    const { isAmountHidden } = useFinanceStore()

    // Calculate effective price based on unit for Gold
    let effectivePrice = currentPrice
    if (asset.type === 'gold') {
        const pricePerBaht = currentPrice
        const pricePerGram = currentPrice / 15.24

        switch (asset.unit.toLowerCase()) {
            case 'baht':
            case 'บาท':
                effectivePrice = pricePerBaht
                break
            case 'salung':
            case 'สลึง':
                effectivePrice = pricePerBaht / 4
                break
            case 'satang':
            case 'สตางค์':
                effectivePrice = pricePerBaht / 100
                break
            case 'gram':
            case 'กรัม':
                effectivePrice = pricePerGram
                break
        }
    }

    const value = asset.quantity * effectivePrice
    const pnl = asset.purchasePrice ? (value - (asset.quantity * asset.purchasePrice)) : 0

    return (
        <AddAssetModal initialData={asset}>
            <Card className="bg-card border-none shadow-md rounded-3xl overflow-hidden group cursor-pointer hover:bg-muted/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${asset.type === 'bitcoin' ? 'bg-orange-500/10 text-orange-500' :
                            asset.type === 'gold' ? 'bg-yellow-500/10 text-yellow-500' :
                                asset.type === 'stock' ? 'bg-emerald-500/10 text-emerald-500' :
                                    asset.type === 'fund' ? 'bg-blue-500/10 text-blue-500' :
                                        asset.type === 'real-estate' ? 'bg-indigo-500/10 text-indigo-500' :
                                            'bg-primary/10 text-primary'
                            }`}>
                            {asset.type === 'bitcoin' ? <Coins /> :
                                asset.type === 'gold' ? <Landmark /> :
                                    asset.type === 'stock' ? <TrendingUp /> :
                                        asset.type === 'fund' ? <Wallet /> :
                                            asset.type === 'real-estate' ? <Home /> :
                                                <Box />}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{asset.name}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
                                {asset.quantity} {t(`assets.unit_${asset.unit.toLowerCase()}`, { defaultValue: asset.unit })}
                                <span className="opacity-30">•</span>
                                <span>{formatCurrency(effectivePrice, currency, isAmountHidden)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col shrink-0">
                        <span className="font-black text-sm">{formatCurrency(value, currency, isAmountHidden)}</span>
                        {asset.purchasePrice && (
                            <span className={`text-[10px] font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {formatCurrency(pnl, currency, isAmountHidden, { signDisplay: 'always' })}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AddAssetModal>
    )
}
