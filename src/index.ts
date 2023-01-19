import { parseResponseStream } from './response'
import type { NativeResponse } from './response'
import { makeFullUrl } from './url'
import { makeRequestBody } from './requestBody'

type RequestOption = RequestInit & {
  baseUrl?: string
  params?: Record<string, any> | URLSearchParams
  data?: any
}

type SaxiosResponse<T = any> = {
  data: T
  status: number
  statusText: string
  headers: NativeResponse['headers']
  config: RequestOption
}

export function create(defaultRequestOption: RequestOption = {}) {
  /**
   * Call native fetch but throws an error if the status code is not 2xx
   */
  async function request(input: RequestInfo, customOptions: RequestOption = {}): Promise<SaxiosResponse> {
    const options = { ...defaultRequestOption, ...customOptions }
    const url = makeFullUrl(input.toString(), { baseUrl: options.baseUrl, params: options.params })

    if (options.data && !options.body) {
      options.body = makeRequestBody(options.data, options.headers?.['content-type'] || '')
    }

    const nativeResponse = await fetch(url, options)
    if (!nativeResponse.ok) {
      throw new Error(nativeResponse.statusText, { cause: nativeResponse })
    }
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
    get: (input: RequestInfo, customOptions: RequestOption = {}) => {
      return request(input, { ...customOptions, method: 'GET' })
    },
    post: (input: RequestInfo, data: any, customOptions: RequestOption = {}) => {
      return request(input, { ...customOptions, data, method: 'POST' })
    },
    put: (input: RequestInfo, data: any, customOptions: RequestOption = {}) => {
      return request(input, { ...customOptions, data, method: 'PUT' })
    },
    patch: (input: RequestInfo, data: any, customOptions: RequestOption = {}) => {
      return request(input, { ...customOptions, data, method: 'PATCH' })
    },
    delete: (input: RequestInfo, customOptions: RequestOption = {}) => {
      return request(input, { ...customOptions, method: 'DELETE' })
    },
    head: (input: RequestInfo, customOptions: RequestOption = {}) => {
      return request(input, { ...customOptions, method: 'HEAD' })
    },
    options: (input: RequestInfo, customOptions: RequestOption = {}) => {
      return request(input, { ...customOptions, method: 'OPTIONS' })
    }
  }

  return {
    request,
    ...shortcutMethods
  }
}

export default create()
