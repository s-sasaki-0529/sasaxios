import { rest, RestHandler } from 'msw'
import { setupServer } from 'msw/node'

export const MOCK_SERVER_BASE_URL = 'http://127.0.0.1'

export const handlers: RestHandler[] = [
  rest.get(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
    return res(ctx.text('GET /'))
  }),
  rest.post(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
    return res(ctx.text('POST /'))
  }),
  rest.put(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
    return res(ctx.text('PUT /'))
  }),
  rest.patch(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
    return res(ctx.text('PATCH /'))
  }),
  rest.delete(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
    return res(ctx.text('DELETE /'))
  }),
  rest.head(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
    return res(ctx.set('x-test', 'HEAD /'))
  }),
  rest.options(`${MOCK_SERVER_BASE_URL}/`, (req, res, ctx) => {
    return res(ctx.text('OPTIONS /'))
  })
]

export const server = setupServer(...handlers)
