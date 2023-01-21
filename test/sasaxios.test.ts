import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { create } from '../src/sasaxios'
import { MOCK_SERVER_BASE_URL, server } from './server'
import _fetch from 'node-fetch'
import { rest } from 'msw'

const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

    describe('Automatically set the Content-Type header based on the request body', () => {
      test('if data is json object and Content-Type is not set', async () => {
        const res = await saxios.post(
          '/echo-content-type',
          { foo: 'bar' },
          {
            headers: { 'content-type': undefined }
          }
        )
        expect(res.data).toEqual('application/json')
      })

      test('if data is json object but Content-Type is set', async () => {
        const res = await saxios.post(
          '/echo-content-type',
          { foo: 'bar' },
          {
            headers: { 'content-type': 'text/plain' }
          }
        )
        expect(res.data).toEqual('text/plain')
      })

      test('if data is string and Content-Type is not set'),
        async () => {
          const res = await saxios.post('/echo-content-type', 'foo=bar', {
            headers: {
              'content-type': undefined
            }
          })
          expect(res.data).toEqual('text/plain')
        }
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

      test('application/json;charset=utf-8', async () => {
        mockContentType('application/json;charset=utf-8', '{"foo":"bar"}')

        const res = await saxios.request('/')
        expect(res.headers.get('content-type')).toEqual('application/json;charset=utf-8')
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

      test('text/html;charset=utf-8', async () => {
        mockContentType('text/html;charset=utf-8', '<html><body>foo</body></html>')

        const res = await saxios.request('/')
        expect(res.headers.get('content-type')).toEqual('text/html;charset=utf-8')
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

    describe('Interceptors', () => {
      describe('request', () => {
        describe('use', () => {
          describe('fulfilled', () => {
            test('sync', async () => {
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.request.use(config => {
                config.method = 'post'
                return config
              })

              const res = await saxios.get('/')
              expect(res.data).toEqual('POST /')
            })

            test('async', async () => {
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.request.use(async config => {
                config.method = 'patch'
                await sleep(10)
                return config
              })

              const res = await saxios.get('/')
              expect(res.data).toEqual('PATCH /')
            })
          })

          describe('rejected', () => {
            test('sync', async () => {
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.request.use(null, e => {
                return Promise.reject('override')
              })

              await expect(saxios.request('/dummy')).rejects.toThrow('override')
            })

            test('async', async () => {
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.request.use(null, async e => {
                await sleep(10)
                return Promise.reject('override')
              })

              await expect(saxios.request('/dummy')).rejects.toThrow('override')
            })
          })
        })

        describe('eject', () => {
          test('eject all interceptors', () => {
            const saxios = create()
            const id1 = saxios.interceptors.request.use(config => config)
            const id2 = saxios.interceptors.request.use(config => config)
            const id3 = saxios.interceptors.request.use(config => config)

            expect(saxios.interceptors.request.handlers).toHaveLength(3)

            saxios.interceptors.request.eject(id1)
            saxios.interceptors.request.eject(id3)

            expect(saxios.interceptors.request.handlers).toHaveLength(1)
            expect(saxios.interceptors.request.handlers[0].id).toEqual(id2)

            saxios.interceptors.request.eject(id2)
            expect(saxios.interceptors.request.handlers).toHaveLength(0)
          })
        })
      })

      describe('response', () => {
        describe('use', () => {
          describe('fulfilled', () => {
            test('sync', async () => {
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.response.use(response => {
                response.data = 'override'
                return response
              })

              const res = await saxios.get('/')
              expect(res.data).toEqual('override')
            })

            test('async', async () => {
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.response.use(async response => {
                response.data = 'override'
                await sleep(10)
                return response
              })

              const res = await saxios.get('/')
              expect(res.data).toEqual('override')
            })
          })

          describe('rejected', () => {
            function mockStatusCode(statusCode: number) {
              server.use(
                rest.get(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
                  return res.once(ctx.status(statusCode), ctx.text('GET /'))
                })
              )
            }

            test('sync', async () => {
              mockStatusCode(400)
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.response.use(null, e => {
                e.message = 'override'
                throw e
              })

              await expect(saxios.request('/')).rejects.toThrow('override')
            })

            test('async', async () => {
              mockStatusCode(500)
              const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
              saxios.interceptors.response.use(null, async e => {
                e.message = 'override'
                await sleep(10)
                throw e
              })

              await expect(saxios.request('/')).rejects.toThrow('override')
            })
          })

          describe('eject', () => {
            test('eject all interceptors', () => {
              const saxios = create()
              const id1 = saxios.interceptors.response.use(response => response)
              const id2 = saxios.interceptors.response.use(response => response)
              const id3 = saxios.interceptors.response.use(response => response)

              expect(saxios.interceptors.response.handlers).toHaveLength(3)

              saxios.interceptors.response.eject(id1)
              saxios.interceptors.response.eject(id3)

              expect(saxios.interceptors.response.handlers).toHaveLength(1)
              expect(saxios.interceptors.response.handlers[0].id).toEqual(id2)

              saxios.interceptors.response.eject(id2)
              expect(saxios.interceptors.response.handlers).toHaveLength(0)
            })
          })
        })
      })
    })
  })

  describe('Shortcut methods', () => {
    test('#get', async () => {
      const res = await saxios.get('/')
      expect(res.data).toEqual('GET /')
    })

    test('#post', async () => {
      const res = await saxios.post('/', {})
      expect(res.data).toEqual('POST /')
    })

    test('#put', async () => {
      const res = await saxios.put('/', {})
      expect(res.data).toEqual('PUT /')
    })

    test('#patch', async () => {
      const res = await saxios.patch('/', {})
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

  describe('Request options', () => {
    describe('baseURL', () => {
      test('specified', async () => {
        const saxios = create({ baseURL: MOCK_SERVER_BASE_URL })
        const res = await saxios.request('/')
        expect(res.data).toEqual('GET /')
      })

      test('default(undefined)', async () => {
        const saxios = create()
        const res = await saxios.request(`${MOCK_SERVER_BASE_URL}/`)
        expect(res.data).toEqual('GET /')
      })
    })

    describe('method', () => {
      test('get', async () => {
        const res = await saxios.request('/', { method: 'get' })
        expect(res.data).toEqual('GET /')
      })

      test('post', async () => {
        const res = await saxios.request('/', { method: 'post' })
        expect(res.data).toEqual('POST /')
      })

      test('put', async () => {
        const res = await saxios.request('/', { method: 'put' })
        expect(res.data).toEqual('PUT /')
      })

      test('patch', async () => {
        const res = await saxios.request('/', { method: 'patch' })
        expect(res.data).toEqual('PATCH /')
      })

      test('delete', async () => {
        const res = await saxios.request('/', { method: 'delete' })
        expect(res.data).toEqual('DELETE /')
      })

      test('head', async () => {
        const res = await saxios.request('/', { method: 'head' })
        expect(res.headers.get('x-test')).toEqual('HEAD /')
      })

      test('options', async () => {
        const res = await saxios.request('/', { method: 'options' })
        expect(res.data).toEqual('OPTIONS /')
      })

      test('default(get)', async () => {
        const res = await saxios.request('/')
        expect(res.data).toEqual('GET /')
      })
    })

    describe('params', () => {
      test('object', async () => {
        const res = await saxios.request('/echo-url', {
          params: {
            foo: 'bar',
            baz: 'qux',
            null: null,
            undefined: undefined,
            zero: 0,
            emptyStr: '',
            emptyObj: {},
            emptyArr: []
          }
        })
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url?foo=bar&baz=qux&zero=0&emptyStr=`)
      })

      test('URLSearchParams', async () => {
        const res = await saxios.request('/echo-url', {
          params: new URLSearchParams({ foo: 'bar', baz: 'qux' })
        })
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url?foo=bar&baz=qux`)
      })

      test('default(undefined)', async () => {
        const res = await saxios.request('/echo-url')
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url`)
      })

      test('merging URL and params', async () => {
        const res = await saxios.request('/echo-url?foo=bar', { params: { baz: 'qux' } })
        expect(res.data).toEqual(`${MOCK_SERVER_BASE_URL}/echo-url?foo=bar&baz=qux`)
      })
    })

    describe('data', () => {
      test('text/plain', async () => {
        const res = await saxios.post('/echo-body', 'foo')
        expect(res.data).toEqual('foo')
      })

      test('application/json', async () => {
        const res = await saxios.post('/echo-body', { foo: 'bar' })
        expect(res.data).toEqual('{"foo":"bar"}')
      })
    })

    describe('headers', () => {
      test('object', async () => {
        const res = await saxios.request('/echo-headers', { headers: { foo: 'bar', baz: 'qux' } })
        expect(res.data.foo).toEqual('bar')
        expect(res.data.baz).toEqual('qux')
      })

      test('Headers', async () => {
        const res = await saxios.request('/echo-headers', { headers: new Headers({ foo: 'bar', baz: 'qux' }) })
        expect(res.data.foo).toEqual('bar')
        expect(res.data.baz).toEqual('qux')
      })

      test('default(undefined)', async () => {
        const res = await saxios.request('/echo-headers')
        expect(res.data.foo).toBeUndefined()
        expect(res.data.baz).toBeUndefined()
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

      test('default(false)', async () => {
        await saxios.request('/set-cookie')
        const res = await saxios.request('/set-cookie', { withCredentials: true })
        expect(res.headers.get('set-cookie')).toBeFalsy()
      })
    })
  })
})
