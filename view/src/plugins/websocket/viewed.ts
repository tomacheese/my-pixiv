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
   * @param res アイテムミュート追加シェアレスポンス
   */
  public onAddViewed(
    $accessor: Context['$accessor'],
    res: ShareAddViewedResponse
  ): void {
    if (!$accessor.settings.isAutoSyncVieweds) return
    switch (res.data.item.type) {
      case 'illust':
        $accessor.viewed.addIllust({
          itemId: res.data.item.id,
          isSync: false,
        })
        break
      case 'novel':
        $accessor.viewed.addNovel({
          itemId: res.data.item.id,
          isSync: false,
        })
        break
    }
  }
}
