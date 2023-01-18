export function create(defaultRequestInit: RequestInit = {}) {
  /**
   * Call native fetch but throws an error if the status code is not 2xx
   */
  async function request(input: RequestInfo, init: RequestInit = {}) {
    const nativeResponse = await fetch(input, { ...defaultRequestInit, ...init })
    if (!nativeResponse.ok) {
      throw new Error(nativeResponse.statusText, { cause: nativeResponse })
    }
    return nativeResponse
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
