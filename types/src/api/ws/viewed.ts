import { WebSocketBase } from './base'

/**
 * 既読アイテム種別
 */
export type ViewedItemType = 'illust' | 'novel'

/**
 * 既読アイテム
 */
export interface ViewedItem {
  /**
   * アイテム種別
   */
  type: ViewedItemType

  /**
   * 対象のアイテム ID
   */
  id: number

  /**
   * 追加日時 (ISO 8601)
   */
  addedAt: string
}

/** 既読取得リクエストモデル */
export interface GetViewedRequest extends WebSocketBase {
  type: 'getViewed'
}

/** 既読取得レスポンスモデル */
export interface GetViewedResponse extends WebSocketBase {
  type: 'getViewed'
  data: {
    /**
     * 既読アイテムリスト
     */
    items: ViewedItem[]
  }
}

/** 既読追加リクエストモデル */
export interface AddViewedRequest extends WebSocketBase {
  type: 'addViewed'
  data: {
    /**
     * 既読アイテム
     */
    item: ViewedItem
  }
}

/** 既読追加レスポンスモデル */
export interface AddViewedResponse extends WebSocketBase {
  type: 'addViewed'
}

/** アイテムミュート追加シェアレスポンスモデル */
export interface ShareAddViewedResponse extends WebSocketBase {
  type: 'shareAddViewed'
  data: {
    /**
     * 既読アイテム
     */
    item: ViewedItem
  }
}
