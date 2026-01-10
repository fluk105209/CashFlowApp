import React, { useState, useEffect } from 'react'
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
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface Props {
    initialData?: Obligation
    trigger?: React.ReactNode
}

export function ObligationModal({ initialData, trigger }: Props) {
    const { t } = useTranslation()
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
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

    // Initialize form on open
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
        setStartDate(new Date().toISOString().split('T')[0]) // Reset startDate
    }

    useEffect(() => {
        if (open && initialData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStep(2)
            setType(initialData.type)
            setName(initialData.name)
            setAmount(initialData.amount.toString())
            setBalance(initialData.balance?.toString() || '')
            setInterestRate(initialData.interestRate?.toString() || '')
            setTotalMonths(initialData.totalMonths?.toString() || '')
            setPaidMonths(initialData.paidMonths?.toString() || '0')
            setCreditLimit(initialData.creditLimit?.toString() || '')
            setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
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
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setBalance(calculatedRemaining.toString())
            }
        }
    }, [amount, totalMonths, paidMonths, type])


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
            startDate: startDate || new Date().toISOString(), // Use startDate from state
        }

        if (isEdit && initialData) {
            updateObligation(initialData.id, payload)
        } else {
            addObligation(payload)
        }

        setOpen(false)
        if (!isEdit) resetForm()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="outline">
                        + {t('obligations.add_btn')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('obligations.edit') : t('obligations.add')}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t('obligations.desc_edit') : t('obligations.desc_add')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Stepper Header */}
                    <div className="flex items-center mb-6 px-2">
                        {[1, 2].map((s) => (
                            <React.Fragment key={s}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                                    step === s ? "bg-primary border-primary text-primary-foreground" :
                                        step > s ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 text-muted-foreground"
                                )}>
                                    {step > s ? "✓" : s}
                                </div>
                                {s === 1 && <div className={cn("flex-1 h-0.5 mx-2", step > 1 ? "bg-emerald-500" : "bg-muted/30")} />}
                            </React.Fragment>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <p className="text-sm text-muted-foreground">{t('obligations.step_1_desc')}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'installment', icon: Smartphone, label: t('obligation_types.installment') },
                                        { id: 'credit-card', icon: CreditCard, label: t('obligation_types.credit-card') },
                                        { id: 'personal-loan', icon: Banknote, label: t('obligation_types.personal-loan') },
                                        { id: 'car-loan', icon: Car, label: t('obligation_types.car-loan') },
                                        { id: 'home-loan', icon: Home, label: t('obligation_types.home-loan') },
                                        { id: 'other', icon: HelpCircle, label: t('obligation_types.other') },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setType(item.id as ObligationType)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50 flex flex-col gap-2",
                                                type === item.id ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-muted/30"
                                            )}
                                        >
                                            <item.icon className={cn("h-5 w-5", type === item.id ? "text-primary" : "text-muted-foreground")} />
                                            <span className="text-xs font-bold">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('obligations.name')}</Label>
                                    <Input
                                        id="name"
                                        placeholder={t('obligations.placeholder_name')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">
                                            {type === 'credit-card' ? t('obligations.amount_min') : t('obligations.amount')}
                                        </Label>
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
                                        <Label htmlFor="balance">{t('obligations.balance')}</Label>
                                        <Input
                                            id="balance"
                                            type="number"
                                            placeholder="0.00"
                                            value={balance}
                                            onChange={(e) => setBalance(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {type === 'installment' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalMonths">{t('obligations.total_months')}</Label>
                                            <Input
                                                id="totalMonths"
                                                type="number"
                                                placeholder="12"
                                                value={totalMonths}
                                                onChange={(e) => setTotalMonths(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="paidMonths">{t('obligations.paid_months')}</Label>
                                            <Input
                                                id="paidMonths"
                                                type="number"
                                                placeholder="0"
                                                value={paidMonths}
                                                onChange={(e) => setPaidMonths(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {type === 'credit-card' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="creditLimit">{t('obligations.limit')}</Label>
                                        <Input
                                            id="creditLimit"
                                            type="number"
                                            placeholder="50000"
                                            value={creditLimit}
                                            onChange={(e) => setCreditLimit(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="interestRate">{t('obligations.interest')}</Label>
                                        <Input
                                            id="interestRate"
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">{t('obligations.start_date')}</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-6 flex-row gap-2 sm:justify-between">
                            {step === 1 ? (
                                <>
                                    <div />
                                    <Button type="button" onClick={() => setStep(2)}>
                                        {t('common.next')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                        {t('common.back')}
                                    </Button>
                                    <Button type="submit">
                                        {t('common.save')}
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
