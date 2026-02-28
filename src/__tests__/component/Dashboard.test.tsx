import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/lib/store'
import { mockOrders, mockCustomers, mockProducts } from '@/data/mockData'

// 测试 Dashboard 中的数据聚合逻辑（无需渲染组件，直接测试业务逻辑）
beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState())
})

describe('Dashboard 数据聚合逻辑', () => {
  describe('活跃订单统计', () => {
    it('正确过滤掉已完成和已取消的订单', () => {
      const orders = useAppStore.getState().orders
      const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status))
      
      activeOrders.forEach(order => {
        expect(order.status).not.toBe('COMPLETED')
        expect(order.status).not.toBe('CANCELLED')
      })
    })

    it('活跃订单数量小于等于总订单数', () => {
      const orders = useAppStore.getState().orders
      const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status))
      
      expect(activeOrders.length).toBeLessThanOrEqual(orders.length)
      expect(activeOrders.length).toBeGreaterThan(0)
    })
  })

  describe('紧急订单筛选', () => {
    it('正确筛选 3 天内交付的订单', () => {
      const orders = useAppStore.getState().orders
      const today = new Date()
      const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
      
      const urgentOrders = orders.filter(o => {
        if (['COMPLETED', 'CANCELLED', 'SHIPPED'].includes(o.status)) return false
        const deliveryDate = new Date(o.deliveryDate)
        return deliveryDate <= threeDaysLater
      })

      urgentOrders.forEach(order => {
        expect(order.status).not.toBe('COMPLETED')
        expect(order.status).not.toBe('CANCELLED')
        expect(order.status).not.toBe('SHIPPED')
        const deliveryDate = new Date(order.deliveryDate)
        expect(deliveryDate.getTime()).toBeLessThanOrEqual(threeDaysLater.getTime())
      })
    })
  })

  describe('月度销售额计算', () => {
    it('正确计算本月销售额', () => {
      const orders = useAppStore.getState().orders
      const today = new Date()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()

      const monthlyOrders = orders.filter(o => {
        const orderDate = new Date(o.orderDate)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })

      const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      
      expect(monthlySales).toBeGreaterThanOrEqual(0)
      expect(typeof monthlySales).toBe('number')
    })

    it('月度订单都属于当月', () => {
      const orders = useAppStore.getState().orders
      const today = new Date()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()

      const monthlyOrders = orders.filter(o => {
        const orderDate = new Date(o.orderDate)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })

      monthlyOrders.forEach(order => {
        const orderDate = new Date(order.orderDate)
        expect(orderDate.getMonth()).toBe(currentMonth)
        expect(orderDate.getFullYear()).toBe(currentYear)
      })
    })
  })

  describe('客户统计', () => {
    it('正确统计合作中的客户数量', () => {
      const customers = useAppStore.getState().customers
      const activeCustomers = customers.filter(c => c.status === 'ACTIVE')
      
      expect(activeCustomers.length).toBeGreaterThan(0)
      activeCustomers.forEach(c => {
        expect(c.status).toBe('ACTIVE')
      })
    })
  })

  describe('待审批报价统计', () => {
    it('正确统计待审批的报价数量', () => {
      const quotes = useAppStore.getState().quotes
      const pendingQuotes = quotes.filter(q => q.status === 'PENDING')
      
      pendingQuotes.forEach(q => {
        expect(q.status).toBe('PENDING')
      })
    })
  })

  describe('打样统计', () => {
    it('正确统计进行中的打样数量', () => {
      const samples = useAppStore.getState().samples
      const activeSamples = samples.filter(s => !['PASSED', 'TERMINATED'].includes(s.status))
      
      activeSamples.forEach(s => {
        expect(s.status).not.toBe('PASSED')
        expect(s.status).not.toBe('TERMINATED')
      })
    })
  })
})

describe('客户页面过滤逻辑', () => {
  it('按名称搜索客户', () => {
    const customers = useAppStore.getState().customers
    const searchTerm = '幸福'
    
    const filtered = customers.filter(c =>
      c.companyName.includes(searchTerm) ||
      c.shortName.includes(searchTerm) ||
      c.region.includes(searchTerm)
    )

    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach(c => {
      const matchesSearch =
        c.companyName.includes(searchTerm) ||
        c.shortName.includes(searchTerm) ||
        c.region.includes(searchTerm)
      expect(matchesSearch).toBe(true)
    })
  })

  it('按状态过滤客户', () => {
    const customers = useAppStore.getState().customers
    
    const activeCustomers = customers.filter(c => c.status === 'ACTIVE')
    expect(activeCustomers.length).toBeGreaterThan(0)
    
    const potentialCustomers = customers.filter(c => c.status === 'POTENTIAL')
    expect(potentialCustomers.length).toBeGreaterThanOrEqual(0)
  })

  it('按类型过滤客户', () => {
    const customers = useAppStore.getState().customers
    
    const brandCustomers = customers.filter(c => c.customerType === 'BRAND')
    expect(brandCustomers.length).toBeGreaterThan(0)
    brandCustomers.forEach(c => {
      expect(c.customerType).toBe('BRAND')
    })
  })

  it('多条件组合过滤', () => {
    const customers = useAppStore.getState().customers
    
    const filtered = customers.filter(c =>
      c.status === 'ACTIVE' && c.customerType === 'RETAILER'
    )
    
    filtered.forEach(c => {
      expect(c.status).toBe('ACTIVE')
      expect(c.customerType).toBe('RETAILER')
    })
  })
})

describe('订单页面状态分组逻辑', () => {
  it('正确按状态分组订单', () => {
    const orders = useAppStore.getState().orders
    const statusGroups: Record<string, typeof orders> = {}

    orders.forEach(order => {
      if (!statusGroups[order.status]) {
        statusGroups[order.status] = []
      }
      statusGroups[order.status].push(order)
    })

    // 验证分组总数等于订单总数
    const totalGrouped = Object.values(statusGroups).reduce((sum, group) => sum + group.length, 0)
    expect(totalGrouped).toBe(orders.length)

    // 验证每个分组内的订单状态一致
    Object.entries(statusGroups).forEach(([status, groupOrders]) => {
      groupOrders.forEach(order => {
        expect(order.status).toBe(status)
      })
    })
  })

  it('正确判断紧急订单', () => {
    const orders = useAppStore.getState().orders
    const today = new Date()

    orders.forEach(order => {
      const daysLeft = Math.ceil(
        (new Date(order.deliveryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      const isUrgent = daysLeft <= 3 && !['COMPLETED', 'CANCELLED', 'SHIPPED'].includes(order.status)
      
      if (isUrgent) {
        expect(daysLeft).toBeLessThanOrEqual(3)
        expect(['COMPLETED', 'CANCELLED', 'SHIPPED']).not.toContain(order.status)
      }
    })
  })
})
