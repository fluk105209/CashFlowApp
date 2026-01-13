import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

    // Payment Mode: 'fixed' or 'percent' (Only for Credit Card)
    const [paymentMode, setPaymentMode] = useState<'fixed' | 'percent'>('fixed')
    const [percentValue, setPercentValue] = useState('')

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
        setPaymentMode('fixed')
        setPercentValue('')
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
            requestAnimationFrame(() => {
                setStep(2)
                setType(initialData.type)
                setName(initialData.name)
                setAmount(initialData.amount.toString())
                setPaymentMode('fixed')
                setPercentValue('')
                setBalance(initialData.balance?.toString() || '')
                setInterestRate(initialData.interestRate?.toString() || '')
                setTotalMonths(initialData.totalMonths?.toString() || '')
                setPaidMonths(initialData.paidMonths?.toString() || '0')
                setCreditLimit(initialData.creditLimit?.toString() || '')
                setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
            })
        } else if (open && !initialData) {
            requestAnimationFrame(() => {
                resetForm()
            })
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
                requestAnimationFrame(() => {
                    setBalance(calculatedRemaining.toString())
                })
            }
        }
    }, [amount, totalMonths, paidMonths, type])

    // Auto-calculate Amount when in Percent mode
    useEffect(() => {
        if (type === 'credit-card' && paymentMode === 'percent' && percentValue && balance) {
            const pct = parseFloat(percentValue)
            const bal = parseFloat(balance)
            if (!isNaN(pct) && !isNaN(bal)) {
                const calc = (pct / 100) * bal
                requestAnimationFrame(() => {
                    setAmount(calc.toFixed(2))
                })
            }
        }
    }, [paymentMode, percentValue, balance, type])

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
                                        { id: 'installment', icon: Smartphone, label: t('obligation_types.installment'), color: '#3b82f6' },
                                        { id: 'credit-card', icon: CreditCard, label: t('obligation_types.credit-card'), color: '#ec4899' },
                                        { id: 'personal-loan', icon: Banknote, label: t('obligation_types.personal-loan'), color: '#f59e0b' },
                                        { id: 'car-loan', icon: Car, label: t('obligation_types.car-loan'), color: '#6366f1' },
                                        { id: 'home-loan', icon: Home, label: t('obligation_types.home-loan'), color: '#10b981' },
                                        { id: 'other', icon: HelpCircle, label: t('obligation_types.other'), color: '#94a3b8' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setType(item.id as ObligationType)}
                                            className={cn(
                                                "p-4 rounded-3xl border-2 text-left transition-all flex flex-col gap-3 relative overflow-hidden group mb-1",
                                                type === item.id
                                                    ? "border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20"
                                                    : "border-muted bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/10"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                    type === item.id ? "scale-110" : "opacity-70 group-hover:opacity-100"
                                                )}
                                                style={{
                                                    backgroundColor: item.color + '20',
                                                    color: item.color
                                                }}
                                            >
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold transition-colors",
                                                type === item.id ? "text-primary dark:text-primary-foreground" : "text-muted-foreground"
                                            )}>
                                                {item.label}
                                            </span>
                                            {type === item.id && (
                                                <motion.div
                                                    layoutId="selectedType"
                                                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"
                                                />
                                            )}
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

                                        {/* Toggle for Credit Card */}
                                        {type === 'credit-card' && (
                                            <div className="flex items-center gap-2 mb-2 p-1 bg-muted rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMode('fixed')}
                                                    className={cn(
                                                        "flex-1 text-[10px] font-medium py-1 px-2 rounded-md transition-all",
                                                        paymentMode === 'fixed' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {t('obligations.payment_mode_fixed')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPaymentMode('percent')
                                                        setAmount('') // Clear manual amount when switching
                                                    }}
                                                    className={cn(
                                                        "flex-1 text-[10px] font-medium py-1 px-2 rounded-md transition-all",
                                                        paymentMode === 'percent' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {t('obligations.payment_mode_percent')}
                                                </button>
                                            </div>
                                        )}

                                        {type === 'credit-card' && paymentMode === 'percent' ? (
                                            <div className="space-y-1">
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        placeholder="10"
                                                        value={percentValue}
                                                        onChange={(e) => setPercentValue(e.target.value)}
                                                        className="pr-8"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                                                </div>
                                                {amount && (
                                                    <p className="text-[10px] text-emerald-600 font-medium text-right">
                                                        {t('obligations.calculated_amount', { amount: parseFloat(amount).toLocaleString() })}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                readOnly={type === 'credit-card' && paymentMode === 'percent'} // Should be manual input if fixed
                                                required
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="balance">
                                            {type === 'credit-card' ? t('obligations.total_debt_balance') : t('obligations.balance')}
                                        </Label>
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
                                    <Button type="button" onClick={() => setStep(2)} className="h-10 px-8 rounded-xl font-bold active:scale-[0.98] transition-all">
                                        {t('common.next')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                        {t('common.back')}
                                    </Button>
                                    <Button type="submit" className="h-10 px-8 rounded-xl font-bold active:scale-[0.98] transition-all">
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
