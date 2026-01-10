import { useState, useEffect } from 'react'
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
import { useFinanceStore } from "@/stores/useFinanceStore"
import type { Obligation, ObligationType } from '@/types'
import { CreditCard, Smartphone, Car, Home, Banknote, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
    initialData?: Obligation
    trigger?: React.ReactNode
}

export function ObligationModal({ initialData, trigger }: Props) {
    const [open, setOpen] = useState(false)
    const { addObligation, updateObligation } = useFinanceStore()
    const isEdit = !!initialData

    const [step, setStep] = useState<1 | 2>(1)
    const [type, setType] = useState<ObligationType>('installment')

    // Form Fields
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('') // Monthly / Min Payment
    const [balance, setBalance] = useState('') // Total / Remaining
    const [interestRate, setInterestRate] = useState('')
    const [totalMonths, setTotalMonths] = useState('')
    const [paidMonths, setPaidMonths] = useState('0')
    const [creditLimit, setCreditLimit] = useState('')

    // Initialize form on open
    useEffect(() => {
        if (open && initialData) {
            setStep(2)
            setType(initialData.type)
            setName(initialData.name)
            setAmount(initialData.amount.toString())
            setBalance(initialData.balance?.toString() || '')
            setInterestRate(initialData.interestRate?.toString() || '')
            setTotalMonths(initialData.totalMonths?.toString() || '')
            setPaidMonths(initialData.paidMonths?.toString() || '0')
            setCreditLimit(initialData.creditLimit?.toString() || '')
        } else if (open && !initialData) {
            resetForm()
        }
    }, [open, initialData])

    // Auto-calculate Balance (Remaining Total) for Installments
    useEffect(() => {
        if (type === 'installment' && amount && totalMonths) {
            const mParams = {
                monthly: parseFloat(amount) || 0,
                total: parseInt(totalMonths) || 0,
                paid: parseInt(paidMonths) || 0
            }
            if (mParams.monthly > 0 && mParams.total > 0) {
                const remainingMonths = Math.max(0, mParams.total - mParams.paid)
                const calculatedRemaining = remainingMonths * mParams.monthly
                setBalance(calculatedRemaining.toString())
            }
        }
    }, [amount, totalMonths, paidMonths, type])

    const resetForm = () => {
        setStep(1)
        setType('installment')
        setName('')
        setAmount('')
        setBalance('')
        setInterestRate('')
        setTotalMonths('')
        setPaidMonths('0')
        setCreditLimit('')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !amount) return

        const payload = {
            name,
            type,
            amount: parseFloat(amount),
            balance: balance ? parseFloat(balance) : undefined,
            interestRate: interestRate ? parseFloat(interestRate) : undefined,
            totalMonths: totalMonths ? parseInt(totalMonths) : undefined,
            paidMonths: paidMonths ? parseInt(paidMonths) : undefined,
            creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
            status: (initialData?.status || 'active') as 'active' | 'closed',
            startDate: initialData?.startDate || new Date().toISOString(),
        }

        if (isEdit && initialData) {
            updateObligation(initialData.id, payload)
        } else {
            addObligation(payload)
        }

        setOpen(false)
        if (!isEdit) resetForm()
    }

    const typeOptions: { id: ObligationType; label: string; icon: any }[] = [
        { id: 'installment', label: 'Fixed Installment', icon: Smartphone },
        { id: 'credit-card', label: 'Credit Card / Loan', icon: CreditCard },
        { id: 'personal-loan', label: 'Personal Loan', icon: Banknote },
        { id: 'car-loan', label: 'Car Loan', icon: Car },
        { id: 'home-loan', label: 'Home Loan', icon: Home },
        { id: 'other', label: 'Other', icon: HelpCircle },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="default" className="bg-rose-600 hover:bg-rose-700 text-white">
                        + Add Obligation
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Obligation' : 'Add Monthly Obligation'}</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Select the type of obligation." : "Enter the details."}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="grid grid-cols-2 gap-3 py-4">
                        {typeOptions.map((opt) => (
                            <div
                                key={opt.id}
                                className={cn(
                                    "cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border-2 hover:bg-muted/50 transition-all",
                                    type === opt.id ? "border-primary bg-primary/5" : "border-transparent bg-muted/20"
                                )}
                                onClick={() => setType(opt.id)}
                            >
                                <opt.icon className={cn("h-8 w-8 mb-2", type === opt.id ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("text-xs font-semibold", type === opt.id ? "text-primary" : "text-muted-foreground")}>{opt.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <form id="obligation-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="e.g. iPhone, Visa Card" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">
                                {type === 'credit-card' ? 'Minimum Payment' : 'Monthly Payment'}
                            </Label>
                            <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>

                        {/* Balance / Total Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="balance">
                                {type === 'installment' ? 'Remaining Balance (Auto-calc)' : 'Outstanding Balance'}
                            </Label>
                            <Input id="balance" type="number" placeholder="0.00" value={balance} onChange={e => setBalance(e.target.value)} />
                        </div>

                        {type === 'installment' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total Months</Label>
                                    <Input type="number" value={totalMonths} onChange={e => setTotalMonths(e.target.value)} placeholder="10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Paid Months</Label>
                                    <Input type="number" value={paidMonths} onChange={e => setPaidMonths(e.target.value)} placeholder="0" />
                                </div>
                            </div>
                        )}

                        {type === 'credit-card' && (
                            <div className="space-y-2">
                                <Label>Credit Limit (Optional)</Label>
                                <Input type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} placeholder="e.g. 50000" />
                            </div>
                        )}

                        {type !== 'installment' && (
                            <div className="space-y-2">
                                <Label>Interest Rate (APR %)</Label>
                                <Input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="16.0" />
                            </div>
                        )}
                    </form>
                )}

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    {step === 2 && !isEdit ? (
                        <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    ) : (
                        <div />
                    )}

                    {step === 1 ? (
                        <Button type="button" onClick={() => setStep(2)}>Next</Button>
                    ) : (
                        <Button type="submit" form="obligation-form">Save</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
