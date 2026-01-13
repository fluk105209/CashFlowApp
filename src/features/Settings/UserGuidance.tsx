import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { useTranslation } from "react-i18next"

export function UserGuidance() {
    const { t } = useTranslation()

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 h-12 text-base rounded-xl">
                    <BookOpen className="h-4 w-4" />
                    {t('settings.user_guide')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 rounded-3xl overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        {t('guide.title')}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8 max-w-2xl mx-auto pb-8">
                        {/* 1. Introduction */}
                        <section className="space-y-4">
                            <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                                <p className="text-sm text-muted-foreground">
                                    {t('guide.welcome_message')}
                                </p>
                            </div>
                        </section>

                        {/* 2. Dashboard */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-primary">{t('guide.dashboard_title')}</h3>
                            <p className="text-muted-foreground">{t('guide.dashboard_desc')}</p>
                            <div className="rounded-lg overflow-hidden border shadow-sm">
                                <img src="/manual_images/dashboard_guide.png" alt="Dashboard" className="w-full h-auto" />
                            </div>
                            <ul className="space-y-2 text-sm ml-4 list-disc text-muted-foreground">
                                <li>
                                    <span className="font-semibold text-foreground">{t('dashboard.net_monthly')}:</span> {t('guide.dashboard_net_desc')}
                                </li>
                                <li>
                                    <span className="font-semibold text-foreground">{t('dashboard.obligations_breakdown')}:</span> {t('guide.dashboard_obligation_desc')}
                                </li>
                            </ul>
                        </section>

                        {/* 3. Transactions */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-primary">{t('guide.transaction_title')}</h3>
                            <div className="rounded-lg overflow-hidden border shadow-sm">
                                <img src="/manual_images/transactions_guide.png" alt="Transactions" className="w-full h-auto" />
                            </div>
                            <p className="text-muted-foreground text-sm">{t('guide.transaction_desc')}</p>
                        </section>

                        {/* 4. Obligations */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-primary">{t('guide.obligation_title')}</h3>
                            <div className="rounded-lg overflow-hidden border shadow-sm">
                                <img src="/manual_images/obligation_modal_guide.png" alt="Obligations" className="w-full h-auto" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">{t('guide.ob_installment')}</h4>
                                    <p className="text-xs text-muted-foreground">{t('guide.ob_installment_desc')}</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">{t('guide.ob_credit_card')}</h4>
                                    <p className="text-xs text-muted-foreground">{t('guide.ob_credit_card_desc')}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-3 rounded text-xs border border-amber-200 dark:border-amber-900">
                                <strong>⚠️ {t('guide.note')}:</strong> {t('guide.credit_limit_warning')}
                            </div>
                        </section>

                        {/* 5. Calendar */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-primary">{t('guide.calendar_title')}</h3>
                            <div className="rounded-lg overflow-hidden border shadow-sm">
                                <img src="/manual_images/calendar_guide.png" alt="Calendar" className="w-full h-auto" />
                            </div>
                            <p className="text-muted-foreground text-sm">{t('guide.calendar_desc')}</p>
                        </section>

                        {/* 6. Settings */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-primary">{t('settings.page_title')}</h3>
                            <div className="rounded-lg overflow-hidden border shadow-sm">
                                <img src="/manual_images/settings_guide.png" alt="Settings" className="w-full h-auto" />
                            </div>
                            <p className="text-muted-foreground text-sm">{t('guide.settings_desc')}</p>
                        </section>

                        <hr className="my-8" />
                        <p className="text-center text-xs text-muted-foreground">
                            Cash Flow Manager v1.0 • Built with AI Agentic Coding
                        </p>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
