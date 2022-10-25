import { Context } from '@nuxt/types'
import { BaseRequest, BaseResponse, IWebSocket } from '../websocket'

type ViewedItemType = 'illust' | 'novel'

export interface ViewedItem {
  type: ViewedItemType
  id: number
}

/** 既読取得リクエストモデル */
export interface GetViewedRequest extends BaseRequest {
  type: 'getViewed'
  item_type: ViewedItemType
}

/** 既読取得レスポンスモデル */
export interface GetViewedResponse extends BaseResponse {
  type: 'getViewed'
  item_ids: number[]
}

/** 既読追加リクエストモデル */
export interface AddViewedRequest extends BaseRequest {
  type: 'addViewed'
  item: ViewedItem
}

/** 既読追加レスポンスモデル */
export interface AddViewedResponse extends BaseResponse {
  type: 'addViewed'
}

/** アイテムミュート追加シェアレスポンスモデル */
export interface ShareAddViewedResponse extends BaseResponse {
  type: 'shareAddViewed'
  item: ViewedItem
}

/**
 * my-pixiv WebSocket Viewed Sharing API
 */
export class ViewedAPI extends IWebSocket {
  /**
   * 既読のアイテムID一覧を取得する
   *
   * @returns 既読追加レスポンス
   */
  public get(): Promise<GetViewedResponse> {
    return this.request<GetViewedRequest, GetViewedResponse>('getViewed')
  }

  /**
   * アイテムを既読にする
   *
   * @param item 既読するアイテム
   * @returns 既読追加レスポンス
   */
  public add(item: ViewedItem): Promise<AddViewedResponse> {
    return this.request<AddViewedRequest, AddViewedResponse>('addViewed', {
      item,
    })
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
    if (!$accessor.settings) return
    switch (res.item.type) {
      case 'illust':
        $accessor.viewed.addIllust({
          itemId: res.item.id,
          isSync: false,
        })
        break
      case 'novel':
        $accessor.viewed.addNovel({
          itemId: res.item.id,
          isSync: false,
        })
        break
    }
  }
}
