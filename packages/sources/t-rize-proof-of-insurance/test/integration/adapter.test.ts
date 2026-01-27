import {
  TestAdapter,
  setEnvVariables,
} from '@chainlink/external-adapter-framework/util/testing-utils'
import * as nock from 'nock'
import {
  mockResponseSuccess,
  mockResponseSuccessZeroDays,
  mockResponseSuccessLargeDays,
  mockResponseMissingDaysRemaining,
  mockResponseMissingHash,
  mockResponseEmptyObject,
  mockResponseServerError,
  mockResponseUnauthorized,
  mockResponseNotFound,
  mockResponseRateLimited,
  mockResponseBadGateway,
  mockResponseNullData,
  mockResponseNegativeDays,
  mockResponseEmptyHash,
} from './fixtures'

describe('execute', () => {
  let spy: jest.SpyInstance
  let testAdapter: TestAdapter
  let oldEnv: NodeJS.ProcessEnv

  beforeAll(async () => {
    oldEnv = JSON.parse(JSON.stringify(process.env))
    process.env.TRIZE_API_TOKEN = process.env.TRIZE_API_TOKEN ?? 'fake-api-token'
    process.env.BACKGROUND_EXECUTE_MS = '0'

    const mockDate = new Date('2001-01-01T11:11:11.111Z')
    spy = jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

    const adapter = (await import('./../../src')).adapter
    adapter.rateLimiting = undefined
    testAdapter = await TestAdapter.startWithMockedCache(adapter, {
      testAdapter: {} as TestAdapter<never>,
    })
  })

  afterAll(async () => {
    setEnvVariables(oldEnv)
    await testAdapter.api.close()
    nock.restore()
    nock.cleanAll()
    spy.mockRestore()
  })

  afterEach(() => {
    nock.cleanAll()
    // Clear the EA cache between tests
    const keys = testAdapter.mockCache?.cache.keys()
    if (keys) {
      for (const key of keys) {
        testAdapter.mockCache?.delete(key)
      }
    }
  })

  describe('insurance_proof endpoint', () => {
    describe('happy path', () => {
      it('should return success', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseSuccess()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchSnapshot()
      })

      it('should return success with zero days remaining', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseSuccessZeroDays()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchSnapshot()
      })

      it('should return success with large days and long hash', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseSuccessLargeDays()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchSnapshot()
      })

      it('should use default endpoint when no endpoint specified', async () => {
        mockResponseSuccess()
        const response = await testAdapter.request({})
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchSnapshot()
      })
    })

    describe('edge cases', () => {
      it('should handle negative days remaining', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseNegativeDays()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchSnapshot()
      })

      it('should handle empty hash string', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseEmptyHash()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchSnapshot()
      })
    })

    describe('upstream response validation errors', () => {
      it('should fail when daysRemaining is missing', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseMissingDaysRemaining()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })

      it('should fail when hash is missing', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseMissingHash()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })

      it('should fail when response is empty object', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseEmptyObject()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })

      it('should fail when response data is null', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseNullData()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })
    })

    describe('upstream failures', () => {
      it('should handle 500 Internal Server Error', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseServerError()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })

      it('should handle 401 Unauthorized', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseUnauthorized()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })

      it('should handle 404 Not Found', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseNotFound()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })

      it('should handle 429 Rate Limited', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseRateLimited()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })

      it('should handle 502 Bad Gateway', async () => {
        const data = {
          endpoint: 'insurance_proof',
        }
        mockResponseBadGateway()
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(502)
        expect(response.json()).toMatchSnapshot()
      })
    })

    describe('validation errors', () => {
      it('should fail for invalid endpoint', async () => {
        const data = {
          endpoint: 'invalid_endpoint',
        }
        const response = await testAdapter.request(data)
        expect(response.statusCode).toBe(404)
        expect(response.json()).toMatchSnapshot()
      })
    })
  })
})
