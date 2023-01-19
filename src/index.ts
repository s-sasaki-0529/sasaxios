import { parseResponseStream } from './nativeResponse'
import type { NativeResponse } from './nativeResponse'
import { makeFullUrl } from './url'
import { makeRequestBody } from './requestBody'

export type SaxiosURL = URL | string
export type SaxiosHeaders = Record<string, string> | Headers

export type SaxiosRequest = {
  baseUrl?: string
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
  params?: Record<string, any> | URLSearchParams
  data?: any
  headers?: SaxiosHeaders
}

export type SaxiosResponse<T = any> = {
  data: T
  status: number
  statusText: string
  headers: NativeResponse['headers']
  config: SaxiosRequest
}

export function create(defaultRequestOption: SaxiosRequest = {}) {
  /**
   * Call native fetch
   */
  async function request(url: SaxiosURL, customOptions: SaxiosRequest = {}): Promise<SaxiosResponse> {
    const options = { ...defaultRequestOption, ...customOptions }
    const fullUrl = makeFullUrl(url.toString(), { baseUrl: options.baseUrl, params: options.params })

    // transform saxios request to native fetch request
    const nativeRequest: RequestInit = {
      method: options.method?.toUpperCase() || 'GET',
      body: makeRequestBody(options.data, options.headers?.['content-type'] || ''),
      headers: options.headers
    }

    // Call native fetch but throws an error if the status code is not 2x
    const nativeResponse = await fetch(fullUrl, nativeRequest)
    if (!nativeResponse.ok) {
      throw new Error(nativeResponse.statusText, { cause: nativeResponse })
    }

    // transform native fetch response to saxios response
    return {
      data: await parseResponseStream(nativeResponse),
      status: nativeResponse.status,
      statusText: nativeResponse.statusText,
      headers: nativeResponse.headers,
      config: customOptions
    }
  }

  /**
   * Shortcut methods like axios
   */
  const shortcutMethods = {
    get: (url: SaxiosURL, customOptions: SaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'get' })
    },
    post: (url: SaxiosURL, data: any, customOptions: SaxiosRequest = {}) => {
      return request(url, { ...customOptions, data, method: 'post' })
    },
    put: (url: SaxiosURL, data: any, customOptions: SaxiosRequest = {}) => {
      return request(url, { ...customOptions, data, method: 'put' })
    },
    patch: (url: SaxiosURL, data: any, customOptions: SaxiosRequest = {}) => {
      return request(url, { ...customOptions, data, method: 'patch' })
    },
    delete: (url: SaxiosURL, customOptions: SaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'delete' })
    },
    head: (url: SaxiosURL, customOptions: SaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'head' })
    },
    options: (url: SaxiosURL, customOptions: SaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'options' })
    }
  }

  return {
    request,
    ...shortcutMethods
  }
}

export default create()
