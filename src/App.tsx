import { useNavigate, useLocation, Routes, Route, Link } from "react-router-dom"
import { LayoutDashboard, Calendar as CalendarIcon, List, Loader2, Settings, Cloud, CloudOff, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { lazy, Suspense } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"

// Lazy load feature components for performance
const DashboardPage = lazy(() => import("@/features/Dashboard/DashboardPage").then(module => ({ default: module.DashboardPage })))
const CalendarView = lazy(() => import("@/features/Calendar/CalendarView").then(module => ({ default: module.CalendarView })))
const TransactionsPage = lazy(() => import("@/features/Transactions/TransactionsPage").then(module => ({ default: module.TransactionsPage })))
const SettingsPage = lazy(() => import("@/features/Settings/SettingsPage").then(module => ({ default: module.SettingsPage })))
const PinLock = lazy(() => import("@/components/PinLock").then(module => ({ default: module.PinLock })))
const LoginPage = lazy(() => import("@/features/Auth/LoginPage").then(module => ({ default: module.LoginPage })))

function SyncIndicator() {
  const { isSyncing, lastSyncedAt, error } = useFinanceStore()
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-[10px] font-medium text-muted-foreground transition-all">
      {isSyncing ? (
        <>
          <Cloud className="h-3 w-3 animate-pulse text-primary" />
          <span>{t('auth.syncing')}</span>
        </>
      ) : error === 'auth.cloud_sync_error' ? (
        <>
          <CloudOff className="h-3 w-3 text-destructive" />
          <span>{t('auth.sync_error')}</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span>
            {t('auth.sync_success')}
            {lastSyncedAt && ` ${format(new Date(lastSyncedAt), 'HH:mm')}`}
          </span>
        </>
      )}
    </div>
  )
}

function App() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useFinanceStore()

  const isDashboard = location.pathname === '/'
  const isCalendar = location.pathname === '/calendar'
  const isTransactions = location.pathname.startsWith('/transactions')
  const isSettings = location.pathname === '/settings'

  if (!profile) {
    return (
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6 pb-20">
        <header className="flex justify-between items-start mb-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-1"
          >
            <Link to="/">
              <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            </Link>
            <SyncIndicator />
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => navigate('/')}
                title={t('nav.dashboard')}
                className={`p-2 rounded-md transition-all relative ${isDashboard ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {isDashboard && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-background shadow-sm rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <LayoutDashboard className="h-4 w-4 relative z-10" />
              </button>
              <button
                onClick={() => navigate('/calendar')}
                title={t('nav.calendar')}
                className={`p-2 rounded-md transition-all relative ${isCalendar ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {isCalendar && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-background shadow-sm rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <CalendarIcon className="h-4 w-4 relative z-10" />
              </button>
              <button
                onClick={() => navigate('/transactions')}
                title={t('nav.transactions')}
                className={`p-2 rounded-md transition-all relative ${isTransactions ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {isTransactions && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-background shadow-sm rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <List className="h-4 w-4 relative z-10" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                title={t('nav.settings')}
                className={`p-2 rounded-md transition-all relative ${isSettings ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {isSettings && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-background shadow-sm rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Settings className="h-4 w-4 relative z-10" />
              </button>
            </div>
          </motion.div>
        </header>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">{t('common.loading_app')}</p>
          </div>
        }>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
        <PinLock />
      </div>
    </div>
  )
}

export default App
