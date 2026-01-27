import nock from 'nock'

export const mockResponseSuccess = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(
      200,
      () => ({
        daysRemaining: 42,
        hash: '0xabc123def456',
      }),
      ['Content-Type', 'application/json', 'Connection', 'close'],
    )
    .persist()

export const mockResponseSuccessZeroDays = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(
      200,
      () => ({
        daysRemaining: 0,
        hash: '0x0',
      }),
      ['Content-Type', 'application/json', 'Connection', 'close'],
    )
    .persist()

export const mockResponseSuccessLargeDays = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(
      200,
      () => ({
        daysRemaining: 365,
        hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      }),
      ['Content-Type', 'application/json', 'Connection', 'close'],
    )
    .persist()

export const mockResponseMissingDaysRemaining = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(
      200,
      () => ({
        hash: '0xabc123def456',
      }),
      ['Content-Type', 'application/json', 'Connection', 'close'],
    )
    .persist()

export const mockResponseMissingHash = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(
      200,
      () => ({
        daysRemaining: 42,
      }),
      ['Content-Type', 'application/json', 'Connection', 'close'],
    )
    .persist()

export const mockResponseEmptyObject = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(200, () => ({}), ['Content-Type', 'application/json', 'Connection', 'close'])
    .persist()

export const mockResponseServerError = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(500, () => ({ error: 'Internal Server Error' }), [
      'Content-Type',
      'application/json',
      'Connection',
      'close',
    ])
    .persist()

export const mockResponseUnauthorized = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(401, () => ({ error: 'Unauthorized' }), [
      'Content-Type',
      'application/json',
      'Connection',
      'close',
    ])
    .persist()

export const mockResponseNotFound = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(404, () => ({ error: 'Not Found' }), [
      'Content-Type',
      'application/json',
      'Connection',
      'close',
    ])
    .persist()

export const mockResponseRateLimited = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(429, () => ({ error: 'Too Many Requests' }), [
      'Content-Type',
      'application/json',
      'Connection',
      'close',
    ])
    .persist()

export const mockResponseBadGateway = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(502, () => ({ error: 'Bad Gateway' }), [
      'Content-Type',
      'application/json',
      'Connection',
      'close',
    ])
    .persist()

export const mockResponseNullData = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(200, () => null, ['Content-Type', 'application/json', 'Connection', 'close'])
    .persist()

export const mockResponseNegativeDays = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(
      200,
      () => ({
        daysRemaining: -5,
        hash: '0xabc123def456',
      }),
      ['Content-Type', 'application/json', 'Connection', 'close'],
    )
    .persist()

export const mockResponseEmptyHash = (): nock.Scope =>
  nock('https://api.t-rize.com', {
    encodedQueryParams: true,
  })
    .get('/')
    .reply(
      200,
      () => ({
        daysRemaining: 42,
        hash: '',
      }),
      ['Content-Type', 'application/json', 'Connection', 'close'],
    )
    .persist()
