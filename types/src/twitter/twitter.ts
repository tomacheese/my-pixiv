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

export interface Tweet {
  created_at: string
  id: number
  id_str: string
  text?: string
  full_text: string
  truncated: boolean
  entities: StatusEntities
  source: string
  in_reply_to_status_id?: any
  in_reply_to_status_id_str?: any
  in_reply_to_user_id?: any
  in_reply_to_user_id_str?: any
  in_reply_to_screen_name?: any
  user: User
  geo?: any
  coordinates?: any
  place?: any
  contributors?: any
  is_quote_status: boolean
  retweet_count: number
  favorite_count: number
  favorited: boolean
  retweeted: boolean
  possibly_sensitive: boolean
  possibly_sensitive_appealable: boolean
  lang: string
}
