export function createTimeoutAbortController(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  const { signal } = controller
  setTimeout(() => controller.abort(), timeoutMs)
  return signal
}
