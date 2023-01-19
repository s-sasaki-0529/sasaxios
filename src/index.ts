import { parseResponseStream } from './response'
import type { NativeResponse } from './response'
import { urlToHttpOptions } from 'url'

type RequestOption = RequestInit & {
  baseUrl?: string
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
  async function request(input: RequestInfo, option: RequestOption = {}): Promise<SaxiosResponse> {
    const mergedOptions = { ...defaultRequestOption, ...option }
    const url = mergedOptions.baseUrl ? new URL(input.toString(), mergedOptions.baseUrl) : input

    const nativeResponse = await fetch(url, mergedOptions)
    if (!nativeResponse.ok) {
      throw new Error(nativeResponse.statusText, { cause: nativeResponse })
    }
    return {
      data: await parseResponseStream(nativeResponse),
      status: nativeResponse.status,
      statusText: nativeResponse.statusText,
      headers: nativeResponse.headers,
      config: option
    }
  }

  /**
   * Shortcut methods like axios
   */
  const shortcutMethods = {
    get: (input: RequestInfo, option: RequestOption = {}) => {
      return request(input, { ...option, method: 'GET' })
    },
    post: (input: RequestInfo, option: RequestOption = {}) => {
      return request(input, { ...option, method: 'POST' })
    },
    put: (input: RequestInfo, option: RequestOption = {}) => {
      return request(input, { ...option, method: 'PUT' })
    },
    patch: (input: RequestInfo, option: RequestOption = {}) => {
      return request(input, { ...option, method: 'PATCH' })
    },
    delete: (input: RequestInfo, option: RequestOption = {}) => {
      return request(input, { ...option, method: 'DELETE' })
    },
    head: (input: RequestInfo, option: RequestOption = {}) => {
      return request(input, { ...option, method: 'HEAD' })
    },
    options: (input: RequestInfo, option: RequestOption = {}) => {
      return request(input, { ...option, method: 'OPTIONS' })
    }
  }

  return {
    request,
    ...shortcutMethods
  }
}

export default create()
