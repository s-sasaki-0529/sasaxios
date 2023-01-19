/**
 *  make URL based on the baseUrl
 */
export function makeUrl(url: string, baseUrl?: string) {
  if (baseUrl) {
    return new URL(url, baseUrl).toString()
  }
  return url
}

/**
 * append query string to URL
 */
export function appendQueryString(url: string, params?: Record<string, any> | URLSearchParams) {
  if (!params) return url
  const searchParams = new URLSearchParams(params)

  if (url.indexOf('?') === -1) {
    return `${url}?${searchParams.toString()}`
  } else {
    return `${url}&${searchParams.toString()}`
  }
}
