import { useNavigate, useLocation, Routes, Route } from "react-router-dom"
import { Home, Calendar as CalendarIcon, List, Settings, Cloud, CloudOff, CheckCircle2, User, Loader2, Plus } from "lucide-react"
import { UnifiedAddModal } from "@/components/UnifiedAddModal"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { lazy, Suspense, useEffect } from "react"
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'
import { useFinanceStore } from "@/stores/useFinanceStore"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"

// Lazy load feature components for performance
const DashboardPage = lazy(() => import("@/features/Dashboard/DashboardPage").then(module => ({ default: module.DashboardPage })))
const CalendarView = lazy(() => import("@/features/Calendar/CalendarView").then(module => ({ default: module.CalendarView })))
const TransactionsPage = lazy(() => import("@/features/Transactions/TransactionsPage").then(module => ({ default: module.TransactionsPage })))
const SettingsPage = lazy(() => import("@/features/Settings/SettingsPage").then(module => ({ default: module.SettingsPage })))
const CategoryColorsPage = lazy(() => import("@/features/Settings/CategoryColorsPage").then(module => ({ default: module.CategoryColorsPage })))
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
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [prefillData, setPrefillData] = useState<any>(null)

  useEffect(() => {
    const handleOpenAdd = (e: any) => {
      setPrefillData(e.detail || null)
      setAddModalOpen(true)
    }
    window.addEventListener('open-unified-add', handleOpenAdd)
    return () => window.removeEventListener('open-unified-add', handleOpenAdd)
  }, [])

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const theme = savedTheme || systemTheme

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // Sync Native Status Bar
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setStyle({
          style: theme === 'dark' ? Style.Dark : Style.Light
        }).catch(err => console.error('StatusBar error:', err))
      } catch (err) {
        console.error('StatusBar not available:', err)
      }
    }
  }, [])

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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased p-4 md:p-8 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
      <div className="max-w-md mx-auto space-y-6 pb-20">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background shadow-sm overflow-hidden text-primary">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('common.welcome', { defaultValue: 'Welcome' })}</span>
              <h1 className="text-lg font-bold tracking-tight text-primary leading-tight">
                {profile?.user_id_text || 'User'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SyncIndicator />
          </div>
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
              <Route path="/settings/category-colors" element={<CategoryColorsPage />} />
            </Routes>
          </AnimatePresence>
        </Suspense>

        <PinLock />

        <UnifiedAddModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          prefillData={prefillData}
        />

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[2rem] px-4 py-3 z-50 flex justify-between items-center">
          <NavButton
            active={isDashboard}
            onClick={() => navigate('/')}
            icon={<Home className="h-5 w-5" />}
          />
          <NavButton
            active={isTransactions}
            onClick={() => navigate('/transactions')}
            icon={<List className="h-5 w-5" />}
          />

          <div className="flex-shrink-0 -mt-8">
            <div className="bg-background rounded-full p-2 shadow-lg">
              <button
                onClick={() => {
                  // This will need a way to open the modal
                  window.dispatchEvent(new CustomEvent('open-unified-add'));
                }}
                className="w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                <Plus className="w-7 h-7 stroke-[3]" />
              </button>
            </div>
          </div>

          <NavButton
            active={isCalendar}
            onClick={() => navigate('/calendar')}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <NavButton
            active={isSettings}
            onClick={() => navigate('/settings')}
            icon={<Settings className="h-5 w-5" />}
          />
        </nav>
      </div>
    </div>
  )
}

function NavButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary active:scale-95'}`}
    >
      {active && (
        <motion.div
          layoutId="navActive"
          className="absolute inset-0 bg-primary/10 rounded-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative z-10">{icon}</div>
    </button>
  )
}

export default App
