import { useState } from 'react'
import { 
  Plus, 
  Search, 
  FlaskConical,
  MoreVertical,
  Edit,
  Eye,
  UserPlus,
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
import type { Sample, SampleStatus } from '@/types'
import { sampleStatusConfig } from '@/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const sampleStatusFlow: SampleStatus[] = [
  'SUBMITTED', 'REVIEWING', 'DEVELOPING', 'TRIAL', 'SENT', 'FEEDBACK', 'PASSED'
]

export function SamplesPage() {
  const { 
    samples, 
    customers, 
    users,
    addSample, 
    updateSample,
    getCustomerById,
    getUserById,
    currentUser
  } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<SampleStatus | 'ALL'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [editingSample, setEditingSample] = useState<Sample | null>(null)
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    requesterId: currentUser?.id || '',
    assigneeId: '',
    productName: '',
    requirements: '',
    referenceSample: '',
    status: 'SUBMITTED' as SampleStatus,
    expectedDate: '',
    result: undefined as Sample['result'],
    remark: '',
  })

  const [assigneeId, setAssigneeId] = useState('')

  // Filter samples
  const filteredSamples = samples.filter(sample => {
    const customer = getCustomerById(sample.customerId)
    
    const matchesSearch = 
      sample.sampleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || sample.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.productName) {
      toast('error', '请填写必要信息')
      return
    }

    if (editingSample) {
      updateSample(editingSample.id, formData)
      toast('success', '打样需求已更新')
    } else {
      addSample(formData)
      toast('success', '打样需求已提交')
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      customerId: '',
      requesterId: currentUser?.id || '',
      assigneeId: '',
      productName: '',
      requirements: '',
      referenceSample: '',
      status: 'SUBMITTED',
      expectedDate: '',
      result: undefined,
      remark: '',
    })
    setEditingSample(null)
  }

  const openEditModal = (sample: Sample) => {
    setEditingSample(sample)
    setFormData({
      customerId: sample.customerId,
      requesterId: sample.requesterId,
      assigneeId: sample.assigneeId || '',
      productName: sample.productName,
      requirements: sample.requirements,
      referenceSample: sample.referenceSample || '',
      status: sample.status,
      expectedDate: sample.expectedDate,
      result: sample.result,
      remark: sample.remark || '',
    })
    setIsModalOpen(true)
    setActiveDropdown(null)
  }

  const openDetail = (sample: Sample) => {
    setSelectedSample(sample)
    setIsDetailOpen(true)
    setActiveDropdown(null)
  }

  const openAssignModal = (sample: Sample) => {
    setSelectedSample(sample)
    setAssigneeId(sample.assigneeId || '')
    setIsAssignOpen(true)
    setActiveDropdown(null)
  }

  const handleAssign = () => {
    if (selectedSample && assigneeId) {
      updateSample(selectedSample.id, { 
        assigneeId, 
        status: selectedSample.status === 'SUBMITTED' ? 'REVIEWING' : selectedSample.status 
      })
      toast('success', '已分配研发人员')
      setIsAssignOpen(false)
    }
  }

  const handleStatusChange = (sampleId: string, newStatus: SampleStatus) => {
    updateSample(sampleId, { status: newStatus })
    toast('success', `状态已更新为${sampleStatusConfig[newStatus].label}`)
  }

  const activeCustomers = customers.filter(c => ['ACTIVE', 'NEGOTIATING', 'POTENTIAL'].includes(c.status))
  const rdUsers = users.filter(u => ['RD', 'RD_MANAGER'].includes(u.role))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">打样管理</h1>
          <p className="text-gray-500 mt-1">管理产品研发打样流程</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" />
          提交打样需求
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索打样单号、产品名称、客户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SampleStatus | 'ALL')}
            options={[
              { value: 'ALL', label: '全部状态' },
              ...Object.entries(sampleStatusConfig).map(([value, config]) => ({
                value,
                label: config.label,
              })),
            ]}
            className="w-32"
          />
        </div>
      </Card>

      {/* Sample List */}
      {filteredSamples.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-8 h-8" />}
          title="暂无打样需求"
          description="提交您的第一个打样需求"
          action={
            <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
              <Plus className="w-4 h-4" />
              提交打样需求
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSamples.map((sample) => {
            const customer = getCustomerById(sample.customerId)
            const assignee = sample.assigneeId ? getUserById(sample.assigneeId) : null
            const requester = getUserById(sample.requesterId)
            
            return (
              <Card key={sample.id} className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-500">{sample.sampleNo}</p>
                    <h3 className="font-semibold text-gray-900">{sample.productName}</h3>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === sample.id ? null : sample.id)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {activeDropdown === sample.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => openDetail(sample)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            查看详情
                          </button>
                          <button
                            onClick={() => openEditModal(sample)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => openAssignModal(sample)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <UserPlus className="w-4 h-4" />
                            分配
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-3">{customer?.shortName}</p>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{sample.requirements}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sampleStatusConfig[sample.status].color}`}>
                    {sampleStatusConfig[sample.status].label}
                  </span>
                  <span className="text-gray-500">
                    {assignee ? assignee.name : '待分配'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>提交: {requester?.name}</span>
                  <span>期望: {formatDate(sample.expectedDate)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm() }}
        title={editingSample ? '编辑打样需求' : '提交打样需求'}
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
            <Input
              label="产品名称"
              placeholder="如：低糖抹茶蛋糕卷"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
          </div>

          <Textarea
            label="客户需求"
            placeholder="详细描述客户对产品的要求..."
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="参考样品"
              placeholder="参考产品或样品信息"
              value={formData.referenceSample}
              onChange={(e) => setFormData({ ...formData, referenceSample: e.target.value })}
            />
            <Input
              label="期望完成日期"
              type="date"
              value={formData.expectedDate}
              onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
            />
          </div>

          {editingSample && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="状态"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as SampleStatus })}
                options={Object.entries(sampleStatusConfig).map(([value, config]) => ({
                  value,
                  label: config.label,
                }))}
              />
              <Select
                label="研发负责人"
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                options={[
                  { value: '', label: '待分配' },
                  ...rdUsers.map(u => ({ value: u.id, label: u.name }))
                ]}
              />
            </div>
          )}

          <Textarea
            label="备注"
            placeholder="其他备注信息..."
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>
              取消
            </Button>
            <Button type="submit">
              {editingSample ? '保存' : '提交'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="打样详情"
        size="lg"
      >
        {selectedSample && (() => {
          const customer = getCustomerById(selectedSample.customerId)
          const assignee = selectedSample.assigneeId ? getUserById(selectedSample.assigneeId) : null
          const requester = getUserById(selectedSample.requesterId)
          const currentStatusIndex = sampleStatusFlow.indexOf(selectedSample.status)
          
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSample.productName}</h2>
                  <p className="text-gray-500">{selectedSample.sampleNo}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${sampleStatusConfig[selectedSample.status].color}`}>
                  {sampleStatusConfig[selectedSample.status].label}
                </span>
              </div>

              {/* Status Flow */}
              {!['TERMINATED', 'ADJUSTING'].includes(selectedSample.status) && (
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {sampleStatusFlow.map((status, index) => {
                    const isCompleted = index < currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    const config = sampleStatusConfig[status]
                    
                    return (
                      <div key={status} className="flex items-center">
                        <button
                          onClick={() => {
                            if (index === currentStatusIndex + 1 && selectedSample.assigneeId) {
                              handleStatusChange(selectedSample.id, status)
                            }
                          }}
                          disabled={index > currentStatusIndex + 1 || !selectedSample.assigneeId}
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                            isCompleted && 'bg-success-100 text-success-700',
                            isCurrent && config.color,
                            !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400',
                            index === currentStatusIndex + 1 && selectedSample.assigneeId && 'cursor-pointer hover:ring-2 hover:ring-primary-300'
                          )}
                        >
                          {config.label}
                        </button>
                        {index < sampleStatusFlow.length - 1 && (
                          <ArrowRight className={cn(
                            'w-3 h-3 mx-0.5 flex-shrink-0',
                            index < currentStatusIndex ? 'text-success-500' : 'text-gray-300'
                          )} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">客户</p>
                  <p className="font-medium">{customer?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">需求提交人</p>
                  <p className="font-medium">{requester?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">研发负责人</p>
                  <p className="font-medium">{assignee?.name || '待分配'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">期望完成日期</p>
                  <p className="font-medium">{formatDate(selectedSample.expectedDate)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">客户需求</p>
                  <p className="font-medium">{selectedSample.requirements}</p>
                </div>
                {selectedSample.referenceSample && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">参考样品</p>
                    <p className="font-medium">{selectedSample.referenceSample}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                  关闭
                </Button>
                {!selectedSample.assigneeId && (
                  <Button onClick={() => { openAssignModal(selectedSample); setIsDetailOpen(false) }}>
                    <UserPlus className="w-4 h-4" />
                    分配研发
                  </Button>
                )}
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="分配研发人员"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="研发人员"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={[
              { value: '', label: '请选择' },
              ...rdUsers.map(u => ({ value: u.id, label: `${u.name} (${u.department})` }))
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAssignOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAssign} disabled={!assigneeId}>
              确认分配
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
