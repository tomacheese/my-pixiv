import { Context } from '@nuxt/types'
import { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import { ConstantBackoff, Websocket, WebsocketBuilder } from 'websocket-ts'
import { Settings } from '@/store/settings'

/** サーバサイドの設定情報を取得するGetリクエスト */
interface GetActionRequest {
  action: 'get'
}

/** サーバサイドの設定情報を取得するGetレスポンス */
interface GetActionResponse {
  action: 'get'
  value: Partial<Settings>
}

/** サーバサイドの設定情報を置換するPutリクエスト */
interface PutActionRequest {
  action: 'put'
  value: Partial<Settings>
}

/** サーバサイドの設定情報を置換するPutレスポンス */
interface PutActionResponse {
  action: 'put'
  value: Partial<Settings>
}

/** サーバサイドの設定情報を一部更新するPatchリクエスト */
interface PatchActionRequest {
  action: 'patch'
  key: keyof Settings
  value: Settings[keyof Settings]
}

/** サーバサイドの設定情報を一部更新するPatchレスポンス */
interface PatchActionResponse {
  action: 'patch'
  key: keyof Settings
  value: Settings[keyof Settings]
}

type IWebSocketRequest =
  | GetActionRequest
  | PutActionRequest
  | PatchActionRequest
type IWebSocketResponse =
  | GetActionResponse
  | PutActionResponse
  | PatchActionResponse

let client: Websocket | null = null
let $accessor: Context['$accessor'] | null = null
let $config: NuxtRuntimeConfig | null = null

function onGetMessage(_: Websocket, data: GetActionResponse) {
  console.log('WebSocket: get', data.value)
  if (!$accessor) {
    return
  }
  if (data.value === null) {
    if (
      confirm(
        'サーバー側の設定が見つかりませんでした。このクライアントの設定をサーバに送信しますか？'
      )
    ) {
      updateAllSettings($accessor.settings.settings)
      return
    }
  }
  $accessor.settings.setAllSettings(data.value)
}

function onPutMessage(ws: Websocket, data: PutActionResponse) {
  console.log('WebSocket: put', data.value)
  onGetMessage(ws, {
    action: 'get',
    value: data.value,
  })
}

function onPatchMessage(_: Websocket, data: PatchActionResponse) {
  console.log('WebSocket: patch', data.key, data.value)
  if (!$accessor) {
    return
  }
  $accessor.settings.setAllSettings({
    [data.key]: data.value,
  })
}

function onMessage(ws: Websocket, message: MessageEvent<string>) {
  const data: IWebSocketResponse = JSON.parse(message.data)
  if (data.action === undefined) {
    return // actionがない場合は無視
  }

  switch (data.action) {
    case 'get':
      onGetMessage(ws, data)
      break
    case 'put':
      onPutMessage(ws, data)
      break
    case 'patch':
      onPatchMessage(ws, data)
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

function onOpen(_: Websocket) {
  console.log('WebSocket: connected')
}

function onClose(_: Websocket, event: CloseEvent) {
  console.log('WebSocket: closed', event)

  if ($accessor && $config && $accessor.settings.isGlobalSync) {
    client = createClient($config)
  }
}

function onError(_: Websocket, event: Event) {
  console.error(event)
}

function onRetry() {
  console.log('WebSocket: retry')
}

export function getClient() {
  return client
}

export function send(data: IWebSocketRequest) {
  if (!client) {
    return
  }
  client.send(JSON.stringify(data))
}

export function getAllSettings() {
  console.log('WebSocket: getAllSettings')
  if (!client) {
    return
  }
  send({
    action: 'get',
  })
}

export function updateAllSettings(settings: Settings) {
  console.log('WebSocket: updateAllSettings')
  if (!client) {
    return
  }
  // eslint-disable-next-line no-empty-pattern
  const { isGlobalSync: {} = {}, ...sendSettings } = settings
  send({
    action: 'put',
    value: sendSettings,
  })
}

export function updateSetting(
  key: keyof Settings,
  value: Settings[keyof Settings]
) {
  console.log('WebSocket: updateSetting')
  if (!client) {
    return
  }
  send({
    action: 'patch',
    key,
    value,
  })
}

function createClient($config: NuxtRuntimeConfig, isGet = false) {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const domain =
    $config.baseURL === '/'
      ? `${location.host}/`
      : $config.baseURL.replace(/https?:\/\//, '')
  const builder = new WebsocketBuilder(`${protocol}://${domain}api/sync`)
    .onOpen(onOpen)
    .onClose(onClose)
    .onMessage(onMessage)
    .onError(onError)
    .onRetry(onRetry)
    .withBackoff(new ConstantBackoff(1000))
  if (isGet) {
    builder.onOpen(() => {
      getAllSettings()
    })
  }

  return builder.build()
}

export default (context: Context) => {
  if (!context.$accessor.settings.isGlobalSync) {
    return
  }
  $accessor = context.$accessor
  $config = context.$config
  client = createClient($config, true)

  for (const key of Object.keys(context.$accessor.settings.settings)) {
    context.store.watch(
      (state) => state.settings[key],
      (newValue, oldValue) => {
        if (!client) {
          return
        }
        if (newValue === oldValue) {
          return
        }
        console.log('watch', key, newValue, oldValue)
        updateSetting(key as keyof Settings, newValue)
      }
    )
  }
}
