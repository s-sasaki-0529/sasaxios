import { rest, RestHandler } from 'msw'
import { setupServer } from 'msw/node'

export const handlers: RestHandler[] = [
  rest.get('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.body('GET /'))
  }),
  rest.post('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.body('POST /'))
  }),
  rest.put('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.body('PUT /'))
  }),
  rest.patch('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.body('PATCH /'))
  }),
  rest.delete('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.body('DELETE /'))
  }),
  rest.head('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.set('x-test', 'HEAD /'))
  }),
  rest.options('http://127.0.0.1/', (req, res, ctx) => {
    return res(ctx.body('OPTIONS /'))
  })
]

export const server = setupServer(...handlers)
