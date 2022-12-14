import { BaseRouter } from '@/base-router'
import { websocketClients } from '@/utils/utils'
import { SocketStream } from '@fastify/websocket'
import { FastifyRequest } from 'fastify'
import WebSocket from 'ws'

const syncClients: { [key: string]: WebSocket } = {}

interface SyncMessage {
  action: 'sync'
  data: any
}

const isSyncMessage = (data: any): data is SyncMessage => {
  return (data as SyncMessage).action === 'sync'
}

/**
 * 設定同期 WebSocket API
 */
export class SettingsSyncWebSocketRouter extends BaseRouter {
  private wsKey: string | undefined

  init(): void {
    this.fastify.register((fastify, _, done) => {
      fastify.get(
        '/api/settings-sync',
        { websocket: true },
        (connection, req) => {
          this.onOpen(connection, req)
          connection.socket.on('message', (message) =>
            this.onMessage(connection.socket, message)
          )
          connection.socket.addEventListener('close', this.onClose.bind(this))
        }
      )
      done()
    })
  }

  onOpen(connection: SocketStream, req: FastifyRequest) {
    // 認証
    const configPassword = this.config.get('password')
    const inputPassword = req.headers['sec-websocket-protocol']

    if (configPassword) {
      if (inputPassword === undefined) {
        connection.socket.close(1002, 'Protocol required')
        return
      }
      if (inputPassword !== configPassword) {
        connection.socket.close(1002, 'Invalid password')
        return
      }
    }

    const key = req.headers['sec-websocket-key']
    if (key === undefined) {
      connection.socket.close(1002, 'Key required')
      return
    }

    this.wsKey = key
    console.log('Setting-Sync:Connected:', this.wsKey)

    syncClients[this.wsKey] = connection.socket
  }

  onMessage(ws: WebSocket, data: WebSocket.RawData) {
    try {
      const json = JSON.parse(data.toString())
      if (!isSyncMessage(json)) {
        ws.send(JSON.stringify({ action: 'error', message: 'Invalid message' }))
        return
      }

      let sendCount = 0
      for (const client of Object.values(syncClients)) {
        if (client.readyState !== WebSocket.OPEN) {
          continue
        }
        if (client === ws) {
          continue
        }
        client.send(JSON.stringify(json))
        sendCount++
      }

      ws.send(JSON.stringify({ action: 'synced', data: sendCount }))
    } catch (e) {
      console.error(e)
      ws.close(1002, (e as Error).message)
    }
  }

  onClose(event: WebSocket.CloseEvent) {
    console.log('Setting-Sync:onClose', this.wsKey, event.code, event.reason)

    if (this.wsKey) {
      delete websocketClients[this.wsKey]
    }
  }
}
