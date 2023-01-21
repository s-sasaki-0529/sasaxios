/**
 * make full URL that includes baseURL and query string
 */
export function makeFullUrl(url, options) {
    const { baseUrl, params } = options || {};
    const fullUrl = insertBaseURL(url, baseUrl);
    return appendQueryString(fullUrl, params);
}
/**
 *  insert baseURL to URL if baseURL is specified
 */
function insertBaseURL(url, baseUrl) {
    if (baseUrl) {
        return new URL(url, baseUrl).toString();
    }
    return url;
}
/**
 * append query string to URL
 */
function appendQueryString(url, params) {
    if (!params)
        return url;
    const searchParams = new URLSearchParams(params);
    if (url.indexOf('?') === -1) {
        return `${url}?${searchParams.toString()}`;
    }
    else {
        return `${url}&${searchParams.toString()}`;
    }
}
