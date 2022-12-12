import { WebSocketBase } from './base'

export type ViewedItemType = 'illust' | 'novel'

export interface ViewedItem {
  type: ViewedItemType
  id: number
  addedAt: string
}

/** 既読取得リクエストモデル */
export interface GetViewedRequest extends WebSocketBase {
  type: 'getViewed'
  data: {
    item_type: ViewedItemType
  }
}

/** 既読取得レスポンスモデル */
export interface GetViewedResponse extends WebSocketBase {
  type: 'getViewed'
  data: {
    item_ids: number[]
  }
}

/** 既読追加リクエストモデル */
export interface AddViewedRequest extends WebSocketBase {
  type: 'addViewed'
  data: {
    item: Omit<ViewedItem, 'addedAt'>
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
    item: ViewedItem
  }
}
