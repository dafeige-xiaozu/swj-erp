import { useState } from 'react'
import { 
  Plus, 
  Search, 
  MessageSquare,
  Phone,
  MapPin,
  Mail,
  MessageCircle,
  Calendar,
  User
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
import type { FollowUp } from '@/types'
import { formatDateTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const followUpTypeConfig = {
  VISIT: { label: '拜访', icon: MapPin, color: 'bg-primary-100 text-primary-600' },
  CALL: { label: '电话', icon: Phone, color: 'bg-success-100 text-success-600' },
  WECHAT: { label: '微信', icon: MessageCircle, color: 'bg-green-100 text-green-600' },
  EMAIL: { label: '邮件', icon: Mail, color: 'bg-accent-100 text-accent-600' },
  OTHER: { label: '其他', icon: MessageSquare, color: 'bg-gray-100 text-gray-600' },
}

export function FollowUpsPage() {
  const { 
    followUps, 
    customers, 
    addFollowUp, 
    getCustomerById,
    getUserById,
    currentUser
  } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<FollowUp['type'] | 'ALL'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    userId: currentUser?.id || '',
    type: 'CALL' as FollowUp['type'],
    content: '',
    nextFollowDate: '',
  })

  // Filter follow ups
  const filteredFollowUps = followUps.filter(followUp => {
    const customer = getCustomerById(followUp.customerId)
    
    const matchesSearch = 
      followUp.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'ALL' || followUp.type === typeFilter
    
    return matchesSearch && matchesType
  })

  // Group by date
  const groupedFollowUps = filteredFollowUps.reduce((acc, followUp) => {
    const date = formatDate(followUp.createdAt)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(followUp)
    return acc
  }, {} as Record<string, FollowUp[]>)

  const sortedDates = Object.keys(groupedFollowUps).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.content) {
      toast('error', '请填写必要信息')
      return
    }

    addFollowUp(formData)
    toast('success', '跟进记录已添加')

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      customerId: '',
      userId: currentUser?.id || '',
      type: 'CALL',
      content: '',
      nextFollowDate: '',
    })
  }

  const activeCustomers = customers.filter(c => 
    ['ACTIVE', 'NEGOTIATING', 'POTENTIAL'].includes(c.status)
  )

  // Upcoming follow ups
  const today = new Date()
  const upcomingFollowUps = followUps
    .filter(f => f.nextFollowDate && new Date(f.nextFollowDate) >= today)
    .sort((a, b) => new Date(a.nextFollowDate!).getTime() - new Date(b.nextFollowDate!).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">跟进记录</h1>
          <p className="text-gray-500 mt-1">记录客户沟通和拜访</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" />
          新增跟进
        </Button>
      </div>

      {/* Upcoming Reminders */}
      {upcomingFollowUps.length > 0 && (
        <Card className="bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent-600" />
            <h3 className="font-semibold text-accent-900">待办跟进</h3>
          </div>
          <div className="space-y-2">
            {upcomingFollowUps.map((followUp) => {
              const customer = getCustomerById(followUp.customerId)
              const daysLeft = Math.ceil(
                (new Date(followUp.nextFollowDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              )
              
              return (
                <div 
                  key={followUp.id}
                  className="flex items-center justify-between p-3 bg-white/80 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{customer?.shortName}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{followUp.content}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-sm font-medium',
                      daysLeft === 0 ? 'text-danger-600' : daysLeft <= 2 ? 'text-warning-600' : 'text-gray-600'
                    )}>
                      {daysLeft === 0 ? '今天' : `${daysLeft}天后`}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(followUp.nextFollowDate!)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索跟进内容、客户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FollowUp['type'] | 'ALL')}
            options={[
              { value: 'ALL', label: '全部类型' },
              ...Object.entries(followUpTypeConfig).map(([value, config]) => ({
                value,
                label: config.label,
              })),
            ]}
            className="w-32"
          />
        </div>
      </Card>

      {/* Timeline */}
      {filteredFollowUps.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8" />}
          title="暂无跟进记录"
          description="记录您的第一次客户跟进"
          action={
            <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
              <Plus className="w-4 h-4" />
              新增跟进
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
              <div className="space-y-3">
                {groupedFollowUps[date].map((followUp) => {
                  const customer = getCustomerById(followUp.customerId)
                  const user = getUserById(followUp.userId)
                  const typeConfig = followUpTypeConfig[followUp.type]
                  const Icon = typeConfig.icon
                  
                  return (
                    <Card key={followUp.id} className="relative">
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          typeConfig.color
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="font-semibold text-gray-900">{customer?.shortName}</span>
                              <span className="mx-2 text-gray-300">·</span>
                              <span className="text-sm text-gray-500">{typeConfig.label}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(followUp.createdAt).split(' ')[1]}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 whitespace-pre-wrap">{followUp.content}</p>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {user?.name}
                            </span>
                            {followUp.nextFollowDate && (
                              <span className="flex items-center gap-1 text-accent-600">
                                <Calendar className="w-3 h-3" />
                                下次跟进: {formatDate(followUp.nextFollowDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm() }}
        title="新增跟进记录"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            label="跟进方式"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as FollowUp['type'] })}
            options={Object.entries(followUpTypeConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
          />

          <Textarea
            label="跟进内容"
            placeholder="记录沟通内容、客户反馈、下一步计划..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={5}
          />

          <Input
            label="下次跟进日期"
            type="date"
            value={formData.nextFollowDate}
            onChange={(e) => setFormData({ ...formData, nextFollowDate: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>
              取消
            </Button>
            <Button type="submit">
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
