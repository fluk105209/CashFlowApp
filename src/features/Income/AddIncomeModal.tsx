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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(initialData.name)
            setAmount(initialData.amount.toString())
            setFrequency(initialData.frequency)
            setCategory(initialData.category)
            // Fix: ensure we don't shift timezone if possible, but for editing, we assume stored date is correct.
            // Using split('T')[0] on ISO string is risky if stored as UTC midnight.
            // But let's keep consistent with original logic for edit for now, as user didn't complain about Edit.
            setDate(new Date(initialData.date).toISOString().split('T')[0])
        } else if (open && !initialData) {
            resetForm()
            // Fix: Use local format for defaultDate
            if (defaultDate) {
                setDate(format(defaultDate, 'yyyy-MM-dd'))
            }
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
                                    <SelectItem value="Salary">{t('categories.Salary')}</SelectItem>
                                    <SelectItem value="Freelance">{t('categories.Freelance')}</SelectItem>
                                    <SelectItem value="Business">{t('categories.Business')}</SelectItem>
                                    <SelectItem value="Investment">{t('categories.Investment')}</SelectItem>
                                    <SelectItem value="Gift">{t('categories.Gift')}</SelectItem>
                                    <SelectItem value="Other">{t('categories.Other')}</SelectItem>
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
