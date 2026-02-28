import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  FlaskConical, 
  ClipboardCheck,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Cake
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { userRoleConfig } from '@/types'
import { BarChart3 } from 'lucide-react'

type Page = 'dashboard' | 'customers' | 'orders' | 'quotes' | 'samples' | 'qc' | 'followups' | 'analytics'

interface LayoutProps {
  children: React.ReactNode
  currentPage: Page
  onPageChange: (page: Page) => void
}

const menuItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'customers', label: '客户档案', icon: Users },
  { id: 'orders', label: '订单管理', icon: ShoppingCart },
  { id: 'quotes', label: '报价管理', icon: FileText },
  { id: 'samples', label: '打样管理', icon: FlaskConical },
  { id: 'qc', label: '品控管理', icon: ClipboardCheck },
  { id: 'followups', label: '跟进记录', icon: MessageSquare },
  { id: 'analytics', label: '数据看板', icon: BarChart3 },
]

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentUser = useAppStore((state) => state.currentUser)

  return (
    <div className="min-h-screen bg-bg-secondary flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-bg-sidebar text-white transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
            <Cake className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold whitespace-nowrap">烘焙代工CRM</h1>
              <p className="text-xs text-gray-400">管理系统</p>
            </div>
          )}
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden ml-auto p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      isActive 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className={cn(
            'flex items-center gap-3',
            !sidebarOpen && 'justify-center'
          )}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">
                {currentUser?.name.charAt(0)}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser && userRoleConfig[currentUser.role]?.label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse button - desktop only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center py-3 border-t border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronRight className={cn(
            'w-5 h-5 transition-transform',
            sidebarOpen && 'rotate-180'
          )} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
