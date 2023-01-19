export type QueryString = Record<string, any> | URLSearchParams

/**
 * make full URL that includes baseURL and query string
 */
export function makeFullUrl(url: string, options?: { baseUrl?: string; params?: QueryString }) {
  const { baseUrl, params } = options || {}
  const fullUrl = insertBaseURL(url, baseUrl)
  return appendQueryString(fullUrl, params)
}

/**
 *  insert baseURL to URL if baseURL is specified
 */
function insertBaseURL(url: string, baseUrl?: string) {
  if (baseUrl) {
    return new URL(url, baseUrl).toString()
  }
  return url
}

/**
 * append query string to URL
 */
function appendQueryString(url: string, params?: QueryString) {
  if (!params) return url
  const searchParams = new URLSearchParams(params)

  if (url.indexOf('?') === -1) {
    return `${url}?${searchParams.toString()}`
  } else {
    return `${url}&${searchParams.toString()}`
  }
}
