import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { useFinanceStore } from "@/stores/useFinanceStore"
import type { Spending } from '@/types'
import { useTranslation } from 'react-i18next'

import { SPENDING_CATEGORIES } from '@/constants/categories'

interface Props {
    initialData?: Spending
    trigger?: React.ReactNode
    defaultDate?: Date
}

export function SpendingModal({ initialData, trigger, defaultDate }: Props) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const store = useFinanceStore()
    const { addSpending, updateSpending, obligations } = store
    const isEdit = !!initialData

    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('Food')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    // New Fields
    const [kind, setKind] = useState<'normal' | 'obligation-payment'>('normal')
    const [linkedObligationId, setLinkedObligationId] = useState<string>('')

    const activeObligations = obligations.filter(o => o.status !== 'closed')

    const resetForm = () => {
        setName('')
        setAmount('')
        setCategory('Food')
        setKind('normal')
        setLinkedObligationId('')
        setDate(new Date().toISOString().split('T')[0])
    }

    useEffect(() => {
        if (open && initialData) {
            requestAnimationFrame(() => {
                setName(initialData.name)
                setAmount(initialData.amount.toString())
                setCategory(initialData.category)
                setKind(initialData.kind)
                setLinkedObligationId(initialData.linkedObligationId || '')
                setDate(new Date(initialData.date).toISOString().split('T')[0])
            })
        } else if (open && !initialData) {
            requestAnimationFrame(() => {
                resetForm()
                if (defaultDate) {
                    setDate(format(defaultDate, 'yyyy-MM-dd'))
                }
            })
        }
    }, [open, initialData, defaultDate])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !amount || !date) return

        // Extra validation for linked items
        if (kind === 'obligation-payment' && !linkedObligationId) return

        const payload = {
            name,
            amount: parseFloat(amount),
            category,
            date: new Date(date).toISOString(),
            kind,
            linkedObligationId: kind === 'obligation-payment' ? linkedObligationId : undefined,
        }

        if (isEdit && initialData) {
            updateSpending(initialData.id, payload)
        } else {
            addSpending(payload)
        }

        setOpen(false)
        if (!isEdit) resetForm()
    }


    // Auto-fill details when linking
    const handleObligationSelect = (id: string) => {
        setLinkedObligationId(id)
        const ob = obligations.find(o => o.id === id)
        if (ob) {
            if (!isEdit) { // Only auto-fill name/amount if not editing existing
                // Try to translate "Pay" prefix or similar if needed, but usually we just use the name
                setName(`${t('spending.pay_obligation')}: ${ob.name}`)
                setAmount(ob.amount.toString()) // Use the monthly/min payment amount
                setCategory('Obligation Payment')
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="outline">
                        + {t('spending.add_btn')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('spending.edit') : t('spending.add')}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t('spending.desc_edit') : t('spending.desc_add')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('spending.type')}</Label>
                            <Select value={kind} onValueChange={(val: 'normal' | 'obligation-payment') => setKind(val)}>
                                <SelectTrigger>
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
                                <Label>{t('spending.select_obligation')}</Label>
                                <Select value={linkedObligationId} onValueChange={handleObligationSelect}>
                                    <SelectTrigger>
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
                            <Label htmlFor="date">{t('spending.date')}</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">{t('spending.name')}</Label>
                            <Input
                                id="name"
                                placeholder={t('spending.placeholder_name')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('spending.amount')}</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">{t('spending.category')}</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
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
                    <DialogFooter>
                        <Button type="submit">{t('common.save')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
