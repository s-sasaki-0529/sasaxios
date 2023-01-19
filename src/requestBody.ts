/**
 * make request body data according to the content-type
 */
export function makeRequestBody(data: any, contentType?: string) {
  if (!contentType) return data
  if (contentType.startsWith('text/')) return data.toString()

  // TODO: support more content-type
  return JSON.stringify(data)
}
