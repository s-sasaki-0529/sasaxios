/**
 * make request body data according to the format
 */
export function makeRequestBody(data: any) {
  if (!data) return undefined
  if (typeof data === 'object' && typeof data.append !== 'function' && typeof data.text !== 'function') {
    return JSON.stringify(data)
  }
  // TODO: support other format
  return data
}
