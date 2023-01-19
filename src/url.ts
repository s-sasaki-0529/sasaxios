export function makeUrl(url: string, baseUrl?: string) {
  if (baseUrl) {
    return new URL(url, baseUrl).toString()
  }
  return url
}
