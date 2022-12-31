import {
  SearchTweetResponse,
  SearchTweetRequest,
  CheckShadowBanResponse,
  CheckShadowBanRequest,
  TwitterAccountType,
  GetTweetsLikeResponse,
  GetTweetsLikeRequest,
  AddTweetLikeResponse,
  AddTweetLikeRequest,
  RemoveTweetLikeResponse,
  RemoveTweetLikeRequest,
} from 'my-pixiv-types'
import { WSUtils } from '../websocket'

/**
 * my-pixiv WebSocket Twitter API
 */
export class TwitterAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * イラストをもとにツイートを検索する
   *
   * @param illustId 検索するイラストID
   * @param callbackFunc 検索結果を受け取るコールバック関数
   * @param errorFunc 検索結果
   * @returns 検索結果
   */
  public searchByIllust(
    illustId: number,
    callbackFunction: (response: SearchTweetResponse) => void,
    errorFunction: (error: Error) => void
  ): void {
    this.utils.requestMultiResponse<SearchTweetRequest, SearchTweetResponse>(
      'searchTweet',
      {
        illust_id: illustId,
      },
      callbackFunction,
      errorFunction
    )
  }

  /**
   * シャドウバンを確認する
   *
   * @param screenName 確認するユーザーのスクリーンネーム
   * @returns シャドウバンの確認結果
   */
  public checkShadowBan(screenName: string): Promise<CheckShadowBanResponse> {
    return this.utils.request<CheckShadowBanRequest, CheckShadowBanResponse>(
      'checkShadowBan',
      {
        screen_name: screenName,
      }
    )
  }

  public getTweetsLike(
    account: TwitterAccountType,
    tweetIds: string[]
  ): Promise<GetTweetsLikeResponse> {
    return this.utils.request<GetTweetsLikeRequest, GetTweetsLikeResponse>(
      'getTweetsLike',
      {
        account,
        tweet_ids: tweetIds,
      }
    )
  }

  public addLike(
    account: TwitterAccountType,
    tweetId: string
  ): Promise<AddTweetLikeResponse> {
    return this.utils.request<AddTweetLikeRequest, AddTweetLikeResponse>(
      'addTweetLike',
      {
        account,
        tweet_id: tweetId,
      }
    )
  }

  public removeLike(
    account: TwitterAccountType,
    tweetId: string
  ): Promise<RemoveTweetLikeResponse> {
    return this.utils.request<RemoveTweetLikeRequest, RemoveTweetLikeResponse>(
      'removeTweetLike',
      {
        account,
        tweet_id: tweetId,
      }
    )
  }
}
