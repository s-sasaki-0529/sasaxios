import { describe, expect, test } from 'vitest'
import { makeNativeRequestConfig, makeRequestBody, mergeOptions, setContentTypeHeader } from '../../src/request'
import { SasaxiosRequest } from '../../src/type'

describe('unit', () => {
  describe('request.ts', () => {
    describe('mergeOptions', () => {
      test('if both options are empty, return minimum options', () => {
        expect(mergeOptions({}, {})).toEqual({
          method: 'get',
          baseURL: undefined,
          headers: {},
          params: undefined,
          data: undefined,
          withCredentials: false
        })
      })

      test('if only defaultOptions is specified, return defaultOptions', () => {
        const defaultOptions: SasaxiosRequest = {
          method: 'post',
          baseURL: 'http://localhost:3000',
          headers: {
            'content-type': 'application/json'
          },
          data: {
            foo: 'bar'
          },
          params: {
            hoge: 'fuga'
          },
          withCredentials: false
        }
        expect(mergeOptions(defaultOptions, {})).toEqual(defaultOptions)
      })

      test('if only customOptions is specified, return customOptions', () => {
        const customOptions: SasaxiosRequest = {
          method: 'patch',
          baseURL: 'http://localhost:4500',
          headers: {
            'content-type': 'text/plain'
          },
          data: {
            baz: 'qux'
          },
          params: {
            piyo: 'upa'
          },
          withCredentials: true
        }
        expect(mergeOptions({}, customOptions)).toEqual(customOptions)
      })

      test('if both options are specified, return options merged in favor of customOptions', () => {
        const defaultOptions: SasaxiosRequest = {
          baseURL: 'http://localhost:3000',
          withCredentials: false
        }
        const customOptions: SasaxiosRequest = {
          method: 'post',
          data: {
            foo: 'bar'
          },
          headers: {
            'content-type': 'application/json'
          }
        }
        expect(mergeOptions(defaultOptions, customOptions)).toEqual({
          method: 'post',
          baseURL: 'http://localhost:3000',
          headers: {
            'content-type': 'application/json'
          },
          params: undefined,
          data: {
            foo: 'bar'
          },
          withCredentials: false
        })
      })

      describe('setContentTypeHeader', () => {
        test('if content-type header is already specified, do nothing', () => {
          const options: SasaxiosRequest = {
            headers: {
              'content-type': 'text/html'
            }
          }
          setContentTypeHeader(options)
          expect(options.headers).toEqual({
            'content-type': 'text/html'
          })
        })

        test('if content-type header is empty and data is JSON, set application/json', () => {
          const options: SasaxiosRequest = {
            data: {
              foo: 'bar'
            }
          }
          setContentTypeHeader(options)
          expect(options.headers).toEqual({
            'content-type': 'application/json'
          })
        })

        test('if content-type header is empty and data is String, set text/plain', () => {
          const options: SasaxiosRequest = {
            data: 'foo'
          }
          setContentTypeHeader(options)
          expect(options.headers).toEqual({
            'content-type': 'text/plain'
          })
        })
      })

      describe('makeNativeRequestConfig', () => {
        test('if method is not specified, set GET', () => {
          const options: SasaxiosRequest = {}
          expect(makeNativeRequestConfig(options).method).toEqual('GET')
        })

        test('if data is JSON, set body as JSON string', () => {
          const options: SasaxiosRequest = {
            data: {
              foo: 'bar'
            }
          }
          expect(makeNativeRequestConfig(options).body).toEqual('{"foo":"bar"}')
        })

        test('if withCredentials is true, set credentials as include', () => {
          const options: SasaxiosRequest = {
            withCredentials: true
          }
          expect(makeNativeRequestConfig(options).credentials).toEqual('include')
        })

        test('if withCredentials is false, set credentials as same-origin', () => {
          const options: SasaxiosRequest = {
            withCredentials: false
          }
          expect(makeNativeRequestConfig(options).credentials).toEqual('same-origin')
        })
      })

      describe('makeRequestBody', () => {
        test('if data is undefined, return undefined', () => {
          expect(makeRequestBody(undefined)).toBe(undefined)
        })

        test('if data is null, return undefined', () => {
          expect(makeRequestBody(null)).toBe(undefined)
        })

        test('if data is string, return string', () => {
          expect(makeRequestBody('foo')).toBe('foo')
        })

        test('if data is object, return JSON string', () => {
          expect(makeRequestBody({ foo: 'bar' })).toBe('{"foo":"bar"}')
        })
      })
    })
  })
})
