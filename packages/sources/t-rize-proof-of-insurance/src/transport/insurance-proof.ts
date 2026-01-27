import { HttpTransport } from '@chainlink/external-adapter-framework/transports'
import { BaseEndpointTypes } from '../endpoint/insurance-proof'
import { createHash } from 'crypto'

export interface ResponseSchema {
  daysRemaining: number
  hash: string
}

export type HttpTransportTypes = BaseEndpointTypes & {
  Provider: {
    RequestBody: never
    ResponseBody: ResponseSchema
  }
}

const TWO_POW_191 = BigInt(2) ** BigInt(191)

/**
 * Converts a hash string to a BigInt via SHA-256, then applies mod 2^191.
 * Returns the result as a decimal string to preserve precision.
 */
export function hashToAum(hashString: string): string {
  const sha256Hash = createHash('sha256').update(hashString).digest('hex')
  const bigIntValue = BigInt('0x' + sha256Hash)
  const modValue = bigIntValue % TWO_POW_191
  return modValue.toString()
}

export const httpTransport = new HttpTransport<HttpTransportTypes>({
  prepareRequests: (params, config) => {
    return {
      params: params,
      request: {
        baseURL: config.API_ENDPOINT,
        url: '/',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${config.TRIZE_API_TOKEN}`,
        },
      },
    }
  },
  parseResponse: (params, response) => {
    if (!response.data || typeof response.data.daysRemaining === 'undefined') {
      return params.map((param) => ({
        params: param,
        response: {
          errorMessage: 'Response missing required field: daysRemaining',
          statusCode: 502,
        },
      }))
    }

    if (typeof response.data.hash === 'undefined') {
      return params.map((param) => ({
        params: param,
        response: {
          errorMessage: 'Response missing required field: hash',
          statusCode: 502,
        },
      }))
    }

    const navDate = response.data.daysRemaining
    const aum = hashToAum(response.data.hash)

    return params.map((param) => ({
      params: param,
      response: {
        result: null,
        data: {
          navDate,
          aum,
        },
      },
    }))
  },
})
