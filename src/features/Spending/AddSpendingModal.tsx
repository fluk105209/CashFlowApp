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

interface Props {
    initialData?: Spending
    trigger?: React.ReactNode
    defaultDate?: Date
}

export function SpendingModal({ initialData, trigger, defaultDate }: Props) {
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

    useEffect(() => {
        if (open && initialData) {
            setName(initialData.name)
            setAmount(initialData.amount.toString())
            setCategory(initialData.category)
            setKind(initialData.kind)
            setLinkedObligationId(initialData.linkedObligationId || '')
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

    const resetForm = () => {
        setName('')
        setAmount('')
        setCategory('Food')
        setKind('normal')
        setLinkedObligationId('')
        setDate(new Date().toISOString().split('T')[0])
    }

    // Auto-fill details when linking
    const handleObligationSelect = (id: string) => {
        setLinkedObligationId(id)
        const ob = obligations.find(o => o.id === id)
        if (ob) {
            if (!isEdit) { // Only auto-fill name/amount if not editing existing
                setName(`Pay ${ob.name}`)
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
                        + Add Expense
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update expense details.' : 'Record a new expense or payment.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Expense Type</Label>
                            <Select value={kind} onValueChange={(val: any) => setKind(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal Expense</SelectItem>
                                    <SelectItem value="obligation-payment">Pay Obligation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {kind === 'obligation-payment' && (
                            <div className="space-y-2">
                                <Label>Select Obligation</Label>
                                <Select value={linkedObligationId} onValueChange={handleObligationSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select active obligation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeObligations.map(ob => (
                                            <SelectItem key={ob.id} value={ob.id}>
                                                {ob.name} ({ob.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

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
                                placeholder="e.g. Lunch"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
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
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Housing">Housing</SelectItem>
                                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                                    <SelectItem value="Health">Health</SelectItem>
                                    <SelectItem value="Shopping">Shopping</SelectItem>
                                    <SelectItem value="Obligation Payment">Obligation Payment</SelectItem>
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
