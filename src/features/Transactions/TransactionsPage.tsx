import { useState, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IncomeList } from "@/features/Income/IncomeList"
import { SpendingList } from "@/features/Spending/SpendingList"
import { ObligationList } from "@/features/Obligation/ObligationList"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search, FilterX, Calendar, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { parseISO, getMonth, getYear } from "date-fns"
import { useTranslation } from "react-i18next"

export function TransactionsPage() {
    const { t, i18n } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const activeTab = searchParams.get('tab') || 'income'

    const { incomes, spendings, obligations } = useFinanceStore()

    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("all")
    const [selectedMonth, setSelectedMonth] = useState<string>("all")
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

    // Advanced filters
    const [minAmount, setMinAmount] = useState<string>("")
    const [maxAmount, setMaxAmount] = useState<string>("")
    const [sortBy, setSortBy] = useState<string>("date-desc")

    const months = [
        { value: "all", label: t('transactions.all_months') },
        ...Array.from({ length: 12 }, (_, i) => ({
            value: i.toString(),
            label: t(`months.${i}`)
        }))
    ]

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear()
        const allYears = new Set([currentYear.toString()])
        incomes.forEach(i => allYears.add(getYear(parseISO(i.date)).toString()))
        spendings.forEach(s => allYears.add(getYear(parseISO(s.date)).toString()))
        return Array.from(allYears).sort((a, b) => b.localeCompare(a))
    }, [incomes, spendings])

    // Get unique categories for each type
    const incomeCategories = useMemo(() => ["all", ...new Set(incomes.map(i => i.category))], [incomes])
    const spendingCategories = useMemo(() => ["all", ...new Set(spendings.map(s => s.category))], [spendings])
    const obligationTypes = useMemo(() => ["all", ...new Set(obligations.map(o => o.type))], [obligations])

    const filteredIncomes = useMemo(() => {
        const items = incomes.filter(item => {
            const date = parseISO(item.date.split('T')[0])
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
            const matchesCategory = category === "all" || item.category === category
            const matchesMonth = selectedMonth === "all" || getMonth(date).toString() === selectedMonth
            const matchesYear = getYear(date).toString() === selectedYear
            const matchesMin = minAmount === "" || item.amount >= parseFloat(minAmount)
            const matchesMax = maxAmount === "" || item.amount <= parseFloat(maxAmount)
            return matchesSearch && matchesCategory && matchesMonth && matchesYear && matchesMin && matchesMax
        })

        items.sort((a, b) => {
            if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime()
            if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime()
            if (sortBy === "amount-desc") return b.amount - a.amount
            if (sortBy === "amount-asc") return a.amount - b.amount
            return 0
        })
        return items
    }, [incomes, search, category, selectedMonth, selectedYear, minAmount, maxAmount, sortBy])

    const filteredSpendings = useMemo(() => {
        const items = spendings.filter(item => {
            const date = parseISO(item.date.split('T')[0])
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
            const matchesCategory = category === "all" || item.category === category
            const matchesMonth = selectedMonth === "all" || getMonth(date).toString() === selectedMonth
            const matchesYear = getYear(date).toString() === selectedYear
            const matchesMin = minAmount === "" || item.amount >= parseFloat(minAmount)
            const matchesMax = maxAmount === "" || item.amount <= parseFloat(maxAmount)
            return matchesSearch && matchesCategory && matchesMonth && matchesYear && matchesMin && matchesMax
        })

        items.sort((a, b) => {
            if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime()
            if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime()
            if (sortBy === "amount-desc") return b.amount - a.amount
            if (sortBy === "amount-asc") return a.amount - b.amount
            return 0
        })
        return items
    }, [spendings, search, category, selectedMonth, selectedYear, minAmount, maxAmount, sortBy])

    const filteredObligations = useMemo(() => {
        return obligations.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
            const matchesCategory = category === "all" || item.type === category
            // Obligations don't have a specific transaction date in the same way, 
            // but we could filter by startDate if we wanted. For now keeping it simple.
            return matchesSearch && matchesCategory
        })
    }, [obligations, search, category])

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value })
        setSearch("")
        setCategory("all")
    }

    const resetFilters = () => {
        setSearch("")
        setCategory("all")
        setSelectedMonth("all")
        setSelectedYear(new Date().getFullYear().toString())
        setMinAmount("")
        setMaxAmount("")
        setSortBy("date-desc")
    }

    const isFiltered = search || category !== "all" || selectedMonth !== "all" || selectedYear !== new Date().getFullYear().toString() || minAmount || maxAmount || sortBy !== "date-desc"

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('transactions.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('transactions.subtitle')}</p>
                </div>
            </header>

            <div className="space-y-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('transactions.search_placeholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-[140px] capitalize">
                                    <SelectValue placeholder={t('transactions.filter_category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeTab === 'income' && incomeCategories.map(cat => (
                                        <SelectItem key={cat} value={cat} className="capitalize">{cat === 'all' ? t('common.all') : t(`categories.${cat}`, { defaultValue: cat })}</SelectItem>
                                    ))}
                                    {activeTab === 'expense' && spendingCategories.map(cat => (
                                        <SelectItem key={cat} value={cat} className="capitalize">{cat === 'all' ? t('common.all') : t(`categories.${cat}`, { defaultValue: cat })}</SelectItem>
                                    ))}
                                    {activeTab === 'obligation' && obligationTypes.map(cat => (
                                        <SelectItem key={cat} value={cat} className="capitalize">{cat === 'all' ? t('common.all') : t(`obligation_types.${cat}`, { defaultValue: cat.replace('-', ' ') })}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon" className={cn(minAmount || maxAmount ? "text-primary border-primary bg-primary/10" : "")}>
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="end">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-sm">{t('transactions.advanced_filters')}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black opacity-50">{t('transactions.min_amount')}</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={minAmount}
                                                    onChange={(e) => setMinAmount(e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black opacity-50">{t('transactions.max_amount')}</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="100000"
                                                    value={maxAmount}
                                                    onChange={(e) => setMaxAmount(e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-black opacity-50">{t('transactions.sort_by')}</Label>
                                            <Select value={sortBy} onValueChange={setSortBy}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <ArrowUpDown className="h-3 w-3 mr-2 opacity-50" />
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="date-desc" className="text-xs">{t('transactions.sort_date_desc')}</SelectItem>
                                                    <SelectItem value="date-asc" className="text-xs">{t('transactions.sort_date_asc')}</SelectItem>
                                                    <SelectItem value="amount-desc" className="text-xs">{t('transactions.sort_amount_desc')}</SelectItem>
                                                    <SelectItem value="amount-asc" className="text-xs">{t('transactions.sort_amount_asc')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetFilters}
                                            className="w-full text-xs h-8 text-muted-foreground"
                                        >
                                            {t('common.reset')}
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {isFiltered && (
                                <Button variant="outline" size="icon" onClick={resetFilters}>
                                    <FilterX className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-2 rounded-lg border border-border/50">
                        <Calendar className="h-4 w-4 text-muted-foreground ml-1" />
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue placeholder={t('transactions.filter_month')} />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => (
                                    <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[90px] h-8 text-xs">
                                <SelectValue placeholder={t('transactions.filter_year')} />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => (
                                    <SelectItem key={y} value={y} className="text-xs">
                                        {i18n.language.startsWith('th') ? parseInt(y) + 543 : y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="income" className="relative">
                            {t('transactions.tab_income')}
                            {activeTab === 'income' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-background shadow-sm rounded-md z-[-1]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="expense" className="relative">
                            {t('transactions.tab_expense')}
                            {activeTab === 'expense' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-background shadow-sm rounded-md z-[-1]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="obligation" className="relative">
                            {t('transactions.tab_obligation')}
                            {activeTab === 'obligation' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-background shadow-sm rounded-md z-[-1]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10, x: 0 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, y: -10, x: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <TabsContent value="income" key="income" className="mt-0 focus-visible:outline-none">
                                    <IncomeList items={filteredIncomes} />
                                </TabsContent>
                                <TabsContent value="expense" key="expense" className="mt-0 focus-visible:outline-none">
                                    <SpendingList items={filteredSpendings} />
                                </TabsContent>
                                <TabsContent value="obligation" key="obligation" className="mt-0 focus-visible:outline-none">
                                    <ObligationList items={filteredObligations} />
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Tabs>
            </div>
        </motion.div>
    )
}
