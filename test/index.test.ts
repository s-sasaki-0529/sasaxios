import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { create } from '../src/index'
import { MOCK_SERVER_BASE_URL, server } from './server'
import _fetch from 'node-fetch'
import { rest } from 'msw'

const saxios = create({ baseUrl: MOCK_SERVER_BASE_URL })

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
      const res = await saxios.request('/')
      expect(res.data).toEqual('GET /')
    })

    test('#post', async () => {
      const res = await saxios.post('/')
      expect(res.data).toEqual('POST /')
    })

    test('#put', async () => {
      const res = await saxios.put('/')
      expect(res.data).toEqual('PUT /')
    })

    test('#patch', async () => {
      const res = await saxios.patch('/')
      expect(res.data).toEqual('PATCH /')
    })

    test('#delete', async () => {
      const res = await saxios.delete('/')
      expect(res.data).toEqual('DELETE /')
    })

    test('#head', async () => {
      const res = await saxios.head('/')
      expect(res.headers.get('x-test')).toEqual('HEAD /')
    })

    test('#options', async () => {
      const res = await saxios.options('/')
      expect(res.data).toEqual('OPTIONS /')
    })
  })

  describe('Throws exception if status code is not 2xx', () => {
    function mockStatusCode(statusCode: number) {
      server.use(
        rest.get(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
          return res.once(ctx.status(statusCode), ctx.text('GET /'))
        })
      )
    }

    test('200', async () => {
      mockStatusCode(200)
      const res = await saxios.request('/')
      expect(res.status).toEqual(200)
    })

    test('201', async () => {
      mockStatusCode(201)
      const res = await saxios.request('/')
      expect(res.status).toEqual(201)
    })

    test('301', async () => {
      mockStatusCode(301)
      await expect(saxios.request('/')).rejects.toThrow('Moved Permanently')
    })

    test('400', async () => {
      mockStatusCode(400)
      await expect(saxios.request('/')).rejects.toThrow('Bad Request')
    })

    test('403', async () => {
      mockStatusCode(403)
      await expect(saxios.request('/')).rejects.toThrow('Forbidden')
    })

    test('404', async () => {
      mockStatusCode(404)
      await expect(saxios.request('/')).rejects.toThrow('Not Found')
    })

    test('500', async () => {
      mockStatusCode(500)
      await expect(saxios.request('/')).rejects.toThrow('Internal Server Error')
    })
  })

  describe('Automatically parse the response based on the Content-Type', () => {
    function mockContentType(contentType: string, data: string) {
      server.use(
        rest.get(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
          return res.once(ctx.set('content-type', contentType), ctx.body(data))
        })
      )
    }

    test('application/json', async () => {
      mockContentType('application/json', '{"foo":"bar"}')

      const res = await saxios.request('/')
      expect(res.headers.get('content-type')).toEqual('application/json')
      expect(res.data).toEqual({ foo: 'bar' })
    })

    test('text/plain', async () => {
      mockContentType('text/plain', '{"foo":"bar"}')

      const res = await saxios.request('/')
      expect(res.headers.get('content-type')).toEqual('text/plain')
      expect(res.data).toEqual('{"foo":"bar"}')
    })

    test('text/html', async () => {
      mockContentType('text/html', '<html><body>foo</body></html>')

      const res = await saxios.request('/')
      expect(res.headers.get('content-type')).toEqual('text/html')
      expect(res.data).toEqual('<html><body>foo</body></html>')
    })

    test('others', async () => {
      mockContentType('application/octet-stream', 'foo')

      const res = await saxios.request('/')
      const text = await res.data.text()
      expect(res.headers.get('content-type')).toEqual('application/octet-stream')
      expect(res.data.type).toEqual('application/octet-stream')
      expect(text).toEqual('foo')
    })
  })

  describe('Determine the URL based on the base URL', () => {
    test('no baseUrl', async () => {
      const saxios = create()
      const res = await saxios.request(`${MOCK_SERVER_BASE_URL}/`)
      expect(res.data).toEqual('GET /')
    })

    test('with baseUrl', async () => {
      const saxios = create({ baseUrl: MOCK_SERVER_BASE_URL })
      const res = await saxios.request('/')
      expect(res.data).toEqual('GET /')
    })
  })
})
