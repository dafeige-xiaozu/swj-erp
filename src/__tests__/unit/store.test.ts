import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/lib/store'
import { mockCustomers, mockOrders, mockProducts, mockUsers } from '@/data/mockData'

// 每次测试前重置 Store
beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState())
})

// ===== 初始状态 =====
describe('Store 初始状态', () => {
  it('包含 mock 客户数据', () => {
    const { customers } = useAppStore.getState()
    expect(customers.length).toBe(mockCustomers.length)
  })

  it('包含 mock 订单数据', () => {
    const { orders } = useAppStore.getState()
    expect(orders.length).toBe(mockOrders.length)
  })

  it('包含 mock 产品数据', () => {
    const { products } = useAppStore.getState()
    expect(products.length).toBe(mockProducts.length)
  })

  it('包含 mock 用户数据', () => {
    const { users } = useAppStore.getState()
    expect(users.length).toBe(mockUsers.length)
  })

  it('当前用户为第一个 mock 用户', () => {
    const { currentUser } = useAppStore.getState()
    expect(currentUser).toBeDefined()
    expect(currentUser?.id).toBe(mockUsers[0].id)
  })
})

// ===== Customer CRUD =====
describe('Customer CRUD', () => {
  describe('addCustomer', () => {
    it('成功添加客户', () => {
      const initialCount = useAppStore.getState().customers.length

      useAppStore.getState().addCustomer({
        companyName: '新测试公司',
        shortName: '新测试',
        customerType: 'BRAND',
        status: 'POTENTIAL',
        region: '北京',
        address: '北京市朝阳区测试路1号',
        ownerId: 'u1',
      })

      const { customers } = useAppStore.getState()
      expect(customers.length).toBe(initialCount + 1)

      const newCustomer = customers[customers.length - 1]
      expect(newCustomer.companyName).toBe('新测试公司')
      expect(newCustomer.shortName).toBe('新测试')
      expect(newCustomer.contacts).toEqual([])
    })

    it('自动生成 id 和 createdAt', () => {
      useAppStore.getState().addCustomer({
        companyName: '测试公司A',
        shortName: '测试A',
        customerType: 'RETAILER',
        status: 'NEGOTIATING',
        region: '上海',
        address: '上海市测试路',
        ownerId: 'u2',
      })

      const { customers } = useAppStore.getState()
      const newCustomer = customers[customers.length - 1]
      expect(newCustomer.id).toBeTruthy()
      expect(newCustomer.createdAt).toBeTruthy()
    })
  })

  describe('updateCustomer', () => {
    it('成功更新客户信息', () => {
      const customerId = mockCustomers[0].id

      useAppStore.getState().updateCustomer(customerId, {
        shortName: '更新后的名称',
        region: '深圳',
      })

      const customer = useAppStore.getState().customers.find(c => c.id === customerId)
      expect(customer?.shortName).toBe('更新后的名称')
      expect(customer?.region).toBe('深圳')
    })

    it('不影响其他字段', () => {
      const customerId = mockCustomers[0].id
      const originalName = mockCustomers[0].companyName

      useAppStore.getState().updateCustomer(customerId, {
        region: '广州',
      })

      const customer = useAppStore.getState().customers.find(c => c.id === customerId)
      expect(customer?.companyName).toBe(originalName)
    })

    it('更新不存在的客户不会报错', () => {
      const prevCount = useAppStore.getState().customers.length
      useAppStore.getState().updateCustomer('non-existent-id', { shortName: '不存在' })
      expect(useAppStore.getState().customers.length).toBe(prevCount)
    })
  })

  describe('deleteCustomer', () => {
    it('成功删除客户', () => {
      const initialCount = useAppStore.getState().customers.length
      const customerId = mockCustomers[0].id

      useAppStore.getState().deleteCustomer(customerId)

      const { customers } = useAppStore.getState()
      expect(customers.length).toBe(initialCount - 1)
      expect(customers.find(c => c.id === customerId)).toBeUndefined()
    })

    it('删除不存在的客户不会报错', () => {
      const prevCount = useAppStore.getState().customers.length
      useAppStore.getState().deleteCustomer('non-existent-id')
      expect(useAppStore.getState().customers.length).toBe(prevCount)
    })
  })
})

// ===== Order CRUD =====
describe('Order CRUD', () => {
  describe('addOrder', () => {
    it('成功添加订单', () => {
      const initialCount = useAppStore.getState().orders.length

      useAppStore.getState().addOrder({
        customerId: 'c1',
        productId: 'p1',
        quantity: 200,
        unit: '箱',
        unitPrice: 150,
        totalAmount: 30000,
        status: 'PENDING',
        orderDate: '2026-03-01',
        deliveryDate: '2026-03-15',
      })

      const { orders } = useAppStore.getState()
      expect(orders.length).toBe(initialCount + 1)

      const newOrder = orders[orders.length - 1]
      expect(newOrder.quantity).toBe(200)
      expect(newOrder.totalAmount).toBe(30000)
    })

    it('自动生成订单号', () => {
      useAppStore.getState().addOrder({
        customerId: 'c1',
        productId: 'p2',
        quantity: 50,
        unit: '箱',
        unitPrice: 100,
        totalAmount: 5000,
        status: 'PENDING',
        orderDate: '2026-03-01',
        deliveryDate: '2026-03-10',
      })

      const { orders } = useAppStore.getState()
      const newOrder = orders[orders.length - 1]
      expect(newOrder.orderNo).toMatch(/^OD/)
      expect(newOrder.id).toBeTruthy()
      expect(newOrder.createdAt).toBeTruthy()
      expect(newOrder.updatedAt).toBeTruthy()
    })
  })

  describe('updateOrderStatus', () => {
    it('成功更新订单状态', () => {
      const orderId = mockOrders[0].id

      useAppStore.getState().updateOrderStatus(orderId, 'CONFIRMED')

      const order = useAppStore.getState().orders.find(o => o.id === orderId)
      expect(order?.status).toBe('CONFIRMED')
    })

    it('更新状态会同步更新 updatedAt', () => {
      const orderId = mockOrders[0].id
      const prevUpdatedAt = useAppStore.getState().orders.find(o => o.id === orderId)?.updatedAt

      useAppStore.getState().updateOrderStatus(orderId, 'PRODUCING')

      const order = useAppStore.getState().orders.find(o => o.id === orderId)
      expect(order?.updatedAt).not.toBe(prevUpdatedAt)
    })
  })

  describe('deleteOrder', () => {
    it('成功删除订单', () => {
      const initialCount = useAppStore.getState().orders.length
      const orderId = mockOrders[0].id

      useAppStore.getState().deleteOrder(orderId)

      expect(useAppStore.getState().orders.length).toBe(initialCount - 1)
    })
  })
})

// ===== Quote 操作 =====
describe('Quote 操作', () => {
  it('addQuote 成功添加报价并自动设置版本号', () => {
    const initialCount = useAppStore.getState().quotes.length

    useAppStore.getState().addQuote({
      customerId: 'c3',
      productId: 'p2',
      unitPrice: 160,
      minOrderQty: 30,
      validUntil: '2026-09-30',
      status: 'DRAFT',
      createdBy: 'u1',
    })

    const { quotes } = useAppStore.getState()
    expect(quotes.length).toBe(initialCount + 1)

    const newQuote = quotes[quotes.length - 1]
    expect(newQuote.quoteNo).toMatch(/^QT/)
    expect(newQuote.version).toBeGreaterThanOrEqual(1)
  })

  it('updateQuote 成功更新报价状态', () => {
    const quoteId = useAppStore.getState().quotes[0].id

    useAppStore.getState().updateQuote(quoteId, { status: 'APPROVED' })

    const quote = useAppStore.getState().quotes.find(q => q.id === quoteId)
    expect(quote?.status).toBe('APPROVED')
  })
})

// ===== Sample 操作 =====
describe('Sample 操作', () => {
  it('addSample 成功添加打样', () => {
    const initialCount = useAppStore.getState().samples.length

    useAppStore.getState().addSample({
      customerId: 'c1',
      requesterId: 'u1',
      productName: '新品蛋糕',
      requirements: '低糖，保留口感',
      status: 'SUBMITTED',
      expectedDate: '2026-04-01',
    })

    const { samples } = useAppStore.getState()
    expect(samples.length).toBe(initialCount + 1)
    expect(samples[samples.length - 1].sampleNo).toMatch(/^SP/)
  })

  it('updateSample 成功更新打样状态', () => {
    const sampleId = useAppStore.getState().samples[0].id

    useAppStore.getState().updateSample(sampleId, {
      status: 'DEVELOPING',
      assigneeId: 'u4',
    })

    const sample = useAppStore.getState().samples.find(s => s.id === sampleId)
    expect(sample?.status).toBe('DEVELOPING')
    expect(sample?.assigneeId).toBe('u4')
  })
})

// ===== QC Record 操作 =====
describe('QC Record 操作', () => {
  it('addQcRecord 成功添加质检记录', () => {
    const initialCount = useAppStore.getState().qcRecords.length

    useAppStore.getState().addQcRecord({
      orderId: 'o1',
      inspectType: 'FINAL',
      inspectorId: 'u7',
      result: 'PASS',
      inspectDate: '2026-03-01T10:00:00',
    })

    const { qcRecords } = useAppStore.getState()
    expect(qcRecords.length).toBe(initialCount + 1)
    expect(qcRecords[qcRecords.length - 1].recordNo).toMatch(/^QC/)
  })
})

// ===== FollowUp 操作 =====
describe('FollowUp 操作', () => {
  it('addFollowUp 成功添加跟进记录', () => {
    const initialCount = useAppStore.getState().followUps.length

    useAppStore.getState().addFollowUp({
      customerId: 'c1',
      userId: 'u1',
      type: 'VISIT',
      content: '拜访客户，洽谈Q3计划',
      nextFollowDate: '2026-04-15',
    })

    const { followUps } = useAppStore.getState()
    expect(followUps.length).toBe(initialCount + 1)
    expect(followUps[followUps.length - 1].content).toBe('拜访客户，洽谈Q3计划')
  })
})

// ===== Query 方法 =====
describe('Query 方法', () => {
  describe('getCustomerById', () => {
    it('返回存在的客户', () => {
      const customer = useAppStore.getState().getCustomerById('c1')
      expect(customer).toBeDefined()
      expect(customer?.id).toBe('c1')
    })

    it('返回 undefined 对于不存在的 ID', () => {
      const customer = useAppStore.getState().getCustomerById('non-existent')
      expect(customer).toBeUndefined()
    })
  })

  describe('getProductById', () => {
    it('返回存在的产品', () => {
      const product = useAppStore.getState().getProductById('p1')
      expect(product).toBeDefined()
      expect(product?.name).toBe('原味蛋糕卷')
    })

    it('产品包含规格和克重', () => {
      const product = useAppStore.getState().getProductById('p1')
      expect(product?.spec).toBeTruthy()
      expect(product?.weight).toBeGreaterThan(0)
    })
  })

  describe('getUserById', () => {
    it('返回存在的用户', () => {
      const user = useAppStore.getState().getUserById('u1')
      expect(user).toBeDefined()
      expect(user?.name).toBe('张伟')
    })
  })

  describe('getOrdersByCustomerId', () => {
    it('返回客户的所有订单', () => {
      const orders = useAppStore.getState().getOrdersByCustomerId('c1')
      expect(orders.length).toBeGreaterThan(0)
      orders.forEach(order => {
        expect(order.customerId).toBe('c1')
      })
    })

    it('不存在的客户返回空数组', () => {
      const orders = useAppStore.getState().getOrdersByCustomerId('non-existent')
      expect(orders).toEqual([])
    })
  })

  describe('getQcRecordsByOrderId', () => {
    it('返回订单的质检记录', () => {
      const records = useAppStore.getState().getQcRecordsByOrderId('o1')
      expect(records.length).toBeGreaterThan(0)
      records.forEach(record => {
        expect(record.orderId).toBe('o1')
      })
    })
  })

  describe('getFollowUpsByCustomerId', () => {
    it('返回客户的跟进记录', () => {
      const followUps = useAppStore.getState().getFollowUpsByCustomerId('c1')
      expect(followUps.length).toBeGreaterThan(0)
      followUps.forEach(followUp => {
        expect(followUp.customerId).toBe('c1')
      })
    })
  })

  describe('getSamplesByCustomerId', () => {
    it('返回客户的打样记录', () => {
      const samples = useAppStore.getState().getSamplesByCustomerId('c2')
      expect(samples.length).toBeGreaterThan(0)
      samples.forEach(sample => {
        expect(sample.customerId).toBe('c2')
      })
    })
  })

  describe('getQuotesByCustomerId', () => {
    it('返回客户的报价记录', () => {
      const quotes = useAppStore.getState().getQuotesByCustomerId('c1')
      expect(quotes.length).toBeGreaterThan(0)
      quotes.forEach(quote => {
        expect(quote.customerId).toBe('c1')
      })
    })
  })
})
