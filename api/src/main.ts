import { migrateViewed } from './migration'
import { buildApp } from './server'
import { organizeWebsocketClients } from './utils/utils'

const app = buildApp()

migrateViewed()

// 5分ごとにWebSocketクライアントを整理する
setInterval(() => {
  organizeWebsocketClients()
}, 1000 * 60 * 5)

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000
app.listen({ host, port }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
