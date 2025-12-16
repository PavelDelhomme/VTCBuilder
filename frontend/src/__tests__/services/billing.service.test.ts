import billingService from '@/services/billing.service'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock fetch for downloadInvoicePdf
global.fetch = jest.fn()

describe('BillingService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('getPricingPlans', () => {
    it('should fetch all pricing plans', async () => {
      const mockPlans = [
        { id: 1, name: 'Starter', slug: 'starter' },
        { id: 2, name: 'Business', slug: 'business' },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockPlans })

      const result = await billingService.getPricingPlans()

      expect(api.get).toHaveBeenCalledWith('/pricing-plans/', {
        validateStatus: expect.any(Function)
      })
      expect(result).toEqual(mockPlans)
    })

    it('should return empty array on 404/500 errors', async () => {
      const error = { response: { status: 404 } }
      ;(api.get as jest.Mock).mockRejectedValue(error)

      const result = await billingService.getPricingPlans()

      expect(result).toEqual([])
    })
  })

  describe('getPricingPlan', () => {
    it('should fetch pricing plan by id', async () => {
      const mockPlan = { id: 1, name: 'Starter' }
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockPlan })

      const result = await billingService.getPricingPlan(1)

      expect(api.get).toHaveBeenCalledWith('/pricing-plans/1/')
      expect(result).toEqual(mockPlan)
    })
  })

  describe('createPricingPlan', () => {
    it('should create a new pricing plan', async () => {
      const newPlan = { name: 'Enterprise', slug: 'enterprise', price_monthly: 99 }
      const mockResponse = { data: { id: 1, ...newPlan } }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await billingService.createPricingPlan(newPlan)

      expect(api.post).toHaveBeenCalledWith('/pricing-plans/', newPlan)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('updatePricingPlan', () => {
    it('should update pricing plan', async () => {
      const updates = { price_monthly: 149 }
      const mockResponse = { data: { id: 1, ...updates } }
      ;(api.put as jest.Mock).mockResolvedValue(mockResponse)

      const result = await billingService.updatePricingPlan(1, updates)

      expect(api.put).toHaveBeenCalledWith('/pricing-plans/1/', updates)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deletePricingPlan', () => {
    it('should delete pricing plan', async () => {
      ;(api.delete as jest.Mock).mockResolvedValue({ data: {} })

      await billingService.deletePricingPlan(1)

      expect(api.delete).toHaveBeenCalledWith('/pricing-plans/1/')
    })
  })

  describe('getSubscriptions', () => {
    it('should fetch all subscriptions', async () => {
      const mockSubscriptions = [
        { id: 1, status: 'active' },
        { id: 2, status: 'trial' },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockSubscriptions })

      const result = await billingService.getSubscriptions()

      expect(api.get).toHaveBeenCalledWith('/subscriptions/', { params: undefined })
      expect(result).toEqual(mockSubscriptions)
    })
  })

  describe('getSubscription', () => {
    it('should fetch subscription by id', async () => {
      const mockSubscription = { id: 1, status: 'active' }
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockSubscription })

      const result = await billingService.getSubscription(1)

      expect(api.get).toHaveBeenCalledWith('/subscriptions/1/')
      expect(result).toEqual(mockSubscription)
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription', async () => {
      ;(api.post as jest.Mock).mockResolvedValue({ data: { status: 'cancelled' } })

      const result = await billingService.cancelSubscription(1)

      expect(api.post).toHaveBeenCalledWith('/subscriptions/1/cancel/')
      expect(result.status).toBe('cancelled')
    })
  })

  describe('getInvoices', () => {
    it('should fetch all invoices', async () => {
      const mockInvoices = [
        { id: 1, invoice_number: 'INV-001' },
        { id: 2, invoice_number: 'INV-002' },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockInvoices })

      const result = await billingService.getInvoices()

      expect(api.get).toHaveBeenCalledWith('/invoices/', { params: undefined })
      expect(result).toEqual(mockInvoices)
    })
  })

  describe('getPaymentMethods', () => {
    it('should fetch payment methods', async () => {
      const mockMethods = [
        { id: 1, name: 'Credit Card', method_type: 'card' },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockMethods })

      const result = await billingService.getPaymentMethods()

      expect(api.get).toHaveBeenCalledWith('/payment-methods/')
      expect(result).toEqual(mockMethods)
    })

    it('should return empty array on 404', async () => {
      const error = { response: { status: 404 } }
      ;(api.get as jest.Mock).mockRejectedValue(error)

      const result = await billingService.getPaymentMethods()

      expect(result).toEqual([])
    })
  })

  describe('getUnpaidItems', () => {
    it('should fetch unpaid items', async () => {
      const mockUnpaid = {
        past_due_subscriptions: [],
        unpaid_invoices: [],
        overdue_invoices: [],
        stats: {
          past_due_count: 0,
          unpaid_invoices_count: 0,
          overdue_invoices_count: 0,
          total_unpaid_amount: 0,
          total_overdue_amount: 0,
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockUnpaid })

      const result = await billingService.getUnpaidItems()

      expect(api.get).toHaveBeenCalledWith('/billing/unpaid-items/')
      expect(result).toEqual(mockUnpaid)
    })

    it('should return empty structure on 404', async () => {
      const error = { response: { status: 404 } }
      ;(api.get as jest.Mock).mockRejectedValue(error)

      const result = await billingService.getUnpaidItems()

      expect(result).toHaveProperty('past_due_subscriptions')
      expect(result).toHaveProperty('unpaid_invoices')
      expect(result).toHaveProperty('overdue_invoices')
      expect(result).toHaveProperty('stats')
    })
  })

  describe('downloadInvoicePdf', () => {
    it('should download invoice PDF', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' })
      localStorage.setItem('token', 'test-token')
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })

      const result = await billingService.downloadInvoicePdf(1)

      expect(global.fetch).toHaveBeenCalled()
      expect(result).toBe(mockBlob)
    })
  })
})

