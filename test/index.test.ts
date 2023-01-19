import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import saxios from '../src/index'
import { server } from './server'
import _fetch from 'node-fetch'
import { rest } from 'msw'

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

  describe('Throws exception if status code is not 2xx', () => {
    function mockStatusCode(statusCode: number) {
      server.use(
        rest.get('http://127.0.0.1/', (req, res, ctx) => {
          return res.once(ctx.status(statusCode), ctx.text('GET /'))
        })
      )
    }

    test('200', async () => {
      mockStatusCode(200)
      const res = await saxios.request('http://127.0.0.1/')
      expect(res.status).toEqual(200)
    })

    test('201', async () => {
      mockStatusCode(201)
      const res = await saxios.request('http://127.0.0.1/')
      expect(res.status).toEqual(201)
    })

    test('301', async () => {
      mockStatusCode(301)
      await expect(saxios.request('http://127.0.0.1/')).rejects.toThrow('Moved Permanently')
    })

    test('400', async () => {
      mockStatusCode(400)
      await expect(saxios.request('http://127.0.0.1/')).rejects.toThrow('Bad Request')
    })

    test('403', async () => {
      mockStatusCode(403)
      await expect(saxios.request('http://127.0.0.1/')).rejects.toThrow('Forbidden')
    })

    test('404', async () => {
      mockStatusCode(404)
      await expect(saxios.request('http://127.0.0.1/')).rejects.toThrow('Not Found')
    })

    test('500', async () => {
      mockStatusCode(500)
      await expect(saxios.request('http://127.0.0.1/')).rejects.toThrow('Internal Server Error')
    })
  })
})
