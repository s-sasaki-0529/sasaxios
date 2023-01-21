import { parseResponseStream } from './nativeResponse'
import { makeFullUrl } from './url'
import { isJSONContent, makeRequestBody } from './requestBody'
import { SasaxiosRequest, SasaxiosResponse, SasaxiosURL } from './type'
import { createRequestInterceptorManager, createResponseInterceptorManager } from './interceptor'
export * from './type'

export function create(defaultRequestOption: SasaxiosRequest = {}) {
  /**
   * Shortcut methods
   */
  const shortcutMethods = {
    get: (url: SasaxiosURL, customOptions: SasaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'get' })
    },
    post: (url: SasaxiosURL, data?: any, customOptions: SasaxiosRequest = {}) => {
      return request(url, { ...customOptions, data, method: 'post' })
    },
    put: (url: SasaxiosURL, data?: any, customOptions: SasaxiosRequest = {}) => {
      return request(url, { ...customOptions, data, method: 'put' })
    },
    patch: (url: SasaxiosURL, data?: any, customOptions: SasaxiosRequest = {}) => {
      return request(url, { ...customOptions, data, method: 'patch' })
    },
    delete: (url: SasaxiosURL, customOptions: SasaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'delete' })
    },
    head: (url: SasaxiosURL, customOptions: SasaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'head' })
    },
    options: (url: SasaxiosURL, customOptions: SasaxiosRequest = {}) => {
      return request(url, { ...customOptions, method: 'options' })
    }
  }

  // request/response interceptors
  const requestInterceptor = createRequestInterceptorManager()
  const responseInterceptor = createResponseInterceptorManager()

  /**
   * Call native fetch
   */
  async function request(url: SasaxiosURL, customOptions: SasaxiosRequest = {}): Promise<SasaxiosResponse> {
    let options = { ...defaultRequestOption, ...customOptions }
    const fullUrl = makeFullUrl(url.toString(), { baseURL: options.baseURL, params: options.params })

    // Call request interceptors before fetch
    for (const interceptor of requestInterceptor.handlers) {
      if (interceptor.fulfilled) {
        options = await interceptor.fulfilled(options)
      }
    }

    // Set default content-type
    if (!options.headers) {
      options.headers = {}
    }
    if (options.headers['content-type'] === undefined) {
      if (isJSONContent(options.data)) {
        options.headers['content-type'] = 'application/json'
      } else {
        options.headers['content-type'] = 'text/plain'
      }
    }

    // Transform saxios request to native fetch request
    const nativeRequestConfig: RequestInit = {
      method: options.method?.toUpperCase() || 'GET',
      body: makeRequestBody(options.data),
      headers: {
        // TODO: support other format
        'content-type':
          !options.headers?.['content-type'] && isJSONContent(options.data)
            ? 'application/json'
            : options.headers?.['content-type'],
        ...options.headers
      },
      credentials: options.withCredentials ? 'include' : 'omit'
    }

    try {
      // Call native fetch
      const nativeResponse = await fetch(fullUrl, nativeRequestConfig)

      // if native fetch is success but response status is not 2xx, throw error
      if (!nativeResponse.ok) {
        const error = new Error(nativeResponse.statusText, { cause: nativeResponse })
        for (const interceptor of responseInterceptor.handlers) {
          if (interceptor.rejected) {
            await interceptor.rejected(error)
          }
        }
        throw error
      }

      // transform native fetch response to saxios response
      const response = {
        data: await parseResponseStream(nativeResponse),
        status: nativeResponse.status,
        statusText: nativeResponse.statusText,
        headers: nativeResponse.headers,
        config: customOptions
      }

      // Call response interceptors after fetch
      for (const interceptor of responseInterceptor.handlers) {
        if (interceptor.fulfilled) {
          await interceptor.fulfilled(response)
        }
      }

      return response
    } catch (e) {
      // if native fetch is failed, call rejected request interceptor
      for (const interceptor of requestInterceptor.handlers) {
        if (interceptor.rejected) {
          await interceptor.rejected(e)
        }
      }
      throw e
    }
  }

  return {
    request,
    interceptors: {
      request: requestInterceptor,
      response: responseInterceptor
    },
    ...shortcutMethods
  }
}

export default create()
