import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  MapPin,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FlaskConical,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { 
    orders, 
    customers, 
    samples, 
    qcRecords,
    users,
    getCustomerById
  } = useAppStore()

  // ===== Sales Dashboard Stats =====
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // Monthly orders
  const monthlyOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate)
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
  })
  const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  
  // Last month for comparison
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const lastMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate)
    return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear
  })
  const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const salesGrowth = lastMonthSales > 0 
    ? ((monthlySales - lastMonthSales) / lastMonthSales * 100).toFixed(1) 
    : '100'

  // Customer distribution by region
  const customersByRegion = customers.reduce((acc, c) => {
    const region = c.region || '其他'
    acc[region] = (acc[region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Customer distribution by type
  const customersByType = customers.reduce((acc, c) => {
    acc[c.customerType] = (acc[c.customerType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Top customers by order amount
  const customerOrderTotals = orders.reduce((acc, o) => {
    acc[o.customerId] = (acc[o.customerId] || 0) + o.totalAmount
    return acc
  }, {} as Record<string, number>)

  const topCustomers = Object.entries(customerOrderTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerId, total]) => ({
      customer: getCustomerById(customerId),
      total
    }))

  // Order trend - last 6 months
  const orderTrend = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(currentYear, currentMonth - 5 + i, 1)
    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.orderDate)
      return orderDate.getMonth() === month.getMonth() && 
             orderDate.getFullYear() === month.getFullYear()
    })
    return {
      month: month.toLocaleDateString('zh-CN', { month: 'short' }),
      count: monthOrders.length,
      amount: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    }
  })

  // Delivery rate
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')
  const onTimeDeliveries = completedOrders.filter(o => {
    if (!o.shippedDate) return false
    return new Date(o.shippedDate) <= new Date(o.deliveryDate)
  })
  const deliveryRate = completedOrders.length > 0 
    ? ((onTimeDeliveries.length / completedOrders.length) * 100).toFixed(1)
    : '100'

  // Sales person performance
  const salesUsers = users.filter(u => ['SALES', 'SALES_MANAGER'].includes(u.role))
  const salesPerformance = salesUsers.map(user => {
    const userOrders = orders.filter(o => {
      const customer = getCustomerById(o.customerId)
      return customer?.ownerId === user.id
    })
    return {
      user,
      orderCount: userOrders.length,
      totalAmount: userOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    }
  }).sort((a, b) => b.totalAmount - a.totalAmount)

  // ===== R&D Dashboard Stats =====
  const samplesByStatus = samples.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const passedSamples = samples.filter(s => s.status === 'PASSED')
  const terminatedSamples = samples.filter(s => s.status === 'TERMINATED')
  const totalCompletedSamples = passedSamples.length + terminatedSamples.length
  const sampleSuccessRate = totalCompletedSamples > 0 
    ? ((passedSamples.length / totalCompletedSamples) * 100).toFixed(1)
    : '0'

  // Average sample cycle (days)
  const completedSamplesWithDates = samples.filter(s => s.completedDate && s.status === 'PASSED')
  const avgSampleCycle = completedSamplesWithDates.length > 0
    ? (completedSamplesWithDates.reduce((sum, s) => {
        const start = new Date(s.createdAt)
        const end = new Date(s.completedDate!)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      }, 0) / completedSamplesWithDates.length).toFixed(0)
    : '-'

  // R&D workload
  const rdUsers = users.filter(u => ['RD', 'RD_MANAGER'].includes(u.role))
  const rdWorkload = rdUsers.map(user => {
    const userSamples = samples.filter(s => s.assigneeId === user.id)
    const activeSamples = userSamples.filter(s => !['PASSED', 'TERMINATED'].includes(s.status))
    return {
      user,
      total: userSamples.length,
      active: activeSamples.length
    }
  })

  // ===== QC Dashboard Stats =====
  const qcByResult = qcRecords.reduce((acc, r) => {
    acc[r.result] = (acc[r.result] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const qcPassRate = qcRecords.length > 0 
    ? (((qcByResult['PASS'] || 0) / qcRecords.length) * 100).toFixed(1)
    : '100'

  const qcByType = qcRecords.reduce((acc, r) => {
    acc[r.inspectType] = (acc[r.inspectType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeLabels: Record<string, string> = {
    BRAND: '品牌商',
    RETAILER: '零售商',
    TRADER: '贸易商'
  }

  const maxTrendAmount = Math.max(...orderTrend.map(t => t.amount))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
        <p className="text-gray-500 mt-1">管理层经营数据概览</p>
      </div>

      {/* ===== Sales Dashboard ===== */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          销售看板
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div>
              <p className="text-primary-100 text-sm">本月销售额</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(monthlySales)}</p>
              <p className="text-sm mt-2 flex items-center gap-1">
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-medium',
                  parseFloat(salesGrowth) >= 0 ? 'bg-white/20' : 'bg-red-400/30'
                )}>
                  {parseFloat(salesGrowth) >= 0 ? '+' : ''}{salesGrowth}%
                </span>
                <span className="text-primary-200">环比</span>
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">本月订单</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyOrders.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">客户总数</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-xl">
                <Users className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">准时交付率</p>
                <p className="text-2xl font-bold text-success-600">{deliveryRate}%</p>
              </div>
              <div className="p-3 bg-success-100 rounded-xl">
                <Clock className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                订单趋势 (近6月)
              </CardTitle>
            </CardHeader>
            <div className="flex items-end gap-4 h-48 mt-4">
              {orderTrend.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">{formatCurrency(item.amount)}</span>
                    <div 
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-300"
                      style={{ 
                        height: `${maxTrendAmount > 0 ? (item.amount / maxTrendAmount) * 120 : 0}px`,
                        minHeight: item.amount > 0 ? '20px' : '4px'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{item.month}</span>
                  <span className="text-xs text-gray-400">{item.count}单</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-600" />
                TOP 客户
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 mt-2">
              {topCustomers.map((item, i) => (
                <div key={item.customer?.id} className="flex items-center gap-3">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.customer?.shortName}</p>
                    <p className="text-xs text-gray-500">{item.customer?.region}</p>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {/* Customer Distribution by Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                客户区域分布
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 mt-2">
              {Object.entries(customersByRegion)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([region, count]) => (
                  <div key={region} className="flex items-center gap-3">
                    <span className="flex-1 text-gray-700">{region}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${(count / customers.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-8">{count}</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Customer Distribution by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent-600" />
                客户类型分布
              </CardTitle>
            </CardHeader>
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const total = Object.values(customersByType).reduce((a, b) => a + b, 0)
                    let currentAngle = 0
                    const colors = ['#3b82f6', '#f59e0b', '#10b981']
                    return Object.entries(customersByType).map(([type, count], i) => {
                      const percentage = (count / total) * 100
                      const angle = (percentage / 100) * 360
                      const largeArcFlag = angle > 180 ? 1 : 0
                      const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
                      const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)
                      currentAngle += angle
                      const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
                      const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)
                      
                      return (
                        <path
                          key={type}
                          d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={colors[i % colors.length]}
                        />
                      )
                    })
                  })()}
                </svg>
              </div>
              <div className="space-y-2">
                {Object.entries(customersByType).map(([type, count], i) => {
                  const colors = ['bg-primary-500', 'bg-accent-500', 'bg-success-500']
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                      <span className="text-sm text-gray-600">{typeLabels[type] || type}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Sales Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-success-600" />
                业务员业绩
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 mt-2">
              {salesPerformance.slice(0, 5).map((item) => (
                <div key={item.user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">{item.user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.user.name}</p>
                    <p className="text-xs text-gray-500">{item.orderCount} 单</p>
                  </div>
                  <span className="font-semibold text-primary-600">{formatCurrency(item.totalAmount)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ===== R&D Dashboard ===== */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-purple-600" />
          研发看板
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">进行中打样</p>
                <p className="text-2xl font-bold text-gray-900">
                  {samples.filter(s => !['PASSED', 'TERMINATED'].includes(s.status)).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FlaskConical className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">打样成功率</p>
                <p className="text-2xl font-bold text-success-600">{sampleSuccessRate}%</p>
              </div>
              <div className="p-3 bg-success-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">平均打样周期</p>
                <p className="text-2xl font-bold text-gray-900">{avgSampleCycle} <span className="text-sm font-normal text-gray-500">天</span></p>
              </div>
              <div className="p-3 bg-accent-100 rounded-xl">
                <Clock className="w-6 h-6 text-accent-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总打样数</p>
                <p className="text-2xl font-bold text-gray-900">{samples.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sample Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>打样阶段分布</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { status: 'SUBMITTED', label: '已提交', color: 'bg-gray-100 text-gray-700' },
                { status: 'REVIEWING', label: '评审中', color: 'bg-primary-100 text-primary-700' },
                { status: 'DEVELOPING', label: '开发中', color: 'bg-accent-100 text-accent-700' },
                { status: 'TRIAL', label: '试产中', color: 'bg-warning-100 text-warning-700' },
                { status: 'SENT', label: '已送样', color: 'bg-blue-100 text-blue-700' },
                { status: 'FEEDBACK', label: '待反馈', color: 'bg-purple-100 text-purple-700' },
              ].map(item => (
                <div key={item.status} className={cn('p-3 rounded-lg text-center', item.color)}>
                  <p className="text-2xl font-bold">{samplesByStatus[item.status] || 0}</p>
                  <p className="text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* R&D Workload */}
          <Card>
            <CardHeader>
              <CardTitle>研发工作量</CardTitle>
            </CardHeader>
            <div className="space-y-4 mt-4">
              {rdWorkload.map(item => (
                <div key={item.user.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">{item.user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{item.user.name}</span>
                      <span className="text-sm text-gray-500">{item.active} 进行中 / {item.total} 总计</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${item.total > 0 ? (item.active / Math.max(...rdWorkload.map(r => r.total))) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ===== QC Dashboard ===== */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success-600" />
          品控看板
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总检验数</p>
                <p className="text-2xl font-bold text-gray-900">{qcRecords.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">合格率</p>
                <p className="text-2xl font-bold text-success-600">{qcPassRate}%</p>
              </div>
              <div className="p-3 bg-success-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">不合格数</p>
                <p className="text-2xl font-bold text-danger-600">{qcByResult['FAIL'] || 0}</p>
              </div>
              <div className="p-3 bg-danger-100 rounded-xl">
                <XCircle className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">让步接收</p>
                <p className="text-2xl font-bold text-warning-600">{qcByResult['CONCESSION'] || 0}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* QC Result Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>检验结果分布</CardTitle>
            </CardHeader>
            <div className="flex items-center justify-around mt-6">
              {[
                { result: 'PASS', label: '合格', color: 'text-success-600', bg: 'bg-success-100' },
                { result: 'FAIL', label: '不合格', color: 'text-danger-600', bg: 'bg-danger-100' },
                { result: 'CONCESSION', label: '让步接收', color: 'text-warning-600', bg: 'bg-warning-100' },
              ].map(item => (
                <div key={item.result} className="text-center">
                  <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mx-auto', item.bg)}>
                    <span className={cn('text-2xl font-bold', item.color)}>
                      {qcByResult[item.result] || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* QC by Type */}
          <Card>
            <CardHeader>
              <CardTitle>检验类型分布</CardTitle>
            </CardHeader>
            <div className="space-y-4 mt-4">
              {[
                { type: 'INCOMING', label: '来料检验', color: 'bg-primary-500' },
                { type: 'PROCESS', label: '过程检验', color: 'bg-accent-500' },
                { type: 'FINAL', label: '成品检验', color: 'bg-success-500' },
              ].map(item => {
                const count = qcByType[item.type] || 0
                const maxCount = Math.max(...Object.values(qcByType), 1)
                return (
                  <div key={item.type} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-gray-600">{item.label}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full flex items-center justify-end pr-2', item.color)}
                        style={{ width: `${(count / maxCount) * 100}%`, minWidth: count > 0 ? '40px' : '0' }}
                      >
                        <span className="text-xs font-medium text-white">{count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
