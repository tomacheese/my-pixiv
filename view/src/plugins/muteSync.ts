import { Context } from '@nuxt/types'
import { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import { ConstantBackoff, Websocket, WebsocketBuilder } from 'websocket-ts'
import { MuteItem, MuteTargetType } from '@/store/itemMute'

interface GetAllMuteData {
  action: 'get-all-mutes'
  items: MuteItem[]
}

interface AddMuteData {
  action: 'add-mute'
  item: {
    type: MuteTargetType
    id: number
  }
}

interface RemoveMuteData {
  action: 'remove-mute'
  item: {
    type: MuteTargetType
    id: number
  }
}

type IWebSocket = GetAllMuteData | AddMuteData | RemoveMuteData

let client: Websocket | null = null
let $accessor: Context['$accessor'] | null = null
let $config: NuxtRuntimeConfig | null = null

function actionGetAllMutes(data: GetAllMuteData) {
  console.log('actionGetAllMutes', data)
  $accessor?.itemMute.setAllMutes(data)
}

function actionAddMute(data: AddMuteData) {
  console.log('actionAddMute', data)
  $accessor?.itemMute.addMute({
    type: data.item.type,
    id: data.item.id,
  })
}

function actionRemoveMute(data: RemoveMuteData) {
  console.log('actionRemoveMute', data)
  $accessor?.itemMute.removeMute({
    type: data.item.type,
    id: data.item.id,
  })
}

function onMessage(_: Websocket, message: MessageEvent<string>) {
  const data: IWebSocket = JSON.parse(message.data)
  if (data.action === undefined) {
    return // actionがない場合は無視
  }

  switch (data.action) {
    case 'get-all-mutes':
      actionGetAllMutes(data)
      break
    case 'add-mute':
      actionAddMute(data)
      break
    case 'remove-mute':
      actionRemoveMute(data)
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
  console.log('WebSocket[MuteSync]: connected')

  // 接続時はすべてのデータを更新
  ws.send(
    JSON.stringify({
      action: 'get-all-mutes',
    })
  )
}

function onClose(_: Websocket, event: CloseEvent) {
  console.log('WebSocket[MuteSync]: closed', event)

  if ($accessor && $config && $accessor.settings.autoSyncVieweds) {
    client = createClient($config)
  }
}

function onError(_: Websocket, event: Event) {
  console.error(event)
}

function onRetry() {
  console.log('WebSocket[MuteSync]: retry')
}

export function getClient() {
  return client
}

function createClient($config: NuxtRuntimeConfig) {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const domain =
    $config.baseURL === '/'
      ? `${location.host}/`
      : $config.baseURL.replace(/https?:\/\//, '')
  return new WebsocketBuilder(`${protocol}://${domain}api/itemMutes`)
    .onOpen(onOpen)
    .onClose(onClose)
    .onMessage(onMessage)
    .onError(onError)
    .onRetry(onRetry)
    .withBackoff(new ConstantBackoff(1000))
    .build()
}

export default (context: Context) => {
  if (!context.$accessor.settings.autoSyncMutes) {
    return
  }
  $accessor = context.$accessor
  $config = context.$config
  client = createClient($config)
}
