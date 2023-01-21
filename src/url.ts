export type QueryString = Record<string, any> | URLSearchParams

/**
 * make full URL that includes baseURL and query string
 */
export function makeFullUrl(url: string, options?: { baseURL?: string; params?: QueryString }) {
  const { baseURL, params } = options || {}
  const fullUrl = insertBaseURL(url, baseURL)
  return appendQueryString(fullUrl, params)
}

/**
 *  insert baseURL to URL if baseURL is specified
 */
function insertBaseURL(url: string, baseURL?: string) {
  if (baseURL) {
    return url.replace(/^(?!.*\/\/)\/?/, baseURL + '/')
  }
  return url
}

/**
 * append query string to URL
 */
function appendQueryString(url: string, params?: QueryString) {
  if (!params) return url

  // remove empty values
  for (const param of Object.keys(params)) {
    const v = params[param]
    if (v === null || v === undefined) {
      delete params[param]
    } else if (typeof v === 'object' && Object.keys(v).length === 0) {
      delete params[param]
    } else if (Array.isArray(v) && v.length === 0) {
      delete params[param]
    }
  }

  const searchParams = new URLSearchParams(params)

  if (url.indexOf('?') === -1) {
    return `${url}?${searchParams.toString()}`
  } else {
    return `${url}&${searchParams.toString()}`
  }
}
