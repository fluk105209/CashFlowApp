import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Coins, Landmark, Box, TrendingUp, Wallet, Home } from "lucide-react"
import type { Asset, AssetType } from "@/types"
import { getCurrencySymbol } from "@/utils/formatUtils"

interface AddAssetModalProps {
    initialData?: Asset
    children?: React.ReactNode
}

export function AddAssetModal({ initialData, children }: AddAssetModalProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="icon" className="rounded-2xl shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-[95%] max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-primary">
                        {initialData ? t('assets.edit') : t('assets.add')}
                    </DialogTitle>
                </DialogHeader>

                <AddAssetForm initialData={initialData} onClose={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

function AddAssetForm({ initialData, onClose }: { initialData?: Asset, onClose: () => void }) {
    const { t } = useTranslation()
    const { addAsset, updateAsset, currency } = useFinanceStore()
    const [quantityInput, setQuantityInput] = useState(initialData?.quantity?.toString() || '0')
    const [formData, setFormData] = useState<Omit<Asset, 'id' | 'created_at'>>({
        name: initialData?.name || '',
        type: initialData?.type || 'gold',
        quantity: initialData?.quantity || 0,
        unit: initialData?.unit || 'baht',
        purchasePrice: initialData?.purchasePrice || undefined
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const finalQuantity = parseFloat(quantityInput) || 0
        const finalData = { ...formData, quantity: finalQuantity }

        if (initialData) {
            await updateAsset(initialData.id, finalData)
        } else {
            await addAsset(finalData)
        }
        onClose()
    }

    const handleTypeChange = (val: string) => {
        let unit = 'unit';
        if (val === 'bitcoin') unit = 'BTC';
        else if (val === 'gold') unit = 'baht';
        else if (val === 'stock') unit = 'share';
        else if (val === 'fund') unit = 'unit';

        setFormData({ ...formData, type: val as AssetType, unit });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">{t('assets.name')}</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('assets.name_placeholder', { defaultValue: 'เช่น ทองแท่ง, หุ้น Apple, กองทุน K-SET50' })}
                        className="rounded-2xl bg-muted/50 border-none h-12"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">{t('assets.type')}</Label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                        <SelectTrigger className="rounded-2xl bg-muted/50 border-none h-12 shadow-none focus:ring-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="gold" className="rounded-xl flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Landmark className="h-4 w-4 text-yellow-500" />
                                    {t('assets.gold')}
                                </div>
                            </SelectItem>
                            <SelectItem value="bitcoin" className="rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-orange-500" />
                                    {t('assets.bitcoin')}
                                </div>
                            </SelectItem>
                            <SelectItem value="stock" className="rounded-xl">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    {t('assets.stock')}
                                </div>
                            </SelectItem>
                            <SelectItem value="fund" className="rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-blue-500" />
                                    {t('assets.fund')}
                                </div>
                            </SelectItem>
                            <SelectItem value="real-estate" className="rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-indigo-500" />
                                    {t('assets.real-estate')}
                                </div>
                            </SelectItem>
                            <SelectItem value="other" className="rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Box className="h-4 w-4 text-primary" />
                                    {t('assets.other')}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">{t('assets.quantity')}</Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            value={quantityInput}
                            onChange={(e) => setQuantityInput(e.target.value)}
                            className="rounded-2xl bg-muted/50 border-none h-12"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">{t('assets.unit')}</Label>
                        {formData.type === 'gold' ? (
                            <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                                <SelectTrigger className="rounded-2xl bg-muted/50 border-none h-12 shadow-none focus:ring-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="baht" className="rounded-xl">{t('assets.unit_baht')}</SelectItem>
                                    <SelectItem value="salung" className="rounded-xl">{t('assets.unit_salung')}</SelectItem>
                                    <SelectItem value="satang" className="rounded-xl">{t('assets.unit_satang')}</SelectItem>
                                    <SelectItem value="gram" className="rounded-xl">{t('assets.unit_gram')}</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="rounded-2xl bg-muted/50 border-none h-12 uppercase"
                                readOnly={formData.type === 'bitcoin'}
                                required
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">
                        {t('assets.purchase_price')}
                    </Label>
                    <Input
                        type="number"
                        value={formData.purchasePrice || ''}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                        placeholder={`${getCurrencySymbol(currency)} ... (${t('common.optional', { defaultValue: 'Optional' })})`}
                        className="rounded-2xl bg-muted/50 border-none h-12"
                    />
                </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row gap-3">
                {initialData && (
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-14 rounded-2xl font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                        onClick={() => {
                            if (window.confirm(t('common.confirm_delete'))) {
                                useFinanceStore.getState().deleteAsset(initialData.id)
                                onClose()
                            }
                        }}
                    >
                        {t('common.delete')}
                    </Button>
                )}
                <Button type="submit" className="flex-[2] h-14 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/30">
                    {t('common.save')}
                </Button>
            </DialogFooter>
        </form>
    )
}
