export type SasaxiosURL = URL | string
export type SasaxiosHeaders = Record<string, string> | Headers

export type SasaxiosRequest = {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
  baseUrl?: string
  headers?: SasaxiosHeaders
  params?: Record<string, any> | URLSearchParams
  data?: any
  withCredentials?: boolean // NOTE: not supported same-origin
}
export type SasaxiosResponse<T = any> = {
  data: T
  status: number
  statusText: string
  headers: Response['headers']
  config: SasaxiosRequest
}
