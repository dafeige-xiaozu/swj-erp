import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatDateTime,
  formatCurrency,
  generateId,
  generateOrderNo,
  generateSampleNo,
  generateQuoteNo,
  generateQcRecordNo,
} from '@/lib/utils'

// ===== cn() =====
describe('cn', () => {
  it('合并普通类名', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('处理条件类名', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('处理 undefined 和 null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('合并 Tailwind 冲突类名（后者优先）', () => {
    const result = cn('px-4', 'px-6')
    expect(result).toBe('px-6')
  })

  it('处理空参数', () => {
    expect(cn()).toBe('')
  })
})

// ===== formatCurrency() =====
describe('formatCurrency', () => {
  it('格式化正数金额', () => {
    const result = formatCurrency(12000)
    expect(result).toContain('12,000')
    expect(result).toContain('¥')
  })

  it('格式化零值', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('格式化小数金额', () => {
    const result = formatCurrency(123.45)
    expect(result).toContain('123.45')
  })

  it('格式化大数值', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1,000,000')
  })

  it('格式化负数金额', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500')
  })
})

// ===== formatDate() =====
describe('formatDate', () => {
  it('格式化 Date 对象', () => {
    const result = formatDate(new Date('2026-02-28'))
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/02|2/)
    expect(result).toMatch(/28/)
  })

  it('格式化日期字符串', () => {
    const result = formatDate('2026-02-28')
    expect(result).toMatch(/2026/)
  })

  it('格式化另一个日期', () => {
    const result = formatDate('2026-12-31')
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/12/)
    expect(result).toMatch(/31/)
  })
})

// ===== formatDateTime() =====
describe('formatDateTime', () => {
  it('格式化日期时间字符串', () => {
    const result = formatDateTime('2026-02-28T10:30:00')
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/10/)
    expect(result).toMatch(/30/)
  })

  it('格式化 Date 对象', () => {
    const date = new Date('2026-02-28T14:00:00')
    const result = formatDateTime(date)
    expect(result).toMatch(/2026/)
  })
})

// ===== generateId() =====
describe('generateId', () => {
  it('生成非空字符串', () => {
    const id = generateId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('生成唯一 ID（100 次不重复）', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })
})

// ===== generateOrderNo() =====
describe('generateOrderNo', () => {
  it('生成以 OD 开头的订单号', () => {
    const orderNo = generateOrderNo()
    expect(orderNo).toMatch(/^OD/)
  })

  it('订单号包含当前日期', () => {
    const orderNo = generateOrderNo()
    const today = new Date()
    const year = today.getFullYear().toString()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    expect(orderNo).toContain(`${year}${month}${day}`)
  })

  it('订单号长度正确', () => {
    const orderNo = generateOrderNo()
    // OD(2) + YYYYMMDD(8) + 随机(3) = 13
    expect(orderNo.length).toBe(13)
  })

  it('多次生成不重复（大概率）', () => {
    const nos = new Set<string>()
    for (let i = 0; i < 50; i++) {
      nos.add(generateOrderNo())
    }
    // 大概率不重复（随机数 000-999）
    expect(nos.size).toBeGreaterThan(40)
  })
})

// ===== generateSampleNo() =====
describe('generateSampleNo', () => {
  it('生成以 SP 开头的打样号', () => {
    const sampleNo = generateSampleNo()
    expect(sampleNo).toMatch(/^SP/)
  })

  it('打样号长度正确', () => {
    const sampleNo = generateSampleNo()
    expect(sampleNo.length).toBe(13)
  })
})

// ===== generateQuoteNo() =====
describe('generateQuoteNo', () => {
  it('生成以 QT 开头的报价号', () => {
    const quoteNo = generateQuoteNo()
    expect(quoteNo).toMatch(/^QT/)
  })

  it('报价号长度正确', () => {
    const quoteNo = generateQuoteNo()
    expect(quoteNo.length).toBe(13)
  })
})

// ===== generateQcRecordNo() =====
describe('generateQcRecordNo', () => {
  it('生成以 QC 开头的质检号', () => {
    const qcNo = generateQcRecordNo()
    expect(qcNo).toMatch(/^QC/)
  })

  it('质检号长度正确', () => {
    const qcNo = generateQcRecordNo()
    expect(qcNo.length).toBe(13)
  })
})
