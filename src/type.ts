export type SaxiosURL = URL | string
export type SaxiosHeaders = Record<string, string> | Headers

export type SaxiosRequest = {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
  baseUrl?: string
  headers?: SaxiosHeaders
  params?: Record<string, any> | URLSearchParams
  data?: any
  withCredentials?: boolean // NOTE: not supported same-origin
}
export type SaxiosResponse<T = any> = {
  data: T
  status: number
  statusText: string
  headers: Response['headers']
  config: SaxiosRequest
}
