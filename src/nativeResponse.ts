/**
 * Automatically parse the response based on the Content-Type.
 */
export async function parseResponseStream(response: Response) {
  const contentType = response.headers.get('content-type')
  if (contentType === null) return response.blob()
  if (contentType.startsWith('text/')) return response.text()
  if (contentType.includes('application/json')) return response.json()
  return response.blob()
}
