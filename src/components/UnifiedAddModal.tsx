import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinanceStore } from "@/stores/useFinanceStore"
import type { Frequency } from '@/types'
import { useTranslation } from 'react-i18next'
import { SPENDING_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { Wallet, Receipt } from 'lucide-react'

interface UnifiedAddModalProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    initialTab?: 'expense' | 'income'
    prefillData?: {
        type: 'expense' | 'income'
        name: string
        amount?: string
        category: string
    }
    trigger?: React.ReactNode
}

export function UnifiedAddModal({
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
    initialTab = 'expense',
    prefillData,
    trigger
}: UnifiedAddModalProps) {
    const { t } = useTranslation()
    const [open, setInternalOpen] = useState(false)
    const isControlled = externalOpen !== undefined
    const isOpen = isControlled ? externalOpen : open
    const setOpen = isControlled ? (externalOnOpenChange || (() => { })) : setInternalOpen

    const [activeTab, setActiveTab] = useState<'expense' | 'income'>(initialTab)
    const { addSpending, addIncome, obligations } = useFinanceStore()

    // Form States
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [expenseCategory, setExpenseCategory] = useState('Food')
    const [incomeCategory, setIncomeCategory] = useState('Salary')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [kind, setKind] = useState<'normal' | 'obligation-payment'>('normal')
    const [linkedObligationId, setLinkedObligationId] = useState<string>('')
    const [frequency, setFrequency] = useState<Frequency>('one-time')

    const activeObligations = obligations.filter(o => o.status !== 'closed')

    const resetForm = () => {
        setName('')
        setAmount('')
        setExpenseCategory('Food')
        setIncomeCategory('Salary')
        setKind('normal')
        setLinkedObligationId('')
        setFrequency('one-time')
        setDate(new Date().toISOString().split('T')[0])
    }

    useEffect(() => {
        if (isOpen) {
            if (prefillData) {
                setActiveTab(prefillData.type)
                setName(prefillData.name)
                setAmount(prefillData.amount || '')
                if (prefillData.type === 'expense') {
                    setExpenseCategory(prefillData.category)
                } else {
                    setIncomeCategory(prefillData.category)
                }
            } else {
                setActiveTab(initialTab)
                resetForm()
            }
        }
    }, [isOpen, prefillData, initialTab])

    const handleExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !amount || !date) return
        if (kind === 'obligation-payment' && !linkedObligationId) return

        addSpending({
            name,
            amount: parseFloat(amount),
            category: expenseCategory,
            date: new Date(date).toISOString(),
            kind,
            linkedObligationId: kind === 'obligation-payment' ? linkedObligationId : undefined,
        })

        setOpen(false)
        resetForm()
    }

    const handleIncomeSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !amount || !date) return

        addIncome({
            name,
            amount: parseFloat(amount),
            frequency,
            category: incomeCategory,
            date: new Date(date).toISOString(),
        })

        setOpen(false)
        resetForm()
    }

    const handleObligationSelect = (id: string) => {
        setLinkedObligationId(id)
        const ob = obligations.find(o => o.id === id)
        if (ob) {
            setName(`${t('spending.pay_obligation')}: ${ob.name}`)
            setAmount(ob.amount.toString())
            setExpenseCategory('Obligation Payment')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[2rem] pb-[env(safe-area-inset-bottom,1.5rem)]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-center text-primary">
                        {t('common.add_transaction', { defaultValue: 'Add Transaction' })}
                    </DialogTitle>
                    <DialogDescription className="text-center text-xs">
                        {t('common.add_transaction_desc', { defaultValue: 'Record your new income or expense' })}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'expense' | 'income')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-2xl mb-4">
                        <TabsTrigger value="expense" className="rounded-xl flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            {t('spending.title')}
                        </TabsTrigger>
                        <TabsTrigger value="income" className="rounded-xl flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            {t('income.title')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="expense">
                        <form onSubmit={handleExpenseSubmit} className="space-y-4 py-2">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('spending.type')}</Label>
                                    <Select value={kind} onValueChange={(val: 'normal' | 'obligation-payment') => setKind(val)}>
                                        <SelectTrigger className="rounded-xl shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">{t('spending.normal')}</SelectItem>
                                            <SelectItem value="obligation-payment">{t('spending.pay_obligation')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {kind === 'obligation-payment' && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('spending.select_obligation')}</Label>
                                        <Select value={linkedObligationId} onValueChange={handleObligationSelect}>
                                            <SelectTrigger className="rounded-xl shadow-sm">
                                                <SelectValue placeholder={t('spending.select_obligation')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeObligations.map(ob => (
                                                    <SelectItem key={ob.id} value={ob.id}>
                                                        {ob.name} ({t(`obligation_types.${ob.type}`)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('spending.date')}</Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="rounded-xl shadow-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('spending.name')}</Label>
                                    <Input
                                        placeholder={t('spending.placeholder_name')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="rounded-xl shadow-sm font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('spending.amount')}</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-rose-500">฿</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pl-8 rounded-xl shadow-sm text-lg font-black text-rose-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('spending.category')}</Label>
                                    <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                                        <SelectTrigger className="rounded-xl shadow-sm">
                                            <SelectValue placeholder={t('spending.category')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SPENDING_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.key} value={cat.key}>
                                                    <div className="flex items-center gap-2">
                                                        <cat.icon className="h-4 w-4 text-muted-foreground" />
                                                        <span>{t(`categories.${cat.key}`)}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full rounded-2xl h-12 text-base font-bold shadow-lg shadow-rose-500/20 bg-rose-500 hover:bg-rose-600 transition-all active:scale-[0.98]">
                                {t('common.save')}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="income">
                        <form onSubmit={handleIncomeSubmit} className="space-y-4 py-2">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('income.date')}</Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="rounded-xl shadow-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('income.name')}</Label>
                                    <Input
                                        placeholder={t('income.placeholder_name')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="rounded-xl shadow-sm font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('income.amount')}</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-emerald-500">฿</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pl-8 rounded-xl shadow-sm text-lg font-black text-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('income.frequency')}</Label>
                                    <Select value={frequency} onValueChange={(val) => setFrequency(val as Frequency)}>
                                        <SelectTrigger className="rounded-xl shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">{t('frequencies.monthly')}</SelectItem>
                                            <SelectItem value="yearly">{t('frequencies.yearly')}</SelectItem>
                                            <SelectItem value="one-time">{t('frequencies.one-time')}</SelectItem>
                                            <SelectItem value="irregular">{t('frequencies.irregular')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('income.category')}</Label>
                                    <Select value={incomeCategory} onValueChange={setIncomeCategory}>
                                        <SelectTrigger className="rounded-xl shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INCOME_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.key} value={cat.key}>
                                                    <div className="flex items-center gap-2">
                                                        <cat.icon className="h-4 w-4 text-muted-foreground" />
                                                        <span>{t(`categories.${cat.key}`)}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full rounded-2xl h-12 text-base font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-[0.98]">
                                {t('common.save')}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

export function QuickAddIcon({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 group transition-all"
        >
            <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 group-active:scale-95"
                style={{ backgroundColor: color + '15', color: color }}
            >
                <Icon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">
                {label}
            </span>
        </button>
    )
}
