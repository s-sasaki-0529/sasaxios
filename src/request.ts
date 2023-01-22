import { SasaxiosRequest } from './type'

/**
 * merge two request options
 */
export function mergeOptions(defaultOptions: SasaxiosRequest, customOptions: SasaxiosRequest): SasaxiosRequest {
  return {
    method: customOptions.method ?? defaultOptions.method ?? 'get',
    baseURL: customOptions.baseURL ?? defaultOptions.baseURL ?? undefined,
    headers: {
      ...defaultOptions.headers,
      ...customOptions.headers
    },
    params: customOptions.params ?? defaultOptions.params ?? undefined,
    data: customOptions.data ?? defaultOptions.data ?? undefined,
    withCredentials: customOptions.withCredentials ?? defaultOptions.withCredentials ?? false,
    signal: customOptions.signal ?? defaultOptions.signal ?? undefined,
    timeout: customOptions.timeout ?? defaultOptions.timeout ?? undefined
  }
}

/**
 * Automatically set the content-type header
 */
export function setContentTypeHeader(options: SasaxiosRequest) {
  if (!options.headers) options.headers = {}
  if (options.headers['content-type']) return

  if (isJSONContent(options.data)) {
    options.headers['content-type'] = 'application/json'
  } else {
    options.headers['content-type'] = 'text/plain'
  }
}

/**
 * Transform sasaxios request to native fetch request
 */
export function makeNativeRequestConfig(options: SasaxiosRequest): RequestInit {
  const abortControllerForTimeout = options.timeout ? createTimeoutAbortController(options.timeout) : undefined

  return {
    method: options.method?.toUpperCase() || 'GET',
    body: makeRequestBody(options.data),
    headers: options.headers,
    credentials: options.withCredentials ? 'include' : 'same-origin',
    signal: options.signal || abortControllerForTimeout?.signal
  }
}

export const isJSONContent = (data: any) => {
  return typeof data === 'object' && typeof data.append !== 'function' && typeof data.text !== 'function'
}

/**
 * make request body data according to the format
 */
export function makeRequestBody(data: any) {
  if (!data) return undefined
  if (isJSONContent(data)) {
    return JSON.stringify(data)
  }
  // TODO: support other format
  return data
}

/**
 * make AbortController that aborts after timeoutMs
 */
export function createTimeoutAbortController(timeoutMs: number) {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller
}
