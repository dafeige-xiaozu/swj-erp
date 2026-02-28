import { 
  ShoppingCart, 
  Users, 
  FileText, 
  FlaskConical, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import { orderStatusConfig, sampleStatusConfig, customerStatusConfig } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardProps {
  onNavigate: (page: 'customers' | 'orders' | 'quotes' | 'samples' | 'qc' | 'followups') => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { orders, customers, samples, quotes, getCustomerById, getProductById } = useAppStore()

  // Stats calculations
  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status))
  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE')
  const pendingQuotes = quotes.filter(q => q.status === 'PENDING')
  const activeSamples = samples.filter(s => !['PASSED', 'TERMINATED'].includes(s.status))
  
  // Orders due soon (within 3 days)
  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  const urgentOrders = orders.filter(o => {
    if (['COMPLETED', 'CANCELLED', 'SHIPPED'].includes(o.status)) return false
    const deliveryDate = new Date(o.deliveryDate)
    return deliveryDate <= threeDaysLater
  })

  // Total sales this month
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const monthlyOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate)
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
  })
  const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0)

  const stats = [
    { 
      label: '进行中订单', 
      value: activeOrders.length, 
      icon: ShoppingCart, 
      color: 'bg-primary-500',
      onClick: () => onNavigate('orders')
    },
    { 
      label: '合作客户', 
      value: activeCustomers.length, 
      icon: Users, 
      color: 'bg-success-500',
      onClick: () => onNavigate('customers')
    },
    { 
      label: '待审批报价', 
      value: pendingQuotes.length, 
      icon: FileText, 
      color: 'bg-accent-500',
      onClick: () => onNavigate('quotes')
    },
    { 
      label: '进行中打样', 
      value: activeSamples.length, 
      icon: FlaskConical, 
      color: 'bg-purple-500',
      onClick: () => onNavigate('samples')
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">欢迎回来，今天是 {formatDate(new Date())}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.label} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.onClick}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 md:p-3 rounded-lg md:rounded-xl`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Monthly Sales */}
      <Card>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl md:rounded-2xl">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">本月销售额</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(monthlySales)}</p>
            <p className="text-xs md:text-sm text-gray-400">{monthlyOrders.length} 笔订单</p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Urgent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              即将交付 ({urgentOrders.length})
            </CardTitle>
          </CardHeader>
          {urgentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无紧急订单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentOrders.slice(0, 5).map((order) => {
                const customer = getCustomerById(order.customerId)
                const product = getProductById(order.productId)
                const daysLeft = Math.ceil((new Date(order.deliveryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('orders')}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{order.orderNo}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {customer?.shortName} · {product?.name}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${orderStatusConfig[order.status].color}`}>
                        {orderStatusConfig[order.status].label}
                      </span>
                      <p className={`text-xs mt-1 ${daysLeft <= 1 ? 'text-danger-600 font-medium' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {daysLeft <= 0 ? '今日交付' : `${daysLeft}天后交付`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              待确认订单 ({pendingOrders.length})
            </CardTitle>
          </CardHeader>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无待确认订单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.slice(0, 5).map((order) => {
                const customer = getCustomerById(order.customerId)
                const product = getProductById(order.productId)
                
                return (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('orders')}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{order.orderNo}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {customer?.shortName} · {product?.name}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{order.quantity} {order.unit}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Active Samples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-500" />
              打样进度
            </CardTitle>
          </CardHeader>
          {activeSamples.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无进行中打样</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSamples.slice(0, 5).map((sample) => {
                const customer = getCustomerById(sample.customerId)
                
                return (
                  <div 
                    key={sample.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('samples')}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{sample.productName}</p>
                      <p className="text-sm text-gray-500 truncate">{customer?.shortName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sampleStatusConfig[sample.status].color}`}>
                      {sampleStatusConfig[sample.status].label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-success-500" />
              客户动态
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {customers.slice(0, 5).map((customer) => (
              <div 
                key={customer.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onNavigate('customers')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {customer.shortName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{customer.shortName}</p>
                    <p className="text-sm text-gray-500">{customer.region}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${customerStatusConfig[customer.status].color}`}>
                  {customerStatusConfig[customer.status].label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
