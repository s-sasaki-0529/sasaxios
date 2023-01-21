import { describe, expect, test } from 'vitest'
import { makeFullUrl } from '../../src/url'

describe('unit', () => {
  describe('url.ts', () => {
    describe('makeFullUrl', () => {
      test('return merged url', () => {
        expect(makeFullUrl('/users')).toEqual('/users')
        expect(makeFullUrl('/users', { baseURL: 'http://localhost:3000' })).toEqual('http://localhost:3000/users')
        expect(makeFullUrl('/users', { baseURL: 'http://localhost:3000', params: { foo: 'bar' } })).toEqual(
          'http://localhost:3000/users?foo=bar'
        )
        expect(makeFullUrl('/users?hoge=fuga', { baseURL: 'http://localhost:3000', params: { foo: 'bar' } })).toEqual(
          'http://localhost:3000/users?hoge=fuga&foo=bar'
        )
      })
    })
  })
})
