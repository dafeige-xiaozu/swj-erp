import type { Customer, Order, Quote, Sample, QcRecord, FollowUp } from '@/types'
import { generateId } from '@/lib/utils'

// 测试数据工厂函数

export function createMockCustomer(overrides?: Partial<Customer>): Customer {
  return {
    id: generateId(),
    companyName: '测试烘焙有限公司',
    shortName: '测试烘焙',
    customerType: 'RETAILER',
    status: 'ACTIVE',
    region: '上海',
    address: '上海市浦东新区测试路100号',
    ownerId: 'u1',
    createdAt: '2026-01-15',
    contacts: [],
    ...overrides,
  }
}

export function createMockOrder(overrides?: Partial<Order>): Order {
  return {
    id: generateId(),
    orderNo: `OD${Date.now()}`,
    customerId: 'c1',
    productId: 'p1',
    quantity: 100,
    unit: '箱',
    unitPrice: 120,
    totalAmount: 12000,
    status: 'PENDING',
    orderDate: '2026-02-28',
    deliveryDate: '2026-03-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockQuote(overrides?: Partial<Quote>): Quote {
  return {
    id: generateId(),
    quoteNo: `QT${Date.now()}`,
    customerId: 'c1',
    productId: 'p1',
    unitPrice: 120,
    minOrderQty: 50,
    validUntil: '2026-06-30',
    version: 1,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    createdBy: 'u1',
    ...overrides,
  }
}

export function createMockSample(overrides?: Partial<Sample>): Sample {
  return {
    id: generateId(),
    sampleNo: `SP${Date.now()}`,
    customerId: 'c1',
    requesterId: 'u1',
    productName: '测试蛋糕',
    requirements: '测试打样需求',
    status: 'SUBMITTED',
    expectedDate: '2026-03-15',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockQcRecord(overrides?: Partial<QcRecord>): QcRecord {
  return {
    id: generateId(),
    recordNo: `QC${Date.now()}`,
    orderId: 'o1',
    inspectType: 'FINAL',
    inspectorId: 'u7',
    result: 'PASS',
    inspectDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockFollowUp(overrides?: Partial<FollowUp>): FollowUp {
  return {
    id: generateId(),
    customerId: 'c1',
    userId: 'u1',
    type: 'VISIT',
    content: '测试跟进记录',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}
