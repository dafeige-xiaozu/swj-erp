import { describe, it, expect } from 'vitest'
import {
  customerStatusConfig,
  orderStatusConfig,
  sampleStatusConfig,
  qcResultConfig,
  inspectTypeConfig,
  customerTypeConfig,
  userRoleConfig,
} from '@/types'
import type {
  CustomerStatus,
  OrderStatus,
  SampleStatus,
  QcResult,
  InspectType,
  CustomerType,
  UserRole,
} from '@/types'

// ===== customerStatusConfig =====
describe('customerStatusConfig', () => {
  const allStatuses: CustomerStatus[] = ['POTENTIAL', 'NEGOTIATING', 'ACTIVE', 'PAUSED', 'LOST']

  it('包含所有客户状态', () => {
    allStatuses.forEach((status) => {
      expect(customerStatusConfig[status]).toBeDefined()
    })
  })

  it('每个状态都有 label 和 color', () => {
    allStatuses.forEach((status) => {
      const config = customerStatusConfig[status]
      expect(config.label).toBeTruthy()
      expect(typeof config.label).toBe('string')
      expect(config.color).toBeTruthy()
      expect(typeof config.color).toBe('string')
    })
  })

  it('状态标签正确', () => {
    expect(customerStatusConfig.POTENTIAL.label).toBe('潜在')
    expect(customerStatusConfig.ACTIVE.label).toBe('合作中')
    expect(customerStatusConfig.LOST.label).toBe('流失')
  })
})

// ===== orderStatusConfig =====
describe('orderStatusConfig', () => {
  const allStatuses: OrderStatus[] = [
    'PENDING', 'CONFIRMED', 'SCHEDULED', 'PRODUCING',
    'QC', 'SHIPPED', 'COMPLETED', 'CANCELLED'
  ]

  it('包含所有订单状态', () => {
    allStatuses.forEach((status) => {
      expect(orderStatusConfig[status]).toBeDefined()
    })
  })

  it('每个状态都有 label 和 color', () => {
    allStatuses.forEach((status) => {
      const config = orderStatusConfig[status]
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    })
  })

  it('状态标签正确', () => {
    expect(orderStatusConfig.PENDING.label).toBe('待确认')
    expect(orderStatusConfig.PRODUCING.label).toBe('生产中')
    expect(orderStatusConfig.COMPLETED.label).toBe('已完成')
  })
})

// ===== sampleStatusConfig =====
describe('sampleStatusConfig', () => {
  const allStatuses: SampleStatus[] = [
    'SUBMITTED', 'REVIEWING', 'DEVELOPING', 'TRIAL',
    'SENT', 'FEEDBACK', 'PASSED', 'ADJUSTING', 'TERMINATED'
  ]

  it('包含所有打样状态', () => {
    allStatuses.forEach((status) => {
      expect(sampleStatusConfig[status]).toBeDefined()
    })
  })

  it('每个状态都有 label 和 color', () => {
    allStatuses.forEach((status) => {
      const config = sampleStatusConfig[status]
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    })
  })
})

// ===== qcResultConfig =====
describe('qcResultConfig', () => {
  const allResults: QcResult[] = ['PASS', 'FAIL', 'CONCESSION']

  it('包含所有质检结果', () => {
    allResults.forEach((result) => {
      expect(qcResultConfig[result]).toBeDefined()
    })
  })

  it('标签正确', () => {
    expect(qcResultConfig.PASS.label).toBe('合格')
    expect(qcResultConfig.FAIL.label).toBe('不合格')
    expect(qcResultConfig.CONCESSION.label).toBe('让步接收')
  })
})

// ===== inspectTypeConfig =====
describe('inspectTypeConfig', () => {
  const allTypes: InspectType[] = ['INCOMING', 'PROCESS', 'FINAL']

  it('包含所有检验类型', () => {
    allTypes.forEach((type) => {
      expect(inspectTypeConfig[type]).toBeDefined()
      expect(inspectTypeConfig[type].label).toBeTruthy()
    })
  })

  it('标签正确', () => {
    expect(inspectTypeConfig.INCOMING.label).toBe('来料检验')
    expect(inspectTypeConfig.PROCESS.label).toBe('过程检验')
    expect(inspectTypeConfig.FINAL.label).toBe('成品检验')
  })
})

// ===== customerTypeConfig =====
describe('customerTypeConfig', () => {
  const allTypes: CustomerType[] = ['BRAND', 'RETAILER', 'TRADER']

  it('包含所有客户类型', () => {
    allTypes.forEach((type) => {
      expect(customerTypeConfig[type]).toBeDefined()
      expect(customerTypeConfig[type].label).toBeTruthy()
    })
  })

  it('标签正确', () => {
    expect(customerTypeConfig.BRAND.label).toBe('品牌商')
    expect(customerTypeConfig.RETAILER.label).toBe('零售商')
    expect(customerTypeConfig.TRADER.label).toBe('贸易商')
  })
})

// ===== userRoleConfig =====
describe('userRoleConfig', () => {
  const allRoles: UserRole[] = [
    'SALES', 'SALES_MANAGER', 'RD', 'RD_MANAGER',
    'QC', 'QC_MANAGER', 'PRODUCTION', 'ADMIN', 'BOSS'
  ]

  it('包含所有用户角色', () => {
    allRoles.forEach((role) => {
      expect(userRoleConfig[role]).toBeDefined()
      expect(userRoleConfig[role].label).toBeTruthy()
    })
  })

  it('标签正确', () => {
    expect(userRoleConfig.SALES.label).toBe('业务员')
    expect(userRoleConfig.BOSS.label).toBe('管理层')
    expect(userRoleConfig.QC.label).toBe('品控专员')
  })
})
