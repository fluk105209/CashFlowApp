import { useNavigate, useLocation, Routes, Route, Link } from "react-router-dom"
import { LayoutDashboard, Calendar as CalendarIcon, List, Loader2, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { lazy, Suspense } from "react"
import { useFinanceStore } from "@/stores/useFinanceStore"

// Lazy load feature components for performance
const DashboardPage = lazy(() => import("@/features/Dashboard/DashboardPage").then(module => ({ default: module.DashboardPage })))
const CalendarView = lazy(() => import("@/features/Calendar/CalendarView").then(module => ({ default: module.CalendarView })))
const TransactionsPage = lazy(() => import("@/features/Transactions/TransactionsPage").then(module => ({ default: module.TransactionsPage })))
const SettingsPage = lazy(() => import("@/features/Settings/SettingsPage").then(module => ({ default: module.SettingsPage })))
const PinLock = lazy(() => import("@/components/PinLock").then(module => ({ default: module.PinLock })))
const LoginPage = lazy(() => import("@/features/Auth/LoginPage").then(module => ({ default: module.LoginPage })))

function App() {
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
        <header className="flex justify-between items-center mb-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/">
              <h1 className="text-2xl font-bold tracking-tight">Cash Flow</h1>
              <p className="text-sm text-muted-foreground">Manage your finances</p>
            </Link>
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
            <p className="text-sm text-muted-foreground">Loading your financial view...</p>
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
