import { Context } from '@nuxt/types'
import {
  GetItemMuteResponse,
  GetItemMuteRequest,
  ItemMute,
  AddItemMuteResponse,
  AddItemMuteRequest,
  RemoveItemMuteResponse,
  RemoveItemMuteRequest,
  ShareAddItemMuteResponse,
  ShareRemoveItemMuteResponse,
} from 'my-pixiv-types'
import { WSUtils } from '../websocket'

/**
 * my-pixiv WebSocket Item-Mute Sharing API
 */
export class ItemMuteAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * ミュートしているアイテムを取得する
   *
   * @returns アイテムミュート取得レスポンス
   */
  public get(): Promise<GetItemMuteResponse> {
    return this.utils.request<GetItemMuteRequest, GetItemMuteResponse>(
      'getItemMute',
      {}
    )
  }

  /**
   * アイテムをミュートする
   *
   * @param item ミュートするアイテム
   * @returns アイテムミュート追加レスポンス
   */
  public add(item: ItemMute): Promise<AddItemMuteResponse> {
    return this.utils.request<AddItemMuteRequest, AddItemMuteResponse>(
      'addItemMute',
      item
    )
  }

  /**
   * アイテムのミュートを解除する
   *
   * @param item ミュートを解除するアイテム
   * @returns アイテムミュート削除レスポンス
   */
  public remove(item: ItemMute): Promise<RemoveItemMuteResponse> {
    return this.utils.request<RemoveItemMuteRequest, RemoveItemMuteResponse>(
      'removeItemMute',
      item
    )
  }

  /**
   * アイテムミュート追加シェアイベント(shareAddItemMute)を受信したときの処理
   *
   * @param $accessor Vuexアクセサー
   * @param response アイテムミュート追加シェアレスポンス
   */
  public onAddItemMute(
    $accessor: Context['$accessor'],
    response: ShareAddItemMuteResponse
  ): void {
    if (!$accessor.settings.isAutoSyncMutes) return
    $accessor.itemMute.addMute({
      item: response.data,
      isSync: false,
    })
  }

  /**
   * アイテムミュート削除シェアイベント(shareRemoveItemMute)を受信したときの処理
   *
   * @param $accessor Vuexアクセサー
   * @param response アイテムミュート削除シェアレスポンス
   */
  public onRemoveItemMute(
    $accessor: Context['$accessor'],
    response: ShareRemoveItemMuteResponse
  ): void {
    if (!$accessor.settings.isAutoSyncMutes) return
    $accessor.itemMute.removeMute({
      item: response.data,
      isSync: false,
    })
  }
}
