import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { Income, Spending } from "@/types"
import { format } from "date-fns"
import { IncomeList } from "@/features/Income/IncomeList"
import { SpendingList } from "@/features/Spending/SpendingList"
import { IncomeModal } from "@/features/Income/AddIncomeModal"
import { SpendingModal } from "@/features/Spending/AddSpendingModal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"

interface DayDetailModalProps {
    date: Date | null
    isOpen: boolean
    onClose: () => void
    incomes: Income[]
    spendings: Spending[]
}

export function DayDetailModal({ date, isOpen, onClose, incomes, spendings }: DayDetailModalProps) {
    const { t, i18n } = useTranslation()
    if (!date) return null

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalSpending = spendings.reduce((sum, s) => sum + s.amount, 0)
    const net = totalIncome - totalSpending

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {i18n.language.startsWith('th')
                            ? `${format(date, 'd')} ${t(`months.${date.getMonth()}`)} ${date.getFullYear() + 543}`
                            : format(date, 'EEEE, MMM d, yyyy')}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                        <div className="text-xs opacity-70">{t('dashboard.income')}</div>
                        <div className="font-bold">+฿{totalIncome.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
                        <div className="text-xs opacity-70">{t('dashboard.spending')}</div>
                        <div className="font-bold">-฿{totalSpending.toLocaleString()}</div>
                    </div>
                    <div className={`p-2 rounded-lg ${net >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                        <div className="text-xs opacity-70">{t('common.net')}</div>
                        <div className="font-bold">฿{net.toLocaleString()}</div>
                    </div>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                        <TabsTrigger value="income">{t('dashboard.income')}</TabsTrigger>
                        <TabsTrigger value="expense">{t('dashboard.spending')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        {incomes.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-2 text-emerald-600">{t('income.title')}</h4>
                                <IncomeList items={incomes} />
                            </div>
                        )}
                        {spendings.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-2 text-rose-600">{t('spending.title')}</h4>
                                <SpendingList items={spendings} />
                            </div>
                        )}
                        {incomes.length === 0 && spendings.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('calendar.no_data_day')}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="income" className="space-y-4">
                        <div className="flex justify-end">
                            <IncomeModal
                                defaultDate={date}
                                trigger={<Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">+ {t('income.add')}</Button>}
                            />
                        </div>
                        <IncomeList items={incomes} />
                    </TabsContent>

                    <TabsContent value="expense" className="space-y-4">
                        <div className="flex justify-end">
                            <SpendingModal
                                defaultDate={date}
                                trigger={<Button size="sm" className="h-8 text-xs bg-rose-600 hover:bg-rose-700">+ {t('spending.add')}</Button>}
                            />
                        </div>
                        <SpendingList items={spendings} />
                    </TabsContent>
                </Tabs>

            </DialogContent>
        </Dialog>
    )
}
