import { useState, useMemo } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronLeft,
    Plus,
    Target,
    Trash2,
    AlertCircle,
    TrendingUp,
    PieChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { SPENDING_CATEGORIES, getCategoryMetadata } from "@/constants/categories"
import { formatCurrency } from "@/utils/formatUtils"
import { useNavigate } from "react-router-dom"
import { Progress } from "@/components/ui/progress"
import { parseISO, getMonth, getYear } from "date-fns"

export function BudgetPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { budgets, spendings, addBudget, updateBudget, deleteBudget, currency, isAmountHidden } = useFinanceStore()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        period: "monthly" as "monthly" | "yearly"
    })

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth().toString()
    const currentYear = currentDate.getFullYear().toString()

    const categoryBudgets = useMemo(() => {
        return budgets.map(budget => {
            const spent = spendings
                .filter(s => {
                    const date = parseISO(s.date.split('T')[0])
                    const matchesCategory = s.category === budget.category
                    const matchesMonth = budget.period === 'monthly' ? getMonth(date).toString() === currentMonth : true
                    const matchesYear = getYear(date).toString() === currentYear
                    return matchesCategory && matchesMonth && matchesYear
                })
                .reduce((acc, s) => acc + s.amount, 0)

            const progress = (spent / budget.amount) * 100
            const remaining = Math.max(0, budget.amount - spent)

            return {
                ...budget,
                spent,
                progress,
                remaining,
                isOver: spent > budget.amount
            }
        })
    }, [budgets, spendings, currentMonth, currentYear])

    const handleSave = async () => {
        if (!formData.category || !formData.amount) return

        const amount = parseFloat(formData.amount)
        if (isNaN(amount)) return

        if (editingBudget) {
            await updateBudget(editingBudget, {
                category: formData.category,
                amount,
                period: formData.period
            })
        } else {
            await addBudget({
                category: formData.category,
                amount,
                period: formData.period
            })
        }

        setIsAddModalOpen(false)
        setEditingBudget(null)
        setFormData({ category: "", amount: "", period: "monthly" })
    }

    const handleEdit = (budget: any) => {
        setEditingBudget(budget.id)
        setFormData({
            category: budget.category,
            amount: budget.amount.toString(),
            period: budget.period
        })
        setIsAddModalOpen(true)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-20"
        >
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('budget.title', { defaultValue: 'Budgets' })}</h1>
                        <p className="text-sm text-muted-foreground">{t('budget.subtitle', { defaultValue: 'Track your spending limits' })}</p>
                    </div>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="rounded-2xl h-12 px-6 shadow-lg shadow-primary/25"
                            onClick={() => {
                                setEditingBudget(null)
                                setFormData({ category: "", amount: "", period: "monthly" })
                            }}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            {t('budget.add_new', { defaultValue: 'Add Budget' })}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-md border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingBudget ? t('budget.edit_title', { defaultValue: 'Edit Budget' }) : t('budget.add_title', { defaultValue: 'Create New Budget' })}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">
                                    {t('budget.category', { defaultValue: 'Category' })}
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                                >
                                    <SelectTrigger className="rounded-2xl bg-muted/50 border-none h-12">
                                        <SelectValue placeholder={t('budget.select_category', { defaultValue: 'Select category' })} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPENDING_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.key} value={cat.key} className="capitalize">
                                                {t(`categories.${cat.key}`, { defaultValue: cat.key })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">
                                    {t('budget.amount', { defaultValue: 'Budget Amount' })}
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0"
                                    className="rounded-2xl bg-muted/50 border-none h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">
                                    {t('budget.period', { defaultValue: 'Period' })}
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={formData.period === 'monthly' ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, period: 'monthly' })}
                                        className="rounded-xl h-10"
                                    >
                                        {t('budget.monthly', { defaultValue: 'Monthly' })}
                                    </Button>
                                    <Button
                                        variant={formData.period === 'yearly' ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, period: 'yearly' })}
                                        className="rounded-xl h-10"
                                    >
                                        {t('budget.yearly', { defaultValue: 'Yearly' })}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" className="rounded-xl" onClick={() => setIsAddModalOpen(false)}>
                                {t('common.cancel')}
                            </Button>
                            <Button className="rounded-xl" onClick={handleSave}>
                                {t('common.save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="grid gap-4">
                {categoryBudgets.length === 0 ? (
                    <Card className="border-2 border-dashed bg-muted/30">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Target className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{t('budget.empty_title', { defaultValue: 'No budgets set' })}</p>
                                <p className="text-sm text-muted-foreground max-w-[240px]">
                                    {t('budget.empty_desc', { defaultValue: 'Set your first spending limit to start tracking' })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <AnimatePresence>
                        {categoryBudgets.map((budget) => {
                            const metadata = getCategoryMetadata(budget.category)
                            const Icon = metadata?.icon || PieChart

                            return (
                                <motion.div
                                    key={budget.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-all">
                                        <CardContent className="p-5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                                        style={{ backgroundColor: (metadata?.defaultColor || '#94a3b8') + '15', color: metadata?.defaultColor }}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">{t(`categories.${budget.category}`, { defaultValue: budget.category })}</h3>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                            {budget.period === 'monthly' ? t('budget.monthly') : t('budget.yearly')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                                                        <TrendingUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteBudget(budget.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-muted-foreground">
                                                        {t('budget.spent', { defaultValue: 'Spent' })}: {formatCurrency(budget.spent, currency, isAmountHidden)}
                                                    </span>
                                                    <span className={budget.isOver ? "text-destructive" : "text-primary"}>
                                                        {formatCurrency(budget.amount, currency, isAmountHidden)}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={Math.min(100, budget.progress)}
                                                    className={`h-2.5 rounded-full ${budget.isOver ? "bg-destructive/20" : ""}`}
                                                />
                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                    <span className={budget.isOver ? "text-destructive flex items-center gap-1" : "text-muted-foreground"}>
                                                        {budget.isOver && <AlertCircle className="h-3 w-3" />}
                                                        {budget.isOver
                                                            ? t('budget.over_limit', { defaultValue: 'Over limit by' }) + ` ${formatCurrency(budget.spent - budget.amount, currency, isAmountHidden)}`
                                                            : t('budget.remaining', { defaultValue: 'Remaining' }) + ` ${formatCurrency(budget.remaining, currency, isAmountHidden)}`
                                                        }
                                                    </span>
                                                    <span className="text-muted-foreground opacity-60">
                                                        {budget.progress.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    )
}
