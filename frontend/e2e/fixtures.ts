import { test as base } from '@playwright/test'

type TestFixtures = {
  superAdminUser: {
    email: string
    password: string
  }
  tenantUser: {
    email: string
    password: string
  }
}

export const test = base.extend<TestFixtures>({
  superAdminUser: {
    email: 'admin@vtcbuilder.com',
    password: 'admin123',
  },
  tenantUser: {
    email: 'test@delhomme.ovh',
    password: 'tenant123',
  },
})

export { expect } from '@playwright/test'

