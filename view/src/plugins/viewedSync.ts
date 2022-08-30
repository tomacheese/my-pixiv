import { Context } from '@nuxt/types'
import { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import { Websocket, WebsocketBuilder } from 'websocket-ts'

interface GetAllViewedData {
  action: 'get-all-viewed'
  type: 'illust' | 'novel'
  itemIds: number[]
}

interface AddViewedData {
  action: 'add-viewed'
  type: 'illust' | 'novel'
  itemId: number
}

type IWebSocket = GetAllViewedData | AddViewedData

let client: Websocket | null = null
let $accessor: Context['$accessor'] | null = null

function actionGetAllViewed(data: GetAllViewedData) {
  console.log('actionGetAllViewed', data)
  switch (data.type) {
    case 'illust':
      $accessor?.viewed.setAllVieweds({
        illusts: data.itemIds,
        novels: undefined,
      })
      break
    case 'novel':
      $accessor?.viewed.setAllVieweds({
        illusts: undefined,
        novels: data.itemIds,
      })
      break
  }
}

function actionAddViewed(data: AddViewedData) {
  console.log('actionAddViewed', data)
  switch (data.type) {
    case 'illust':
      $accessor?.viewed.addIllustId(data.itemId)
      break
    case 'novel':
      $accessor?.viewed.addNovelId(data.itemId)
      break
  }
}

function onMessage(_: Websocket, message: MessageEvent<string>) {
  const data: IWebSocket = JSON.parse(message.data)
  if (data.action === undefined) {
    return // actionがない場合は無視
  }

  switch (data.action) {
    case 'get-all-viewed':
      actionGetAllViewed(data)
      break
    case 'add-viewed':
      actionAddViewed(data)
      break
    default:
      console.warn(
        `WebSocket: unknown action: ${
          (
            data as {
              action: string
            }
          ).action
        }`
      )
      break
  }
}

function onOpen(ws: Websocket) {
  console.log('WebSocket: connected')

  // 接続時はすべてのデータを更新
  ws.send(
    JSON.stringify({
      action: 'get-all-viewed',
      type: 'illust',
    })
  )
  ws.send(
    JSON.stringify({
      action: 'get-all-viewed',
      type: 'novel',
    })
  )
}

function onClose(_: Websocket, event: CloseEvent) {
  console.log('WebSocket: closed', event)
}

function onError(_: Websocket, event: Event) {
  console.error(event)
}

export function getClient() {
  return client
}

function createClient($config: NuxtRuntimeConfig) {
  return new WebsocketBuilder(
    `ws://${$config.baseURL.replace(/https?:\/\//, '')}api/viewed`
  )
    .onOpen(onOpen)
    .onClose(onClose)
    .onMessage(onMessage)
    .onError(onError)
    .build()
}

export default (context: Context) => {
  if (!context.$accessor.settings.autoSyncVieweds) {
    return
  }
  $accessor = context.$accessor
  client = createClient(context.$config)
}
