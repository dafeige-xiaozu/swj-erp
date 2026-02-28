import { useState } from 'react'
import { 
  Plus, 
  Search, 
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  History
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
import type { Quote } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const quoteStatusConfig = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  PENDING: { label: '待审批', color: 'bg-warning-100 text-warning-700' },
  APPROVED: { label: '已通过', color: 'bg-success-100 text-success-700' },
  REJECTED: { label: '已拒绝', color: 'bg-danger-100 text-danger-700' },
  EXPIRED: { label: '已过期', color: 'bg-gray-100 text-gray-500' },
}

export function QuotesPage() {
  const { 
    quotes, 
    customers, 
    products,
    addQuote, 
    updateQuote,
    getCustomerById,
    getProductById,
    currentUser
  } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Quote['status'] | 'ALL'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    unitPrice: 0,
    minOrderQty: 50,
    validUntil: '',
    status: 'DRAFT' as Quote['status'],
    remark: '',
    createdBy: currentUser?.id || '',
  })

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const customer = getCustomerById(quote.customerId)
    const product = getProductById(quote.productId)
    
    const matchesSearch = 
      quote.quoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.productId || formData.unitPrice <= 0) {
      toast('error', '请填写必要信息')
      return
    }

    if (editingQuote) {
      updateQuote(editingQuote.id, formData)
      toast('success', '报价已更新')
    } else {
      addQuote(formData)
      toast('success', '报价创建成功')
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      customerId: '',
      productId: '',
      unitPrice: 0,
      minOrderQty: 50,
      validUntil: '',
      status: 'DRAFT',
      remark: '',
      createdBy: currentUser?.id || '',
    })
    setEditingQuote(null)
  }

  const openEditModal = (quote: Quote) => {
    setEditingQuote(quote)
    setFormData({
      customerId: quote.customerId,
      productId: quote.productId,
      unitPrice: quote.unitPrice,
      minOrderQty: quote.minOrderQty,
      validUntil: quote.validUntil,
      status: quote.status,
      remark: quote.remark || '',
      createdBy: quote.createdBy,
    })
    setIsModalOpen(true)
    setActiveDropdown(null)
  }

  const openDetail = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsDetailOpen(true)
    setActiveDropdown(null)
  }

  const handleApprove = (id: string) => {
    updateQuote(id, { status: 'APPROVED' })
    toast('success', '报价已通过')
    setActiveDropdown(null)
  }

  const handleReject = (id: string) => {
    updateQuote(id, { status: 'REJECTED' })
    toast('warning', '报价已拒绝')
    setActiveDropdown(null)
  }

  const activeCustomers = customers.filter(c => ['ACTIVE', 'NEGOTIATING', 'POTENTIAL'].includes(c.status))

  // Get quote history for a specific customer+product
  const getQuoteHistory = (customerId: string, productId: string) => {
    return quotes
      .filter(q => q.customerId === customerId && q.productId === productId)
      .sort((a, b) => b.version - a.version)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报价管理</h1>
          <p className="text-gray-500 mt-1">管理产品报价和历史版本</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" />
          新建报价
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索报价单号、客户、产品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Quote['status'] | 'ALL')}
            options={[
              { value: 'ALL', label: '全部状态' },
              ...Object.entries(quoteStatusConfig).map(([value, config]) => ({
                value,
                label: config.label,
              })),
            ]}
            className="w-32"
          />
        </div>
      </Card>

      {/* Quote List */}
      {filteredQuotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="暂无报价"
          description="开始创建您的第一个报价单"
          action={
            <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
              <Plus className="w-4 h-4" />
              新建报价
            </Button>
          }
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">报价单号</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">客户</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">产品</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">规格</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">克重</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">单价</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">起订量</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">有效期至</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">版本</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">状态</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuotes.map((quote) => {
                  const customer = getCustomerById(quote.customerId)
                  const product = getProductById(quote.productId)
                  const isExpired = new Date(quote.validUntil) < new Date()
                  
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{quote.quoteNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer?.shortName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product?.spec || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product?.weight ? `${product.weight}g` : '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-600">{formatCurrency(quote.unitPrice)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{quote.minOrderQty}</td>
                      <td className={cn('px-6 py-4 text-sm', isExpired ? 'text-danger-600' : 'text-gray-600')}>
                        {formatDate(quote.validUntil)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">v{quote.version}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${quoteStatusConfig[quote.status].color}`}>
                          {quoteStatusConfig[quote.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === quote.id ? null : quote.id)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          
                          {activeDropdown === quote.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveDropdown(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <button
                                  onClick={() => openDetail(quote)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4" />
                                  查看详情
                                </button>
                                {quote.status === 'DRAFT' && (
                                  <button
                                    onClick={() => openEditModal(quote)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit className="w-4 h-4" />
                                    编辑
                                  </button>
                                )}
                                {quote.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(quote.id)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-success-600 hover:bg-success-50"
                                    >
                                      <Check className="w-4 h-4" />
                                      通过
                                    </button>
                                    <button
                                      onClick={() => handleReject(quote.id)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
                                    >
                                      <X className="w-4 h-4" />
                                      拒绝
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm() }}
        title={editingQuote ? '编辑报价' : '新建报价'}
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
              label="单价 (元)"
              type="number"
              min={0}
              step={0.01}
              value={formData.unitPrice || ''}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="最小起订量"
              type="number"
              min={1}
              value={formData.minOrderQty || ''}
              onChange={(e) => setFormData({ ...formData, minOrderQty: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="有效期至"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>

          <Select
            label="状态"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Quote['status'] })}
            options={[
              { value: 'DRAFT', label: '草稿' },
              { value: 'PENDING', label: '提交审批' },
            ]}
          />

          <Textarea
            label="备注"
            placeholder="报价备注..."
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>
              取消
            </Button>
            <Button type="submit">
              {editingQuote ? '保存' : '创建'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="报价详情"
        size="lg"
      >
        {selectedQuote && (() => {
          const customer = getCustomerById(selectedQuote.customerId)
          const product = getProductById(selectedQuote.productId)
          const history = getQuoteHistory(selectedQuote.customerId, selectedQuote.productId)
          
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedQuote.quoteNo}</h2>
                  <p className="text-gray-500">版本 {selectedQuote.version}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${quoteStatusConfig[selectedQuote.status].color}`}>
                  {quoteStatusConfig[selectedQuote.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">客户</p>
                  <p className="font-medium">{customer?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">产品</p>
                  <p className="font-medium">{product?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">单价</p>
                  <p className="font-medium text-primary-600">{formatCurrency(selectedQuote.unitPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">最小起订量</p>
                  <p className="font-medium">{selectedQuote.minOrderQty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">有效期至</p>
                  <p className="font-medium">{formatDate(selectedQuote.validUntil)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">创建日期</p>
                  <p className="font-medium">{formatDate(selectedQuote.createdAt)}</p>
                </div>
                {selectedQuote.remark && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">备注</p>
                    <p className="font-medium">{selectedQuote.remark}</p>
                  </div>
                )}
              </div>

              {/* Quote History */}
              {history.length > 1 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    历史版本
                  </h3>
                  <div className="space-y-2">
                    {history.map((q) => (
                      <div 
                        key={q.id} 
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg',
                          q.id === selectedQuote.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                        )}
                      >
                        <div>
                          <p className="font-medium">v{q.version}</p>
                          <p className="text-sm text-gray-500">{formatDate(q.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(q.unitPrice)}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${quoteStatusConfig[q.status].color}`}>
                            {quoteStatusConfig[q.status].label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
