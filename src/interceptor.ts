import { SaxiosRequest, SaxiosResponse } from './type'

export type SaxiosFulfilledInterceptor<V> = ((value: V) => V | Promise<V>) | null
export type SaxiosRejectedInterceptor = ((error: any) => any) | null

function createInterceptorManager<V>() {
  let currentIdIndex = 0
  const handlers: {
    id: number
    fulfilled: SaxiosFulfilledInterceptor<V>
    rejected: SaxiosRejectedInterceptor
  }[] = []

  function use(fulfilled: SaxiosFulfilledInterceptor<V>, rejected?: SaxiosRejectedInterceptor): number {
    handlers.push({ id: currentIdIndex, fulfilled, rejected: rejected || null })
    return currentIdIndex++
  }

  function eject(id: number) {
    const index = handlers.findIndex(interceptor => interceptor.id === id)
    if (index >= 0) {
      handlers.splice(index, 1)
    }
  }

  function clear() {
    handlers.length = 0
  }

  return {
    use,
    eject,
    clear,
    handlers
  }
}

export function createRequestInterceptorManager() {
  return createInterceptorManager<SaxiosRequest>()
}

export function createResponseInterceptorManager() {
  return createInterceptorManager<SaxiosResponse>()
}
