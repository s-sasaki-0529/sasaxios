import { SasaxiosRequest, SasaxiosResponse } from './type'

export type SasaxiosFulfilledInterceptor<V> = ((value: V) => V | Promise<V>) | null
export type SasaxiosRejectedInterceptor = ((error: any) => any) | null

function createInterceptorManager<V>() {
  let currentIdIndex = 0
  const handlers: {
    id: number
    fulfilled: SasaxiosFulfilledInterceptor<V>
    rejected: SasaxiosRejectedInterceptor
  }[] = []

  function use(fulfilled: SasaxiosFulfilledInterceptor<V>, rejected?: SasaxiosRejectedInterceptor): number {
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
  return createInterceptorManager<SasaxiosRequest>()
}

export function createResponseInterceptorManager() {
  return createInterceptorManager<SasaxiosResponse>()
}
