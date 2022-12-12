import { buildApp } from './server'

const app = buildApp()

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000
app.listen({ port }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
