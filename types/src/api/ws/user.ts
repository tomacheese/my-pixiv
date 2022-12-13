import { PixivUserItem } from '../../pixiv/pixivUser'
import { WebSocketBase } from './base'

/** ユーザー取得リクエストモデル */
export interface GetUserRequest extends WebSocketBase {
  type: 'getUser'
  data: {
    /**
     * ユーザー ID
     */
    user_id: number
  }
}

/** ユーザー取得レスポンスモデル */
export interface GetUserResponse extends WebSocketBase {
  type: 'getUser'

  /**
   * pixiv ユーザーアイテム
   */
  data: PixivUserItem
}
