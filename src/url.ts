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

  // remove null/undefined value to prevent serialize to 'null' or 'undefined'
  for (const param of Object.keys(params)) {
    if (params[param] == null || params[param] === undefined) {
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
