import { useState } from 'react'
import { 
  Plus, 
  Search, 
  ClipboardCheck,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
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
  QcRecord, 
  InspectType, 
  QcResult
} from '@/types'
import {
  inspectTypeConfig,
  qcResultConfig
} from '@/types'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function QcPage() {
  const { 
    qcRecords, 
    orders,
    users,
    addQcRecord, 
    getCustomerById,
    getProductById,
    getUserById,
    currentUser
  } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<InspectType | 'ALL'>('ALL')
  const [resultFilter, setResultFilter] = useState<QcResult | 'ALL'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<QcRecord | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    orderId: '',
    inspectType: 'INCOMING' as InspectType,
    inspectorId: currentUser?.id || '',
    result: 'PASS' as QcResult,
    defectDesc: '',
    inspectDate: new Date().toISOString().slice(0, 16),
  })

  // Filter records
  const filteredRecords = qcRecords.filter(record => {
    const order = orders.find(o => o.id === record.orderId)
    
    const matchesSearch = 
      record.recordNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.orderNo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'ALL' || record.inspectType === typeFilter
    const matchesResult = resultFilter === 'ALL' || record.result === resultFilter
    
    return matchesSearch && matchesType && matchesResult
  })

  // Stats
  const stats = {
    total: qcRecords.length,
    pass: qcRecords.filter(r => r.result === 'PASS').length,
    fail: qcRecords.filter(r => r.result === 'FAIL').length,
    concession: qcRecords.filter(r => r.result === 'CONCESSION').length,
  }
  const passRate = stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(1) : '0'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.orderId) {
      toast('error', '请选择关联订单')
      return
    }

    addQcRecord(formData)
    toast('success', '检验记录已创建')

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      orderId: '',
      inspectType: 'INCOMING',
      inspectorId: currentUser?.id || '',
      result: 'PASS',
      defectDesc: '',
      inspectDate: new Date().toISOString().slice(0, 16),
    })
  }

  const openDetail = (record: QcRecord) => {
    setSelectedRecord(record)
    setIsDetailOpen(true)
  }

  // Get orders that can be inspected
  const inspectableOrders = orders.filter(o => 
    ['PRODUCING', 'QC', 'SCHEDULED'].includes(o.status)
  )

  const qcUsers = users.filter(u => ['QC', 'QC_MANAGER'].includes(u.role))

  const ResultIcon = ({ result }: { result: QcResult }) => {
    switch (result) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-success-500" />
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-danger-500" />
      case 'CONCESSION':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">品控管理</h1>
          <p className="text-gray-500 mt-1">管理质量检验记录</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" />
          新建检验记录
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总检验数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">合格率</p>
              <p className="text-2xl font-bold text-success-600">{passRate}%</p>
            </div>
            <div className="p-3 bg-success-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">不合格</p>
              <p className="text-2xl font-bold text-danger-600">{stats.fail}</p>
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
              <p className="text-2xl font-bold text-warning-600">{stats.concession}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索检验单号、订单号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as InspectType | 'ALL')}
              options={[
                { value: 'ALL', label: '全部类型' },
                ...Object.entries(inspectTypeConfig).map(([value, config]) => ({
                  value,
                  label: config.label,
                })),
              ]}
              className="w-32"
            />
            <Select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as QcResult | 'ALL')}
              options={[
                { value: 'ALL', label: '全部结果' },
                ...Object.entries(qcResultConfig).map(([value, config]) => ({
                  value,
                  label: config.label,
                })),
              ]}
              className="w-32"
            />
          </div>
        </div>
      </Card>

      {/* Record List */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-8 h-8" />}
          title="暂无检验记录"
          description="创建您的第一条检验记录"
          action={
            <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
              <Plus className="w-4 h-4" />
              新建检验记录
            </Button>
          }
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">检验单号</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">关联订单</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">检验类型</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">检验员</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">检验时间</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">结果</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const order = orders.find(o => o.id === record.orderId)
                  const inspector = getUserById(record.inspectorId)
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.recordNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order?.orderNo || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inspectTypeConfig[record.inspectType].label}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{inspector?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(record.inspectDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ResultIcon result={record.result} />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${qcResultConfig[record.result].color}`}>
                            {qcResultConfig[record.result].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDetail(record)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm() }}
        title="新建检验记录"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="关联订单"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            options={[
              { value: '', label: '请选择订单' },
              ...inspectableOrders.map(o => {
                const customer = getCustomerById(o.customerId)
                const product = getProductById(o.productId)
                return { 
                  value: o.id, 
                  label: `${o.orderNo} - ${customer?.shortName} - ${product?.name}` 
                }
              })
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="检验类型"
              value={formData.inspectType}
              onChange={(e) => setFormData({ ...formData, inspectType: e.target.value as InspectType })}
              options={Object.entries(inspectTypeConfig).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
            <Select
              label="检验员"
              value={formData.inspectorId}
              onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })}
              options={qcUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="检验结果"
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value as QcResult })}
              options={Object.entries(qcResultConfig).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
            <Input
              label="检验时间"
              type="datetime-local"
              value={formData.inspectDate}
              onChange={(e) => setFormData({ ...formData, inspectDate: e.target.value })}
            />
          </div>

          {formData.result !== 'PASS' && (
            <Textarea
              label="不良描述"
              placeholder="详细描述发现的问题..."
              value={formData.defectDesc}
              onChange={(e) => setFormData({ ...formData, defectDesc: e.target.value })}
              rows={4}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>
              取消
            </Button>
            <Button type="submit">
              创建
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="检验详情"
        size="lg"
      >
        {selectedRecord && (() => {
          const order = orders.find(o => o.id === selectedRecord.orderId)
          const customer = order ? getCustomerById(order.customerId) : null
          const product = order ? getProductById(order.productId) : null
          const inspector = getUserById(selectedRecord.inspectorId)
          
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRecord.recordNo}</h2>
                  <p className="text-gray-500">{inspectTypeConfig[selectedRecord.inspectType].label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ResultIcon result={selectedRecord.result} />
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${qcResultConfig[selectedRecord.result].color}`}>
                    {qcResultConfig[selectedRecord.result].label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">关联订单</p>
                  <p className="font-medium">{order?.orderNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">客户</p>
                  <p className="font-medium">{customer?.shortName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">产品</p>
                  <p className="font-medium">{product?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">检验员</p>
                  <p className="font-medium">{inspector?.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">检验时间</p>
                  <p className="font-medium">{formatDateTime(selectedRecord.inspectDate)}</p>
                </div>
                {selectedRecord.defectDesc && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">不良描述</p>
                    <p className="font-medium text-danger-600">{selectedRecord.defectDesc}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
