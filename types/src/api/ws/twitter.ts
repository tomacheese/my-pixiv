import { Tweet } from '../../twitter'
import { WebSocketBase } from './base'

/** ツイート検索リクエストモデル */
export interface SearchTweetRequest extends WebSocketBase {
  type: 'searchTweet'
  data: {
    illust_id: number
  }
}

/** ツイート検索レスポンスモデル */
export interface SearchTweetResponse extends WebSocketBase {
  type: 'searchTweet'
  data: {
    screen_names: string[]
    tweets: Tweet[]
  }
}

/** シャドウバン確認リクエストモデル */
export interface CheckShadowBanRequest extends WebSocketBase {
  type: 'checkShadowBan'
  data: {
    screen_name: string
  }
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
export interface CheckShadowBanResponse extends WebSocketBase {
  type: 'checkShadowBan'
  data: {
    result: ShadowBanResult
  }
}

export type TwitterAccountType = 'main' | 'sub'

export interface TweetLikeStatus {
  id: string
  liked: boolean
}

/** ツイートいいね取得リクエストモデル */
export interface GetTweetsLikeRequest extends WebSocketBase {
  type: 'getTweetsLike'
  data: {
    account: TwitterAccountType
    tweet_ids: string[]
  }
}

/** ツイートいいね追加レスポンスモデル */
export interface GetTweetsLikeResponse extends WebSocketBase {
  type: 'getTweetsLike'
  data: {
    tweets: TweetLikeStatus[]
  }
}

/** ツイートいいね追加リクエストモデル */
export interface AddTweetLikeRequest extends WebSocketBase {
  type: 'addTweetLike'
  data: {
    account: TwitterAccountType
    tweet_id: string
  }
}

/** ツイートいいね追加レスポンスモデル */
export interface AddTweetLikeResponse extends WebSocketBase {
  type: 'addTweetLike'
}

/** ツイートいいね解除リクエストモデル */
export interface RemoveTweetLikeRequest extends WebSocketBase {
  type: 'removeTweetLike'
  data: {
    account: TwitterAccountType
    tweet_id: string
  }
}

/** ツイートいいね解除レスポンスモデル */
export interface RemoveTweetLikeResponse extends WebSocketBase {
  type: 'removeTweetLike'
}
