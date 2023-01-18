import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

// basic routes
app.get('/', c => c.text('GET /'))
app.post('/', c => c.text('POST /'))
app.put('/', c => c.text('PUT /'))
app.patch('/', c => c.text('PATCH /'))
app.delete('/', c => c.text('DELETE /'))
app.options('/', c => c.text('OPTIONS /'))
app.head('/', c => {
  c.header('x-test', 'HEAD /')
  c.status(200)
  return c.body('')
})

serve(app)
