type NativeResponse = Response

type RequestOption = RequestInit & {
  data?: any
}

type SaxiosResponse<T = any> = {
  data: T
  status: number
  statusText: string
  headers: NativeResponse['headers']
  config: RequestOption
}

async function parseResponseStream(response: NativeResponse) {
  const contentType = response.headers.get('content-type')
  if (contentType === null) return response.blob()
  if (contentType.startsWith('text/')) return response.text()
  if (contentType === 'application/json') return response.json()
  return response.blob()
}

export function create(defaultRequestInit: RequestInit = {}) {
  /**
   * Call native fetch but throws an error if the status code is not 2xx
   */
  async function request(input: RequestInfo, init: RequestInit = {}): Promise<SaxiosResponse> {
    const nativeResponse = await fetch(input, { ...defaultRequestInit, ...init })
    if (!nativeResponse.ok) {
      throw new Error(nativeResponse.statusText, { cause: nativeResponse })
    }
    return {
      data: await parseResponseStream(nativeResponse),
      status: nativeResponse.status,
      statusText: nativeResponse.statusText,
      headers: nativeResponse.headers,
      config: init
    }
  }

  return {
    request,
    get: (input: RequestInfo, init: RequestInit = {}) => {
      return request(input, { ...init, method: 'GET' })
    },
    post: (input: RequestInfo, init: RequestInit = {}) => {
      return request(input, { ...init, method: 'POST' })
    },
    put: (input: RequestInfo, init: RequestInit = {}) => {
      return request(input, { ...init, method: 'PUT' })
    },
    patch: (input: RequestInfo, init: RequestInit = {}) => {
      return request(input, { ...init, method: 'PATCH' })
    },
    delete: (input: RequestInfo, init: RequestInit = {}) => {
      return request(input, { ...init, method: 'DELETE' })
    },
    head: (input: RequestInfo, init: RequestInit = {}) => {
      return request(input, { ...init, method: 'HEAD' })
    },
    options: (input: RequestInfo, init: RequestInit = {}) => {
      return request(input, { ...init, method: 'OPTIONS' })
    }
  }
}

export default create()
