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
  describe('Basic functions', () => {
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
  })

  describe('Shortcut methods', () => {
    test('#get is available', async () => {
      const res = await saxios.request('/')
      expect(res.data).toEqual('GET /')
    })

    test('#post is available', async () => {
      const res = await saxios.post('/', {})
      expect(res.data).toEqual('POST /')
    })

    test('#put is available', async () => {
      const res = await saxios.put('/', {})
      expect(res.data).toEqual('PUT /')
    })

    test('#patch is available', async () => {
      const res = await saxios.patch('/', {})
      expect(res.data).toEqual('PATCH /')
    })

    test('#delete is available', async () => {
      const res = await saxios.delete('/')
      expect(res.data).toEqual('DELETE /')
    })

    test('#head is available', async () => {
      const res = await saxios.head('/')
      expect(res.headers.get('x-test')).toEqual('HEAD /')
    })

    test('#options is available', async () => {
      const res = await saxios.options('/')
      expect(res.data).toEqual('OPTIONS /')
    })
  })

  describe('Request options', () => {
    describe('baseUrl', () => {
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

    //describe.skip('method', () => {})

    describe('params', () => {
      test('params is undefined', async () => {
        const res = await saxios.request('/echo-url')
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url`)
      })

      test('params is object', async () => {
        const res = await saxios.request('/echo-url', { params: { foo: 'bar', baz: 'qux' } })
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url?foo=bar&baz=qux`)
      })

      test('params is URLSearchParams', async () => {
        const res = await saxios.request('/echo-url', { params: new URLSearchParams({ foo: 'bar', baz: 'qux' }) })
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url?foo=bar&baz=qux`)
      })

      test('direct pass params to URL', async () => {
        const res = await saxios.request('/echo-url?foo=bar&baz=qux')
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url?foo=bar&baz=qux`)
      })

      test('direct pass params with object params', async () => {
        const res = await saxios.request('/echo-url?foo=bar', { params: { baz: 'qux' } })
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url?foo=bar&baz=qux`)
      })
    })

    describe('data', () => {
      test('data is undefined', async () => {
        const res = await saxios.post('/echo-body', undefined)
        expect(res.data).toEqual('')
      })

      test('data is text/plain', async () => {
        const res = await saxios.post('/echo-body', 'foo', { headers: { 'content-type': 'text/plain' } })
        expect(res.data).toEqual('foo')
      })

      test('data is application/json', async () => {
        const res = await saxios.post('/echo-body', { foo: 'bar' }, { headers: { 'content-type': 'application/json' } })
        expect(res.data).toEqual('{"foo":"bar"}')
      })
    })

    describe('headers', () => {
      test('headers is undefined', async () => {
        const res = await saxios.request('/echo-headers')
        expect(res.data.foo).toBeUndefined()
        expect(res.data.baz).toBeUndefined()
      })

      test('headers is object', async () => {
        const res = await saxios.request('/echo-headers', { headers: { foo: 'bar', baz: 'qux' } })
        console.log(res.data)
        expect(res.data.foo).toEqual('bar')
        expect(res.data.baz).toEqual('qux')
      })

      test('headers is Headers instance', async () => {
        const res = await saxios.request('/echo-headers', { headers: new Headers({ foo: 'bar', baz: 'qux' }) })
        expect(res.data.foo).toEqual('bar')
        expect(res.data.baz).toEqual('qux')
      })
    })

    // NOTE: node-fetch is not support credentials option.
    // eslint-disable-next-line no-restricted-properties
    describe.skip('withCredentials', () => {
      test('true', async () => {
        await saxios.request('/set-cookie', { withCredentials: true })
        const res = await saxios.request('/set-cookie', { withCredentials: true })
        expect(res.headers.get('set-cookie')).toEqual('foo=bar')
      })

      test('false', async () => {
        await saxios.request('/set-cookie', { withCredentials: true })
        const res = await saxios.request('/set-cookie', { withCredentials: true })
        expect(res.headers.get('set-cookie')).toBeFalsy()
      })
    })
  })
})
