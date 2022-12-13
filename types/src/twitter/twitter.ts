interface Url {
  url: string
  expanded_url: string
  display_url: string
  indices: number[]
}
interface Size {
  w: number
  h: number
  resize: string
}

interface Sizes {
  thumb: Size
  medium: Size
  small: Size
  large: Size
}

interface Media {
  id: number
  id_str: string
  indices: number[]
  media_url: string
  media_url_https: string
  url: string
  display_url: string
  expanded_url: string
  type: string
  sizes: Sizes
  source_status_id?: number
  source_status_id_str?: string
  source_user_id?: number
  source_user_id_str?: string
}

interface EntitySymbol {
  text: string
  indices: number[]
}

interface UserMention {
  screen_name: string
  name: string
  id: number
  id_str: string
  indices: number[]
}

interface StatusEntities {
  hashtags: any[]
  symbols: EntitySymbol[]
  user_mentions: UserMention[]
  urls: Url[]
  media?: Media[]
}

interface Urls {
  urls: Url[]
}

interface UserEntities {
  url: Urls
  description: Urls
}

interface User {
  id: number
  id_str: string
  name: string
  screen_name: string
  location: string
  description: string
  url: string
  entities: UserEntities
  protected: boolean
  followers_count: number
  friends_count: number
  listed_count: number
  created_at: string
  favourites_count: number
  utc_offset?: any
  time_zone?: any
  geo_enabled?: any
  verified: boolean
  statuses_count: number
  lang: string
  contributors_enabled?: any
  is_translator?: any
  is_translation_enabled?: any
  profile_background_color: string
  profile_background_image_url: string
  profile_background_image_url_https: string
  profile_background_tile?: any
  profile_image_url: string
  profile_image_url_https: string
  profile_banner_url: string
  profile_link_color: string
  profile_sidebar_border_color: string
  profile_sidebar_fill_color: string
  profile_text_color: string
  profile_use_background_image?: any
  has_extended_profile?: any
  default_profile: boolean
  default_profile_image: boolean
  following?: any
  follow_request_sent?: any
  notifications?: any
  translator_type: string
}

/**
 * ツイート
 */
export interface Tweet {
  /**
   * ツイートの作成日時
   */
  created_at: string

  /**
   * ツイートのID
   */
  id: number

  /**
   * ツイートのID (文字列)
   */
  id_str: string

  /**
   * ツイートの本文
   *
   * 切り捨てられている可能性がある。tweet_mode=extendedで取得すると、切り捨てられない
   */
  text?: string

  /**
   * ツイートの本文
   *
   * tweet_mode=extendedの場合に取得可能
   */
  full_text?: string

  /**
   * ツイートの本文が切り捨てられたかどうか
   */
  truncated: boolean

  /**
   * ツイートのエンティティ
   */
  entities: StatusEntities

  /**
   * ツイートの投稿元情報 (aタグ)
   */
  source: string

  /**
   * リプライ先のツイートID
   */
  in_reply_to_status_id?: any

  /**
   * リプライ先のツイートID (文字列)
   */
  in_reply_to_status_id_str?: any

  /**
   * リプライ先のユーザーID
   */
  in_reply_to_user_id?: any

  /**
   * リプライ先のユーザーID (文字列)
   */
  in_reply_to_user_id_str?: any

  /**
   * リプライ先のユーザー名
   */
  in_reply_to_screen_name?: any

  /**
   * 投稿者情報
   */
  user: User

  /**
   * Geoデータ (lat, long)
   */
  geo?: any

  /**
   * 場所データ (long. lat)
   */
  coordinates?: any

  /**
   * 場所情報
   */
  place?: any

  /**
   * ツイートのコントリビューター
   */
  contributors?: any

  /**
   * 引用ツイートであるか
   */
  is_quote_status: boolean

  /**
   * リツイート数
   */
  retweet_count: number

  /**
   * いいね数
   */
  favorite_count: number

  /**
   * いいねしているか
   */
  favorited: boolean

  /**
   * リツイートしているか
   */
  retweeted: boolean

  /**
   * センシティブなツイートか
   */
  possibly_sensitive: boolean

  /**
   * ?
   *
   * @see https://twittercommunity.com/t/what-is-possibly-sensitive-appealable/76328
   */
  possibly_sensitive_appealable: boolean

  /**
   * ツイートの言語
   */
  lang: string
}
