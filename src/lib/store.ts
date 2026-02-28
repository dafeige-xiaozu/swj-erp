import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Customer, 
  Order, 
  Quote, 
  Sample, 
  QcRecord, 
  FollowUp,
  Product,
  User
} from '@/types'
import { 
  mockCustomers, 
  mockOrders, 
  mockQuotes, 
  mockSamples, 
  mockQcRecords, 
  mockFollowUps,
  mockProducts,
  mockUsers
} from '@/data/mockData'
import { generateId, generateOrderNo, generateSampleNo, generateQuoteNo, generateQcRecordNo } from '@/lib/utils'

interface AppState {
  // Data
  customers: Customer[]
  orders: Order[]
  quotes: Quote[]
  samples: Sample[]
  qcRecords: QcRecord[]
  followUps: FollowUp[]
  products: Product[]
  users: User[]
  
  // Current user (mock)
  currentUser: User | null
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'contacts'>) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  updateOrderStatus: (id: string, status: Order['status']) => void
  deleteOrder: (id: string) => void
  
  // Quote actions
  addQuote: (quote: Omit<Quote, 'id' | 'quoteNo' | 'createdAt' | 'version'>) => void
  updateQuote: (id: string, updates: Partial<Quote>) => void
  
  // Sample actions
  addSample: (sample: Omit<Sample, 'id' | 'sampleNo' | 'createdAt'>) => void
  updateSample: (id: string, updates: Partial<Sample>) => void
  
  // QC Record actions
  addQcRecord: (record: Omit<QcRecord, 'id' | 'recordNo' | 'createdAt'>) => void
  
  // Follow Up actions
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => void
  
  // Helpers
  getCustomerById: (id: string) => Customer | undefined
  getProductById: (id: string) => Product | undefined
  getUserById: (id: string) => User | undefined
  getOrdersByCustomerId: (customerId: string) => Order[]
  getQcRecordsByOrderId: (orderId: string) => QcRecord[]
  getFollowUpsByCustomerId: (customerId: string) => FollowUp[]
  getSamplesByCustomerId: (customerId: string) => Sample[]
  getQuotesByCustomerId: (customerId: string) => Quote[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial data from mock
      customers: mockCustomers,
      orders: mockOrders,
      quotes: mockQuotes,
      samples: mockSamples,
      qcRecords: mockQcRecords,
      followUps: mockFollowUps,
      products: mockProducts,
      users: mockUsers,
      currentUser: mockUsers[0], // Default to first sales person
      
      // Customer actions
      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, {
          ...customer,
          id: generateId(),
          createdAt: new Date().toISOString(),
          contacts: [],
        }]
      })),
      
      updateCustomer: (id, updates) => set((state) => ({
        customers: state.customers.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),
      
      // Order actions
      addOrder: (order) => set((state) => ({
        orders: [...state.orders, {
          ...order,
          id: generateId(),
          orderNo: generateOrderNo(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
      })),
      
      updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
        )
      })),
      
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
        )
      })),
      
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
      })),
      
      // Quote actions
      addQuote: (quote) => {
        const existingQuotes = get().quotes.filter(
          q => q.customerId === quote.customerId && q.productId === quote.productId
        )
        const version = existingQuotes.length + 1
        
        set((state) => ({
          quotes: [...state.quotes, {
            ...quote,
            id: generateId(),
            quoteNo: generateQuoteNo(),
            createdAt: new Date().toISOString(),
            version,
          }]
        }))
      },
      
      updateQuote: (id, updates) => set((state) => ({
        quotes: state.quotes.map(q => 
          q.id === id ? { ...q, ...updates } : q
        )
      })),
      
      // Sample actions
      addSample: (sample) => set((state) => ({
        samples: [...state.samples, {
          ...sample,
          id: generateId(),
          sampleNo: generateSampleNo(),
          createdAt: new Date().toISOString(),
        }]
      })),
      
      updateSample: (id, updates) => set((state) => ({
        samples: state.samples.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      
      // QC Record actions
      addQcRecord: (record) => set((state) => ({
        qcRecords: [...state.qcRecords, {
          ...record,
          id: generateId(),
          recordNo: generateQcRecordNo(),
          createdAt: new Date().toISOString(),
        }]
      })),
      
      // Follow Up actions
      addFollowUp: (followUp) => set((state) => ({
        followUps: [...state.followUps, {
          ...followUp,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }]
      })),
      
      // Helpers
      getCustomerById: (id) => get().customers.find(c => c.id === id),
      getProductById: (id) => get().products.find(p => p.id === id),
      getUserById: (id) => get().users.find(u => u.id === id),
      getOrdersByCustomerId: (customerId) => get().orders.filter(o => o.customerId === customerId),
      getQcRecordsByOrderId: (orderId) => get().qcRecords.filter(r => r.orderId === orderId),
      getFollowUpsByCustomerId: (customerId) => get().followUps.filter(f => f.customerId === customerId),
      getSamplesByCustomerId: (customerId) => get().samples.filter(s => s.customerId === customerId),
      getQuotesByCustomerId: (customerId) => get().quotes.filter(q => q.customerId === customerId),
    }),
    {
      name: 'swj-erp-storage',
      version: 2, // 升级版本以强制更新产品数据
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as object) }
        // 始终使用最新的 mockProducts（包含 spec 和 weight 字段）
        merged.products = mockProducts
        merged.users = mockUsers
        return merged
      },
    }
  )
)
