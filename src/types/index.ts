// ===== Enums =====

export type CustomerStatus = 'POTENTIAL' | 'NEGOTIATING' | 'ACTIVE' | 'PAUSED' | 'LOST'

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'SCHEDULED' 
  | 'PRODUCING' 
  | 'QC' 
  | 'SHIPPED' 
  | 'COMPLETED' 
  | 'CANCELLED'

export type SampleStatus = 
  | 'SUBMITTED' 
  | 'REVIEWING' 
  | 'DEVELOPING' 
  | 'TRIAL' 
  | 'SENT' 
  | 'FEEDBACK' 
  | 'PASSED' 
  | 'ADJUSTING' 
  | 'TERMINATED'

export type InspectType = 'INCOMING' | 'PROCESS' | 'FINAL'

export type QcResult = 'PASS' | 'FAIL' | 'CONCESSION'

export type UserRole = 
  | 'SALES' 
  | 'SALES_MANAGER' 
  | 'RD' 
  | 'RD_MANAGER' 
  | 'QC' 
  | 'QC_MANAGER' 
  | 'PRODUCTION' 
  | 'ADMIN' 
  | 'BOSS'

export type CustomerType = 'BRAND' | 'RETAILER' | 'TRADER'

// ===== Interfaces =====

export interface User {
  id: string
  name: string
  role: UserRole
  department: string
  email?: string
  phone?: string
  avatar?: string
}

export interface Customer {
  id: string
  companyName: string
  shortName: string
  customerType: CustomerType
  status: CustomerStatus
  region: string
  address: string
  ownerId: string
  remark?: string
  createdAt: string
  contacts: Contact[]
}

export interface Contact {
  id: string
  customerId: string
  name: string
  position?: string
  phone?: string
  wechat?: string
  email?: string
  isPrimary: boolean
}

export interface Product {
  id: string
  name: string
  category: string
  spec: string // 规格，如 "6寸/8寸"
  weight: number // 克重 (克)
  unit: string
  description?: string
}

export interface Order {
  id: string
  orderNo: string
  customerId: string
  productId: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  status: OrderStatus
  orderDate: string
  deliveryDate: string
  shippedDate?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  quoteNo: string
  customerId: string
  productId: string
  unitPrice: number
  minOrderQty: number
  validUntil: string
  version: number
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  remark?: string
  createdAt: string
  createdBy: string
}

export interface Sample {
  id: string
  sampleNo: string
  customerId: string
  requesterId: string
  assigneeId?: string
  productName: string
  requirements: string
  referenceSample?: string
  status: SampleStatus
  expectedDate: string
  completedDate?: string
  result?: 'PASSED' | 'FAILED' | 'ADJUSTING'
  remark?: string
  createdAt: string
}

export interface QcRecord {
  id: string
  recordNo: string
  orderId: string
  inspectType: InspectType
  inspectorId: string
  result: QcResult
  defectDesc?: string
  inspectDate: string
  createdAt: string
}

export interface FollowUp {
  id: string
  customerId: string
  userId: string
  type: 'VISIT' | 'CALL' | 'WECHAT' | 'EMAIL' | 'OTHER'
  content: string
  nextFollowDate?: string
  attachments?: string[]
  createdAt: string
}

// ===== Status Display Config =====

export const customerStatusConfig: Record<CustomerStatus, { label: string; color: string }> = {
  POTENTIAL: { label: '潜在', color: 'bg-gray-100 text-gray-700' },
  NEGOTIATING: { label: '洽谈中', color: 'bg-accent-100 text-accent-700' },
  ACTIVE: { label: '合作中', color: 'bg-success-100 text-success-700' },
  PAUSED: { label: '暂停', color: 'bg-warning-100 text-warning-700' },
  LOST: { label: '流失', color: 'bg-danger-100 text-danger-700' },
}

export const orderStatusConfig: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: '待确认', color: 'bg-gray-100 text-gray-700' },
  CONFIRMED: { label: '已确认', color: 'bg-primary-100 text-primary-700' },
  SCHEDULED: { label: '排产中', color: 'bg-accent-100 text-accent-700' },
  PRODUCING: { label: '生产中', color: 'bg-warning-100 text-warning-700' },
  QC: { label: '质检中', color: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: '已发货', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: '已完成', color: 'bg-success-100 text-success-700' },
  CANCELLED: { label: '已取消', color: 'bg-danger-100 text-danger-700' },
}

export const sampleStatusConfig: Record<SampleStatus, { label: string; color: string }> = {
  SUBMITTED: { label: '已提交', color: 'bg-gray-100 text-gray-700' },
  REVIEWING: { label: '评审中', color: 'bg-primary-100 text-primary-700' },
  DEVELOPING: { label: '开发中', color: 'bg-accent-100 text-accent-700' },
  TRIAL: { label: '试产中', color: 'bg-warning-100 text-warning-700' },
  SENT: { label: '已送样', color: 'bg-blue-100 text-blue-700' },
  FEEDBACK: { label: '待反馈', color: 'bg-purple-100 text-purple-700' },
  PASSED: { label: '已通过', color: 'bg-success-100 text-success-700' },
  ADJUSTING: { label: '调整中', color: 'bg-orange-100 text-orange-700' },
  TERMINATED: { label: '已终止', color: 'bg-danger-100 text-danger-700' },
}

export const qcResultConfig: Record<QcResult, { label: string; color: string }> = {
  PASS: { label: '合格', color: 'bg-success-100 text-success-700' },
  FAIL: { label: '不合格', color: 'bg-danger-100 text-danger-700' },
  CONCESSION: { label: '让步接收', color: 'bg-warning-100 text-warning-700' },
}

export const inspectTypeConfig: Record<InspectType, { label: string }> = {
  INCOMING: { label: '来料检验' },
  PROCESS: { label: '过程检验' },
  FINAL: { label: '成品检验' },
}

export const customerTypeConfig: Record<CustomerType, { label: string }> = {
  BRAND: { label: '品牌商' },
  RETAILER: { label: '零售商' },
  TRADER: { label: '贸易商' },
}

export const userRoleConfig: Record<UserRole, { label: string }> = {
  SALES: { label: '业务员' },
  SALES_MANAGER: { label: '销售主管' },
  RD: { label: '研发工程师' },
  RD_MANAGER: { label: '研发主管' },
  QC: { label: '品控专员' },
  QC_MANAGER: { label: '品控主管' },
  PRODUCTION: { label: '生产调度' },
  ADMIN: { label: '系统管理员' },
  BOSS: { label: '管理层' },
}
