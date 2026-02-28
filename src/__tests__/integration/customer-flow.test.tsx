import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/lib/store'

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState())
})

describe('客户完整生命周期流程', () => {
  it('新客户从创建到首单完成', () => {
    const store = useAppStore.getState()
    
    // 步骤1: 创建新客户
    store.addCustomer({
      companyName: '流程测试食品有限公司',
      shortName: '流程测试',
      customerType: 'BRAND',
      status: 'POTENTIAL',
      region: '成都',
      address: '四川省成都市高新区测试路1号',
      ownerId: 'u1',
    })

    const customers = useAppStore.getState().customers
    const newCustomer = customers[customers.length - 1]
    expect(newCustomer.status).toBe('POTENTIAL')
    expect(newCustomer.shortName).toBe('流程测试')

    // 步骤2: 添加跟进记录
    useAppStore.getState().addFollowUp({
      customerId: newCustomer.id,
      userId: 'u1',
      type: 'VISIT',
      content: '首次拜访客户，了解需求',
      nextFollowDate: '2026-04-01',
    })

    const followUps = useAppStore.getState().getFollowUpsByCustomerId(newCustomer.id)
    expect(followUps.length).toBe(1)
    expect(followUps[0].type).toBe('VISIT')

    // 步骤3: 创建报价单
    useAppStore.getState().addQuote({
      customerId: newCustomer.id,
      productId: 'p1',
      unitPrice: 130,
      minOrderQty: 50,
      validUntil: '2026-09-30',
      status: 'DRAFT',
      createdBy: 'u1',
    })

    const quotes = useAppStore.getState().getQuotesByCustomerId(newCustomer.id)
    expect(quotes.length).toBe(1)

    // 步骤4: 报价通过
    useAppStore.getState().updateQuote(quotes[0].id, { status: 'APPROVED' })
    const updatedQuote = useAppStore.getState().quotes.find(q => q.id === quotes[0].id)
    expect(updatedQuote?.status).toBe('APPROVED')

    // 步骤5: 创建打样
    useAppStore.getState().addSample({
      customerId: newCustomer.id,
      requesterId: 'u1',
      productName: '定制款蛋糕卷',
      requirements: '客户要求低糖配方',
      status: 'SUBMITTED',
      expectedDate: '2026-04-15',
    })

    const samples = useAppStore.getState().getSamplesByCustomerId(newCustomer.id)
    expect(samples.length).toBe(1)

    // 步骤6: 打样通过
    useAppStore.getState().updateSample(samples[0].id, {
      status: 'PASSED',
      result: 'PASSED',
      completedDate: '2026-04-10',
    })

    // 步骤7: 创建订单
    useAppStore.getState().addOrder({
      customerId: newCustomer.id,
      productId: 'p1',
      quantity: 100,
      unit: '箱',
      unitPrice: 130,
      totalAmount: 13000,
      status: 'PENDING',
      orderDate: '2026-04-15',
      deliveryDate: '2026-04-25',
    })

    const orders = useAppStore.getState().getOrdersByCustomerId(newCustomer.id)
    expect(orders.length).toBe(1)

    // 步骤8: 订单状态流转
    useAppStore.getState().updateOrderStatus(orders[0].id, 'CONFIRMED')
    expect(useAppStore.getState().orders.find(o => o.id === orders[0].id)?.status).toBe('CONFIRMED')

    useAppStore.getState().updateOrderStatus(orders[0].id, 'PRODUCING')
    expect(useAppStore.getState().orders.find(o => o.id === orders[0].id)?.status).toBe('PRODUCING')

    useAppStore.getState().updateOrderStatus(orders[0].id, 'COMPLETED')
    expect(useAppStore.getState().orders.find(o => o.id === orders[0].id)?.status).toBe('COMPLETED')

    // 步骤9: 更新客户状态为合作中
    useAppStore.getState().updateCustomer(newCustomer.id, { status: 'ACTIVE' })
    const finalCustomer = useAppStore.getState().customers.find(c => c.id === newCustomer.id)
    expect(finalCustomer?.status).toBe('ACTIVE')
  })
})

describe('订单工作流测试', () => {
  it('订单从创建到完成的完整状态流转', () => {
    // 创建订单
    useAppStore.getState().addOrder({
      customerId: 'c1',
      productId: 'p3',
      quantity: 80,
      unit: '箱',
      unitPrice: 180,
      totalAmount: 14400,
      status: 'PENDING',
      orderDate: '2026-03-01',
      deliveryDate: '2026-03-15',
    })

    const orders = useAppStore.getState().orders
    const newOrder = orders[orders.length - 1]

    // PENDING → CONFIRMED
    useAppStore.getState().updateOrderStatus(newOrder.id, 'CONFIRMED')
    expect(useAppStore.getState().orders.find(o => o.id === newOrder.id)?.status).toBe('CONFIRMED')

    // CONFIRMED → SCHEDULED
    useAppStore.getState().updateOrderStatus(newOrder.id, 'SCHEDULED')
    expect(useAppStore.getState().orders.find(o => o.id === newOrder.id)?.status).toBe('SCHEDULED')

    // SCHEDULED → PRODUCING
    useAppStore.getState().updateOrderStatus(newOrder.id, 'PRODUCING')
    expect(useAppStore.getState().orders.find(o => o.id === newOrder.id)?.status).toBe('PRODUCING')

    // PRODUCING → QC
    useAppStore.getState().updateOrderStatus(newOrder.id, 'QC')
    expect(useAppStore.getState().orders.find(o => o.id === newOrder.id)?.status).toBe('QC')

    // 添加质检记录
    useAppStore.getState().addQcRecord({
      orderId: newOrder.id,
      inspectType: 'FINAL',
      inspectorId: 'u7',
      result: 'PASS',
      inspectDate: new Date().toISOString(),
    })

    const qcRecords = useAppStore.getState().getQcRecordsByOrderId(newOrder.id)
    expect(qcRecords.length).toBe(1)
    expect(qcRecords[0].result).toBe('PASS')

    // QC → SHIPPED
    useAppStore.getState().updateOrderStatus(newOrder.id, 'SHIPPED')
    expect(useAppStore.getState().orders.find(o => o.id === newOrder.id)?.status).toBe('SHIPPED')

    // SHIPPED → COMPLETED
    useAppStore.getState().updateOrderStatus(newOrder.id, 'COMPLETED')
    expect(useAppStore.getState().orders.find(o => o.id === newOrder.id)?.status).toBe('COMPLETED')
  })

  it('质检不合格记录', () => {
    // 添加不合格质检记录
    useAppStore.getState().addQcRecord({
      orderId: 'o3',
      inspectType: 'PROCESS',
      inspectorId: 'u7',
      result: 'FAIL',
      defectDesc: '产品表面有裂纹，不符合标准',
      inspectDate: new Date().toISOString(),
    })

    const qcRecords = useAppStore.getState().getQcRecordsByOrderId('o3')
    const failRecord = qcRecords.find(r => r.result === 'FAIL')
    expect(failRecord).toBeDefined()
    expect(failRecord?.defectDesc).toContain('裂纹')
  })
})

describe('报价版本管理', () => {
  it('同客户同产品多次报价版本递增', () => {
    // 第一次报价
    useAppStore.getState().addQuote({
      customerId: 'c3',
      productId: 'p5',
      unitPrice: 200,
      minOrderQty: 20,
      validUntil: '2026-06-30',
      status: 'DRAFT',
      createdBy: 'u2',
    })

    const firstQuotes = useAppStore.getState().quotes.filter(
      q => q.customerId === 'c3' && q.productId === 'p5'
    )
    expect(firstQuotes.length).toBe(1)

    // 第二次报价
    useAppStore.getState().addQuote({
      customerId: 'c3',
      productId: 'p5',
      unitPrice: 190,
      minOrderQty: 15,
      validUntil: '2026-09-30',
      status: 'DRAFT',
      createdBy: 'u2',
    })

    const allQuotes = useAppStore.getState().quotes.filter(
      q => q.customerId === 'c3' && q.productId === 'p5'
    )
    expect(allQuotes.length).toBe(2)
    
    // 验证版本递增
    expect(allQuotes[1].version).toBeGreaterThan(allQuotes[0].version)
  })
})
