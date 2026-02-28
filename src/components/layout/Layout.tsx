import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  FlaskConical, 
  ClipboardCheck,
  MessageSquare,
  ChevronRight,
  Cake,
  MoreHorizontal
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
  { id: 'customers', label: '客户', icon: Users },
  { id: 'orders', label: '订单', icon: ShoppingCart },
  { id: 'quotes', label: '报价', icon: FileText },
  { id: 'samples', label: '打样', icon: FlaskConical },
  { id: 'qc', label: '品控', icon: ClipboardCheck },
  { id: 'followups', label: '跟进', icon: MessageSquare },
  { id: 'analytics', label: '看板', icon: BarChart3 },
]

// 移动端底部导航显示的主要项目
const mobileMainItems = menuItems.slice(0, 4)
const mobileMoreItems = menuItems.slice(4)

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const currentUser = useAppStore((state) => state.currentUser)

  const isInMoreItems = mobileMoreItems.some(item => item.id === currentPage)

  return (
    <div className="h-full bg-bg-secondary flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
            <Cake className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">烘焙CRM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {currentUser?.name.charAt(0)}
            </span>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-bg-sidebar text-white transition-all duration-300 flex-shrink-0',
          sidebarOpen ? 'w-64' : 'w-20'
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollable-content">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
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

        {/* Collapse button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center py-3 border-t border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronRight className={cn(
            'w-5 h-5 transition-transform',
            sidebarOpen && 'rotate-180'
          )} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollable-content p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around z-50 bottom-nav-safe">
        {mobileMainItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id)
                setMoreMenuOpen(false)
              }}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          )
        })}
        
        {/* More button */}
        <div className="relative">
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors',
              isInMoreItems || moreMenuOpen ? 'text-primary-600' : 'text-gray-500'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">更多</span>
          </button>
          
          {/* More menu popup */}
          {moreMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setMoreMenuOpen(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[140px]">
                {mobileMoreItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.id
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id)
                        setMoreMenuOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                        isActive 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}
