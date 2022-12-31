import { Context } from '@nuxt/types'
import {
  GetViewedResponse,
  GetViewedRequest,
  ViewedItem,
  AddViewedResponse,
  AddViewedRequest,
  ShareAddViewedResponse,
} from 'my-pixiv-types'
import { WSUtils } from '../websocket'

/**
 * my-pixiv WebSocket Viewed Sharing API
 */
export class ViewedAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * 既読のアイテムID一覧を取得する
   *
   * @returns 既読追加レスポンス
   */
  public get(): Promise<GetViewedResponse> {
    return this.utils.request<GetViewedRequest, GetViewedResponse>(
      'getViewed',
      {}
    )
  }

  /**
   * アイテムを既読にする
   *
   * @param item 既読するアイテム
   * @returns 既読追加レスポンス
   */
  public add(item: ViewedItem): Promise<AddViewedResponse> {
    return this.utils.request<AddViewedRequest, AddViewedResponse>(
      'addViewed',
      {
        item,
      }
    )
  }

  /**
   * 既読追加シェアイベント(shareAddViewed)を受信したときの処理
   *
   * @param $accessor Vuexアクセサー
   * @param response アイテムミュート追加シェアレスポンス
   */
  public onAddViewed(
    $accessor: Context['$accessor'],
    response: ShareAddViewedResponse
  ): void {
    if (!$accessor.settings.isAutoSyncVieweds) return
    switch (response.data.item.type) {
      case 'illust': {
        $accessor.viewed.addIllust({
          itemId: response.data.item.id,
          isSync: false,
        })
        break
      }
      case 'novel': {
        $accessor.viewed.addNovel({
          itemId: response.data.item.id,
          isSync: false,
        })
        break
      }
    }
  }
}
