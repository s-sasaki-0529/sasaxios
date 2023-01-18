import { describe, expect, test } from 'vitest'
import saxios from '../src/index'

describe('saxios', () => {
  describe('basic request methods', () => {
    test('#get', async () => {
      const res = await saxios.get('http://127.0.0.1:3000/')
      const text = await res.text()
      expect(text).toEqual('GET /')
    })

    test('#post', async () => {
      const res = await saxios.post('http://127.0.0.1:3000/')
      const text = await res.text()
      expect(text).toEqual('POST /')
    })

    test('#put', async () => {
      const res = await saxios.put('http://127.0.0.1:3000/')
      const text = await res.text()
      expect(text).toEqual('PUT /')
    })

    test('#patch', async () => {
      const res = await saxios.patch('http://127.0.0.1:3000/')
      const text = await res.text()
      expect(text).toEqual('PATCH /')
    })

    test('#delete', async () => {
      const res = await saxios.delete('http://127.0.0.1:3000/')
      const text = await res.text()
      expect(text).toEqual('DELETE /')
    })

    test('#head', async () => {
      const res = await saxios.head('http://127.0.0.1:3000/')
      const header = res.headers.get('x-test')
      expect(header).toEqual('HEAD /')
    })

    test('#options', async () => {
      const res = await saxios.options('http://127.0.0.1:3000/')
      const text = await res.text()
      expect(text).toEqual('OPTIONS /')
    })
  })
})
