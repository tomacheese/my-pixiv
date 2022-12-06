import { BaseRequest, BaseResponse, WSUtils } from '../websocket'
import { Tweet } from '@/components/TweetPopup.vue'

/** ツイート検索リクエストモデル */
export interface SearchTweetRequest extends BaseRequest {
  type: 'searchTweet'
  illust_id: number
}

/** ツイート検索レスポンスモデル */
export interface SearchTweetResponse extends BaseResponse {
  type: 'searchTweet'
  screen_names: string[]
  tweets: Tweet[]
}

/** シャドウバン確認リクエストモデル */
export interface CheckShadowBanRequest extends BaseRequest {
  type: 'checkShadowBan'
  screen_name: string
}

export interface ShadowBanResult {
  Unfollowed: boolean
  ghost_ban: boolean
  no_tweet: boolean
  not_found: boolean
  protect: boolean
  reply_deboosting: boolean
  search_ban: boolean
  search_suggestion_ban: boolean
  suspend: boolean
  user: {
    followers_count: number
    friends_count: number
    id: number
    name: string
    profile_image_url_https: string
    screen_name: string
  }
}

/** シャドウバン確認レスポンスモデル */
export interface CheckShadowBanResponse extends BaseResponse {
  type: 'checkShadowBan'
  result: ShadowBanResult
}

export type TwitterAccountType = 'main' | 'sub'

export interface TweetLikeStatus {
  id: string
  liked: boolean
}

/** ツイートいいね取得リクエストモデル */
export interface GetTweetsLikeRequest extends BaseRequest {
  type: 'getTweetsLike'
  account: TwitterAccountType
  tweet_ids: string[]
}

/** ツイートいいね追加レスポンスモデル */
export interface GetTweetsLikeResponse extends BaseResponse {
  type: 'getTweetsLike'
  tweets: TweetLikeStatus[]
}

/** ツイートいいね追加リクエストモデル */
export interface AddTweetLikeRequest extends BaseRequest {
  type: 'addTweetLike'
  account: TwitterAccountType
  tweet_id: string
}

/** ツイートいいね追加レスポンスモデル */
export interface AddTweetLikeResponse extends BaseResponse {
  type: 'addTweetLike'
}

/** ツイートいいね解除リクエストモデル */
export interface RemoveTweetLikeRequest extends BaseRequest {
  type: 'removeTweetLike'
  account: TwitterAccountType
  tweet_id: string
}

/** ツイートいいね解除レスポンスモデル */
export interface RemoveTweetLikeResponse extends BaseResponse {
  type: 'removeTweetLike'
}

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
   * @returns 検索結果
   */
  public searchByIllust(illustId: number): Promise<SearchTweetResponse> {
    return this.utils.request<SearchTweetRequest, SearchTweetResponse>(
      'searchTweet',
      {
        illust_id: illustId,
      }
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
