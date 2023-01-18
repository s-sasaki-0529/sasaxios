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
  describe('instance methods', () => {
    describe('#get', () => {
      test('basic request', async () => {
        const res = await saxios.request('http://127.0.0.1/')
        const text = await res.text()
        expect(text).toEqual('GET /')
      })
    })

    describe('#post', () => {
      test('basic request', async () => {
        const res = await saxios.post('http://127.0.0.1/')
        const text = await res.text()
        expect(text).toEqual('POST /')
      })
    })

    describe('#put', () => {
      test('basic request', async () => {
        const res = await saxios.put('http://127.0.0.1/')
        const text = await res.text()
        expect(text).toEqual('PUT /')
      })
    })

    describe('#patch', () => {
      test('basic request', async () => {
        const res = await saxios.patch('http://127.0.0.1/')
        const text = await res.text()
        expect(text).toEqual('PATCH /')
      })
    })

    describe('#delete', () => {
      test('basic request', async () => {
        const res = await saxios.delete('http://127.0.0.1/')
        const text = await res.text()
        expect(text).toEqual('DELETE /')
      })
    })

    describe('#head', () => {
      test('basic request', async () => {
        const res = await saxios.head('http://127.0.0.1/')
        const header = res.headers.get('x-test')
        expect(header).toEqual('HEAD /')
      })
    })

    describe('#options', () => {
      test('basic request', async () => {
        const res = await saxios.options('http://127.0.0.1/')
        const text = await res.text()
        expect(text).toEqual('OPTIONS /')
      })
    })
  })
})
