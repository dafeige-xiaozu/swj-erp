import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Package,
  Calendar,
  Truck,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowRight
} from 'lucide-react'
import { 
  Button, 
  Input, 
  Select, 
  Card, 
  Modal, 
  toast, 
  EmptyState,
  Textarea
} from '@/components/ui'
import { useAppStore } from '@/lib/store'
import type { 
  Order, 
  OrderStatus
} from '@/types'
import { orderStatusConfig } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'kanban'

const orderStatusFlow: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'SCHEDULED', 'PRODUCING', 'QC', 'SHIPPED', 'COMPLETED'
]

export function OrdersPage() {
  const { 
    orders, 
    customers, 
    products,
    addOrder, 
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getCustomerById,
    getProductById
  } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    quantity: 0,
    unit: '箱',
    unitPrice: 0,
    status: 'PENDING' as OrderStatus,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    remark: '',
  })

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const customer = getCustomerById(order.customerId)
    const product = getProductById(order.productId)
    
    const matchesSearch = 
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Group orders by status for kanban view
  const ordersByStatus = orderStatusFlow.reduce((acc, status) => {
    acc[status] = filteredOrders.filter(o => o.status === status)
    return acc
  }, {} as Record<OrderStatus, Order[]>)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.productId || formData.quantity <= 0) {
      toast('error', '请填写必要信息')
      return
    }

    const totalAmount = formData.quantity * formData.unitPrice

    if (editingOrder) {
      updateOrder(editingOrder.id, { ...formData, totalAmount })
      toast('success', '订单已更新')
    } else {
      addOrder({ ...formData, totalAmount })
      toast('success', '订单创建成功')
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      customerId: '',
      productId: '',
      quantity: 0,
      unit: '箱',
      unitPrice: 0,
      status: 'PENDING',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      remark: '',
    })
    setEditingOrder(null)
  }

  const openEditModal = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customerId: order.customerId,
      productId: order.productId,
      quantity: order.quantity,
      unit: order.unit,
      unitPrice: order.unitPrice,
      status: order.status,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      remark: order.remark || '',
    })
    setIsModalOpen(true)
    setActiveDropdown(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个订单吗？')) {
      deleteOrder(id)
      toast('success', '订单已删除')
    }
    setActiveDropdown(null)
  }

  const openDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
    setActiveDropdown(null)
  }

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
    toast('success', `订单状态已更新为${orderStatusConfig[newStatus].label}`)
  }

  const activeCustomers = customers.filter(c => c.status === 'ACTIVE' || c.status === 'NEGOTIATING')

  const OrderCard = ({ order }: { order: Order }) => {
    const customer = getCustomerById(order.customerId)
    const product = getProductById(order.productId)
    const today = new Date()
    const deliveryDate = new Date(order.deliveryDate)
    const daysLeft = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const isUrgent = daysLeft <= 3 && !['COMPLETED', 'CANCELLED', 'SHIPPED'].includes(order.status)

    return (
      <div 
        className={cn(
          'bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all',
          isUrgent && 'border-warning-300 bg-warning-50/50'
        )}
        onClick={() => openDetail(order)}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{order.orderNo}</p>
            <p className="text-xs text-gray-500">{customer?.shortName}</p>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActiveDropdown(activeDropdown === order.id ? null : order.id)
              }}
              className="p-1 rounded hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {activeDropdown === order.id && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(null) }}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); openDetail(order) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    详情
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(order) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(order.id) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <p className="text-sm font-medium text-gray-800 mb-2">{product?.name}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{order.quantity} {order.unit}</span>
          <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
        </div>
        
        <div className={cn(
          'flex items-center gap-1 text-xs',
          isUrgent ? 'text-warning-600' : 'text-gray-500'
        )}>
          <Calendar className="w-3 h-3" />
          <span>交付: {formatDate(order.deliveryDate)}</span>
          {isUrgent && daysLeft > 0 && <span className="font-medium">({daysLeft}天)</span>}
          {isUrgent && daysLeft <= 0 && <span className="font-medium text-danger-600">(今日)</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-500 mt-1">跟踪订单全流程状态</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" />
          新建订单
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索订单号、客户、产品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
              options={[
                { value: 'ALL', label: '全部状态' },
                ...Object.entries(orderStatusConfig).map(([value, config]) => ({
                  value,
                  label: config.label,
                })),
              ]}
              className="w-32"
            />
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'px-3 py-2 text-sm',
                  viewMode === 'kanban' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                看板
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 text-sm border-l border-gray-300',
                  viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                列表
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {orderStatusFlow.map((status) => {
              const statusOrders = ordersByStatus[status] || []
              const config = orderStatusConfig[status]
              
              return (
                <div key={status} className="w-72 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-sm text-gray-500">{statusOrders.length}</span>
                    </div>
                  </div>
                  <div className="space-y-3 min-h-[200px] bg-gray-100 rounded-xl p-3">
                    {statusOrders.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        暂无订单
                      </div>
                    ) : (
                      statusOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        filteredOrders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="暂无订单"
            description="开始创建您的第一个订单"
            action={
              <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
                <Plus className="w-4 h-4" />
                新建订单
              </Button>
            }
          />
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">订单号</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">客户</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">产品</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">数量</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">金额</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">交付日期</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">状态</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const customer = getCustomerById(order.customerId)
                    const product = getProductById(order.productId)
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{customer?.shortName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.quantity} {order.unit}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.deliveryDate)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusConfig[order.status].color}`}>
                            {orderStatusConfig[order.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetail(order)}
                              className="p-1 text-gray-400 hover:text-primary-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(order)}
                              className="p-1 text-gray-400 hover:text-primary-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm() }}
        title={editingOrder ? '编辑订单' : '新建订单'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="客户"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              options={[
                { value: '', label: '请选择客户' },
                ...activeCustomers.map(c => ({ value: c.id, label: c.shortName }))
              ]}
            />
            <Select
              label="产品"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              options={[
                { value: '', label: '请选择产品' },
                ...products.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="数量"
              type="number"
              min={1}
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="单位"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
            <Input
              label="单价 (元)"
              type="number"
              min={0}
              step={0.01}
              value={formData.unitPrice || ''}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">订单总额</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(formData.quantity * formData.unitPrice)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="下单日期"
              type="date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
            />
            <Input
              label="交付日期"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            />
          </div>

          {editingOrder && (
            <Select
              label="订单状态"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
              options={Object.entries(orderStatusConfig).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
          )}

          <Textarea
            label="备注"
            placeholder="订单备注..."
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>
              取消
            </Button>
            <Button type="submit">
              {editingOrder ? '保存' : '创建'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="订单详情"
        size="lg"
      >
        {selectedOrder && (() => {
          const customer = getCustomerById(selectedOrder.customerId)
          const product = getProductById(selectedOrder.productId)
          const currentStatusIndex = orderStatusFlow.indexOf(selectedOrder.status)
          
          return (
            <div className="space-y-6">
              {/* Order header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNo}</h2>
                  <p className="text-gray-500">{customer?.companyName}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${orderStatusConfig[selectedOrder.status].color}`}>
                  {orderStatusConfig[selectedOrder.status].label}
                </span>
              </div>

              {/* Status Flow */}
              {selectedOrder.status !== 'CANCELLED' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {orderStatusFlow.map((status, index) => {
                    const isCompleted = index < currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    const config = orderStatusConfig[status]
                    
                    return (
                      <div key={status} className="flex items-center">
                        <button
                          onClick={() => {
                            if (index === currentStatusIndex + 1) {
                              handleStatusChange(selectedOrder.id, status)
                            }
                          }}
                          disabled={index > currentStatusIndex + 1}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                            isCompleted && 'bg-success-100 text-success-700',
                            isCurrent && config.color,
                            !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400',
                            index === currentStatusIndex + 1 && 'cursor-pointer hover:ring-2 hover:ring-primary-300'
                          )}
                        >
                          {config.label}
                        </button>
                        {index < orderStatusFlow.length - 1 && (
                          <ArrowRight className={cn(
                            'w-4 h-4 mx-1 flex-shrink-0',
                            index < currentStatusIndex ? 'text-success-500' : 'text-gray-300'
                          )} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">产品</p>
                  <p className="font-medium">{product?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">数量</p>
                  <p className="font-medium">{selectedOrder.quantity} {selectedOrder.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">单价</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.unitPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">总金额</p>
                  <p className="font-medium text-primary-600">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">下单日期</p>
                  <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">交付日期</p>
                  <p className="font-medium">{formatDate(selectedOrder.deliveryDate)}</p>
                </div>
                {selectedOrder.shippedDate && (
                  <div>
                    <p className="text-sm text-gray-500">发货日期</p>
                    <p className="font-medium">{formatDate(selectedOrder.shippedDate)}</p>
                  </div>
                )}
                {selectedOrder.remark && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">备注</p>
                    <p className="font-medium">{selectedOrder.remark}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                  关闭
                </Button>
                <Button onClick={() => { openEditModal(selectedOrder); setIsDetailOpen(false) }}>
                  <Edit className="w-4 h-4" />
                  编辑
                </Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
