import { WebSocketBase } from './base'

/** ツイート検索リクエストモデル */
export interface SearchTweetRequest extends WebSocketBase {
  type: 'searchTweet'
  data: {
    /**
     * 検索対象のイラスト ID
     */
    illust_id: number
  }
}

export interface SearchTweetResult {
  /**
   * ツイート情報
   */
  tweet: {
    /**
     * ツイート ID
     */
    id: string

    /**
     * ツイート本文
     */
    text: string

    /**
     * 画像 URL
     */
    media_url: string

    /**
     * 投稿者情報
     */
    user: {
      /**
       * ユーザー ID
       */
      id: string

      /**
       * ユーザー名
       */
      name: string

      /**
       * スクリーンネーム
       */
      screen_name: string

      /**
       * プロフィール画像 URL
       */
      profile_image_url: string
    }
  }

  /**
   * 類似度 (0 ~ 1)
   */
  similarity: number

  /**
   * 検索元情報
   */
  identity: 'search' | 'user_timeline'
}

/** ツイート検索レスポンスモデル */
export interface SearchTweetResponse extends WebSocketBase {
  type: 'searchTweet'
  data: {
    /**
     * 検索対象となったユーザーのスクリーンネーム
     */
    screen_names: string[]

    /**
     * ツイート検索結果
     */
    tweets: SearchTweetResult[]
  }
}

/** シャドウバン確認リクエストモデル */
export interface CheckShadowBanRequest extends WebSocketBase {
  type: 'checkShadowBan'
  data: {
    /**
     * 確認するスクリーンネーム
     */
    screen_name: string
  }
}

/**
 * シャドウバン確認結果
 */
export interface ShadowBanResult {
  /**
   * フォローしていない?
   */
  Unfollowed: boolean

  /**
   * ゴーストバン: 自身のリプライが第三者から見えなくなる
   */
  ghost_ban: boolean

  /**
   * ツイートしていない
   */
  no_tweet: boolean

  /**
   * アカウントがない
   */
  not_found: boolean

  /**
   * 鍵アカウント
   */
  protect: boolean

  /**
   * リプライデブースティング: 一部のツイートがゴーストBanされる。攻撃的なリプライとして処理される
   */
  reply_deboosting: boolean

  /**
   * サーチバン: 検索結果に表示されなくなる
   */
  search_ban: boolean

  /**
   * サーチサジェストバン: 検索サジェストに表示されなくなる
   */
  search_suggestion_ban: boolean

  /**
   * 凍結されたアカウント
   */
  suspend: boolean

  /**
   * ユーザー情報
   */
  user: {
    /**
     * フォロワー数
     */
    followers_count: number

    /**
     * フォロー数
     */
    friends_count: number

    /**
     * ユーザー ID
     */
    id: number

    /**
     * ユーザー名
     */
    name: string

    /**
     * プロフィール画像 URL
     */
    profile_image_url_https: string

    /**
     * スクリーンネーム
     */
    screen_name: string
  }
}

/** シャドウバン確認レスポンスモデル */
export interface CheckShadowBanResponse extends WebSocketBase {
  type: 'checkShadowBan'
  data: {
    /**
     * シャドウバン確認結果
     */
    result: ShadowBanResult
  }
}

/**
 * ツイッターアカウント種別
 */
export type TwitterAccountType = 'main' | 'sub'

/**
 * ツイートいいね状態
 */
export interface TweetLikeStatus {
  /**
   * ツイート ID
   */
  id: string

  /**
   * いいね済みかどうか
   */
  liked: boolean
}

/** ツイートいいね取得リクエストモデル */
export interface GetTweetsLikeRequest extends WebSocketBase {
  type: 'getTweetsLike'
  data: {
    /**
     * アカウント種別
     */
    account: TwitterAccountType

    /**
     * 確認するツイート ID
     */
    tweet_ids: string[]
  }
}

/** ツイートいいね追加レスポンスモデル */
export interface GetTweetsLikeResponse extends WebSocketBase {
  type: 'getTweetsLike'
  data: {
    /**
     * ツイートをいいねしているかどうかリスト
     */
    tweets: TweetLikeStatus[]
  }
}

/** ツイートいいね追加リクエストモデル */
export interface AddTweetLikeRequest extends WebSocketBase {
  type: 'addTweetLike'
  data: {
    /**
     * アカウント種別
     */
    account: TwitterAccountType

    /**
     * いいねするツイート ID
     */
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
    /**
     * アカウント種別
     */
    account: TwitterAccountType

    /**
     * いいね解除するツイート ID
     */
    tweet_id: string
  }
}

/** ツイートいいね解除レスポンスモデル */
export interface RemoveTweetLikeResponse extends WebSocketBase {
  type: 'removeTweetLike'
}
