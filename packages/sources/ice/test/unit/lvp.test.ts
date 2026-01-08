import { LoggerFactory, LoggerFactoryProvider } from '@chainlink/external-adapter-framework/util'

// Mock logger
const log = jest.fn()
const logger = {
  fatal: log,
  error: log,
  warn: log,
  info: log,
  debug: log,
  trace: log,
  msgPrefix: 'mock-logger',
}

const loggerFactory: LoggerFactory = {
  child: () => logger,
}

LoggerFactoryProvider.set(loggerFactory)

// Mock the JsApi before importing StreamingClient
jest.mock('../../src/transport/netdania/jsApi/jsapi-nodejs', () => ({
  window: {
    NetDania: {
      JsApi: {
        Fields: {
          QUOTE_BID: 10,
          QUOTE_ASK: 11,
          QUOTE_MID_PRICE: 9,
          QUOTE_TIME_STAMP: 152,
          QUOTE_TIME_ZONE: 3015,
        },
        JSONConnection: jest.fn().mockImplementation(() => ({
          addListener: jest.fn(),
          Flush: jest.fn(),
          GetRequestList: jest.fn().mockReturnValue([]),
          addRequests: jest.fn(),
          RemoveRequests: jest.fn(),
          disconnect: jest.fn(),
          reconnect: jest.fn(),
          _tryReconnect: true,
        })),
        Request: {
          getReqObjPrice: jest.fn().mockImplementation((instrument, provider, flag) => ({
            t: 1,
            i: Math.floor(Math.random() * 10000),
            m: flag,
            s: instrument,
            p: provider,
          })),
        },
      },
    },
  },
}))

import { BaseEndpointTypes } from '../../src/endpoint/price'
import { StreamingClient } from '../../src/transport/netdania'

describe('LVP (Last Value Persistence)', () => {
  const mockSettings: BaseEndpointTypes['Settings'] = {
    API_ENDPOINT: 'https://test.example.com',
    API_ENDPOINT_FAILOVER_1: '',
    API_ENDPOINT_FAILOVER_2: '',
    API_ENDPOINT_FAILOVER_3: '',
    NETDANIA_PASSWORD: 'test-password',
    USER_GROUP: 'test.group',
    POLLING_INTERVAL: 2000,
    CONNECTING_TIMEOUT_MS: 4000,
    LVP_HEARTBEAT_INTERVAL: 100, // Short interval for testing
    CACHE_MAX_AGE: 90000,
  } as BaseEndpointTypes['Settings']

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('StreamingClient heartbeat', () => {
    it('should emit heartbeat events at configured interval', () => {
      const client = new StreamingClient(mockSettings)
      const heartbeatHandler = jest.fn()
      client.on('heartbeat', heartbeatHandler)
      ;(client as any).startHeartbeat()

      // No heartbeat yet
      expect(heartbeatHandler).not.toHaveBeenCalled()

      // First heartbeat after interval
      jest.advanceTimersByTime(100)
      expect(heartbeatHandler).toHaveBeenCalledTimes(1)

      // Second heartbeat
      jest.advanceTimersByTime(100)
      expect(heartbeatHandler).toHaveBeenCalledTimes(2)
      ;(client as any).stopHeartbeat()
    })

    it('should stop heartbeat on disconnect', () => {
      const client = new StreamingClient(mockSettings)
      const heartbeatHandler = jest.fn()
      client.on('heartbeat', heartbeatHandler)
      ;(client as any).startHeartbeat()

      // First heartbeat
      jest.advanceTimersByTime(100)
      expect(heartbeatHandler).toHaveBeenCalledTimes(1)

      // Disconnect stops heartbeat
      client.disconnect()

      // No more heartbeats after disconnect
      jest.advanceTimersByTime(200)
      expect(heartbeatHandler).toHaveBeenCalledTimes(1)
    })
  })
})
