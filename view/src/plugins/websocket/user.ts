import { GetUserResponse, GetUserRequest } from 'my-pixiv-types'
import { WSUtils } from '../websocket'

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
