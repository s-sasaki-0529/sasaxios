import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import saxios from '../src/index'
import { server } from './server'
import _fetch from 'node-fetch'

// refs: https://t-yng.jp/post/msw-node18-error
global.fetch = _fetch

beforeAll(() => {
  server.listen()
})

afterAll(() => {
  server.close()
})

describe('saxios', () => {
  describe('Shortcut methods are available', () => {
    test('#get', async () => {
      const res = await saxios.request('http://127.0.0.1/')
      expect(res.data).toEqual('GET /')
    })

    test('#post', async () => {
      const res = await saxios.post('http://127.0.0.1/')
      expect(res.data).toEqual('POST /')
    })

    test('#put', async () => {
      const res = await saxios.put('http://127.0.0.1/')
      expect(res.data).toEqual('PUT /')
    })

    test('#patch', async () => {
      const res = await saxios.patch('http://127.0.0.1/')
      expect(res.data).toEqual('PATCH /')
    })

    test('#delete', async () => {
      const res = await saxios.delete('http://127.0.0.1/')
      expect(res.data).toEqual('DELETE /')
    })

    test('#head', async () => {
      const res = await saxios.head('http://127.0.0.1/')
      expect(res.headers.get('x-test')).toEqual('HEAD /')
    })

    test('#options', async () => {
      const res = await saxios.options('http://127.0.0.1/')
      expect(res.data).toEqual('OPTIONS /')
    })
  })
})
