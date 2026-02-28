import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Building2, 
  Phone, 
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter
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
  Customer, 
  CustomerStatus, 
  CustomerType
} from '@/types'
import {
  customerStatusConfig, 
  customerTypeConfig,
  userRoleConfig
} from '@/types'
import { formatDate } from '@/lib/utils'

export function CustomersPage() {
  const { 
    customers, 
    users, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    getOrdersByCustomerId,
    currentUser
  } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'ALL'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    shortName: '',
    customerType: 'BRAND' as CustomerType,
    status: 'POTENTIAL' as CustomerStatus,
    region: '',
    address: '',
    ownerId: currentUser?.id || '',
    remark: '',
  })

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.region.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || customer.status === statusFilter
    const matchesType = typeFilter === 'ALL' || customer.customerType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyName || !formData.shortName) {
      toast('error', '请填写必要信息')
      return
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData)
      toast('success', '客户信息已更新')
    } else {
      addCustomer(formData)
      toast('success', '客户添加成功')
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      companyName: '',
      shortName: '',
      customerType: 'BRAND',
      status: 'POTENTIAL',
      region: '',
      address: '',
      ownerId: currentUser?.id || '',
      remark: '',
    })
    setEditingCustomer(null)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      companyName: customer.companyName,
      shortName: customer.shortName,
      customerType: customer.customerType,
      status: customer.status,
      region: customer.region,
      address: customer.address,
      ownerId: customer.ownerId,
      remark: customer.remark || '',
    })
    setIsModalOpen(true)
    setActiveDropdown(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个客户吗？')) {
      deleteCustomer(id)
      toast('success', '客户已删除')
    }
    setActiveDropdown(null)
  }

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
    setActiveDropdown(null)
  }

  const salesUsers = users.filter(u => ['SALES', 'SALES_MANAGER'].includes(u.role))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客户档案</h1>
          <p className="text-gray-500 mt-1">管理所有客户信息和联系人</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" />
          新增客户
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索客户名称、区域..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'ALL')}
              options={[
                { value: 'ALL', label: '全部状态' },
                ...Object.entries(customerStatusConfig).map(([value, config]) => ({
                  value,
                  label: config.label,
                })),
              ]}
              className="w-32"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CustomerType | 'ALL')}
              options={[
                { value: 'ALL', label: '全部类型' },
                ...Object.entries(customerTypeConfig).map(([value, config]) => ({
                  value,
                  label: config.label,
                })),
              ]}
              className="w-32"
            />
          </div>
        </div>
      </Card>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="暂无客户"
          description="开始添加您的第一个客户"
          action={
            <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
              <Plus className="w-4 h-4" />
              新增客户
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer) => {
            const owner = users.find(u => u.id === customer.ownerId)
            const orderCount = getOrdersByCustomerId(customer.id).length
            
            return (
              <Card key={customer.id} className="relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {customer.shortName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.shortName}</h3>
                      <p className="text-sm text-gray-500">{customer.companyName}</p>
                    </div>
                  </div>
                  
                  {/* Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === customer.id ? null : customer.id)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {activeDropdown === customer.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => openDetail(customer)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            查看详情
                          </button>
                          <button
                            onClick={() => openEditModal(customer)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
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

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{customer.region}</span>
                  </div>
                  {customer.contacts[0]?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{customer.contacts[0].phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${customerStatusConfig[customer.status].color}`}>
                      {customerStatusConfig[customer.status].label}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {customerTypeConfig[customer.customerType].label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{orderCount} 订单</span>
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
        title={editingCustomer ? '编辑客户' : '新增客户'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="公司全称"
              placeholder="请输入公司全称"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
            <Input
              label="公司简称"
              placeholder="请输入简称"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="客户类型"
              value={formData.customerType}
              onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              options={Object.entries(customerTypeConfig).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
            <Select
              label="合作状态"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              options={Object.entries(customerStatusConfig).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="所在区域"
              placeholder="如：上海、杭州"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
            <Select
              label="负责人"
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              options={salesUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>

          <Input
            label="详细地址"
            placeholder="请输入详细地址"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <Textarea
            label="备注"
            placeholder="备注信息..."
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>
              取消
            </Button>
            <Button type="submit">
              {editingCustomer ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="客户详情"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {selectedCustomer.shortName.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.companyName}</h2>
                <p className="text-gray-500">{selectedCustomer.shortName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">客户类型</p>
                <p className="font-medium">{customerTypeConfig[selectedCustomer.customerType].label}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">合作状态</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${customerStatusConfig[selectedCustomer.status].color}`}>
                  {customerStatusConfig[selectedCustomer.status].label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">所在区域</p>
                <p className="font-medium">{selectedCustomer.region || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">负责人</p>
                <p className="font-medium">{users.find(u => u.id === selectedCustomer.ownerId)?.name || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">详细地址</p>
                <p className="font-medium">{selectedCustomer.address || '-'}</p>
              </div>
              {selectedCustomer.remark && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">备注</p>
                  <p className="font-medium">{selectedCustomer.remark}</p>
                </div>
              )}
            </div>

            {selectedCustomer.contacts.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">联系人</h3>
                <div className="space-y-2">
                  {selectedCustomer.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.position}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{contact.phone}</p>
                        {contact.wechat && <p className="text-gray-500">微信: {contact.wechat}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-400">
              创建于 {formatDate(selectedCustomer.createdAt)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
