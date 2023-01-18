import { rest, RestHandler } from 'msw'
import { setupServer } from 'msw/node'

const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const

export const handlers: RestHandler[] = [
  rest.get('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.text('GET /'))
  }),
  rest.post('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.text('POST /'))
  }),
  rest.put('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.text('PUT /'))
  }),
  rest.patch('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.text('PATCH /'))
  }),
  rest.delete('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.text('DELETE /'))
  }),
  rest.head('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.set('x-test', 'HEAD /'))
  }),
  rest.options('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.text('OPTIONS /'))
  })
]

export const server = setupServer(...handlers)
