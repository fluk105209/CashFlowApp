import { useState, useEffect } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Frequency, Income } from "@/types"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"

import { INCOME_CATEGORIES } from "@/constants/categories"

interface Props {
    initialData?: Income
    trigger?: React.ReactNode
    defaultDate?: Date
}

export function IncomeModal({ initialData, trigger, defaultDate }: Props) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { addIncome, updateIncome } = useFinanceStore()
    const isEdit = !!initialData

    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [frequency, setFrequency] = useState<Frequency>('monthly')
    const [category, setCategory] = useState('Salary')
    // Default to today YYYY-MM-DD
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    const resetForm = () => {
        setName('')
        setAmount('')
        setFrequency('monthly')
        setCategory('Salary')
        setDate(new Date().toISOString().split('T')[0])
    }

    useEffect(() => {
        if (open && initialData) {
            // Use requestAnimationFrame to avoid synchronous setState in effect warning
            requestAnimationFrame(() => {
                setName(initialData.name)
                setAmount(initialData.amount.toString())
                setFrequency(initialData.frequency)
                setCategory(initialData.category)
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

        const payload = {
            name,
            amount: parseFloat(amount),
            frequency,
            category,
            // Convert back to full ISO string for storage, preserving the selected date
            date: new Date(date).toISOString(),
        }

        if (isEdit && initialData) {
            updateIncome(initialData.id, payload)
        } else {
            addIncome(payload)
        }

        setOpen(false)
        if (!isEdit) resetForm()
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        + {t('income.add_btn')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('income.edit') : t('income.add')}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t('income.desc_edit') : t('income.desc_add')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">{t('income.date')}</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('income.name')}</Label>
                            <Input
                                id="name"
                                placeholder={t('income.placeholder_name')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('income.amount')}</Label>
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
                            <Label htmlFor="frequency">{t('income.frequency')}</Label>
                            <Select value={frequency} onValueChange={(val) => setFrequency(val as Frequency)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('common.loading')} />
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
                            <Label htmlFor="category">{t('income.category')}</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('common.loading')} />
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
                    <DialogFooter className="flex flex-row gap-2 justify-between items-center sm:justify-between">
                        {isEdit && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 rounded-xl px-4"
                                onClick={() => {
                                    if (confirm(t('common.confirm_delete'))) {
                                        useFinanceStore.getState().deleteIncome(initialData!.id)
                                        setOpen(false)
                                    }
                                }}
                            >
                                {t('common.delete')}
                            </Button>
                        )}
                        <div className={isEdit ? "" : "ml-auto"}>
                            <Button type="submit" className="h-10 px-8 rounded-xl font-bold active:scale-[0.98] transition-all">
                                {t('common.save')}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
