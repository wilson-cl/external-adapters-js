import { AdapterConfig } from '@chainlink/external-adapter-framework/config'

export const config = new AdapterConfig({
  TRIZE_API_TOKEN: {
    description: 'Bearer token for T-Rize API authentication',
    type: 'string',
    required: true,
    sensitive: true,
  },
  API_ENDPOINT: {
    description: 'API endpoint for T-Rize',
    type: 'string',
    default: 'https://api.t-rize.com',
  },
})
