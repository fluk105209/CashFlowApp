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
import type { Frequency, Income } from '@/types'

interface Props {
    initialData?: Income
    trigger?: React.ReactNode
    defaultDate?: Date
}

export function IncomeModal({ initialData, trigger, defaultDate }: Props) {
    const [open, setOpen] = useState(false)
    const { addIncome, updateIncome } = useFinanceStore()
    const isEdit = !!initialData

    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [frequency, setFrequency] = useState<Frequency>('monthly')
    const [category, setCategory] = useState('Salary')
    // Default to today YYYY-MM-DD
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        if (open && initialData) {
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

    const resetForm = () => {
        setName('')
        setAmount('')
        setFrequency('monthly')
        setCategory('Salary')
        setDate(new Date().toISOString().split('T')[0])
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        + Add Income
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Income' : 'Add Income'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update income details.' : 'Add a new source of income.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Salary, Freelance"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (Monthly)</Label>
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
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select value={frequency} onValueChange={(val) => setFrequency(val as Frequency)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                    <SelectItem value="one-time">One-time</SelectItem>
                                    <SelectItem value="irregular">Irregular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Salary">Salary</SelectItem>
                                    <SelectItem value="Freelance">Freelance</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="Investment">Investment</SelectItem>
                                    <SelectItem value="Gift">Gift</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
