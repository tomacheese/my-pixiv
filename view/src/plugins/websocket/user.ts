import { BaseRequest, BaseResponse, WSUtils } from '../websocket'
import { PixivItem } from '@/types/pixivItem'

/** ユーザー取得リクエストモデル */
export interface GetUserRequest extends BaseRequest {
  type: 'getUser'
  user_id: number
}

/** ユーザー取得レスポンスモデル */
export interface GetUserResponse extends BaseResponse {
  type: 'getUser'
  item: PixivItem
}

/**
 * my-pixiv WebSocket User API
 */
export class UserAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * ユーザーを取得する
   *
   * @param userId ユーザーID
   * @returns ユーザー取得レスポンス
   */
  public get(userId: number): Promise<GetUserResponse> {
    return this.utils.request<GetUserRequest, GetUserResponse>('getUser', {
      user_id: userId,
    })
  }
}
