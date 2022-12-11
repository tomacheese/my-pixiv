export interface TwitterUser {
  id: string
  name: string
  screen_name: string
  profile_image_url: string
}
export interface TweetData {
  id: string
  text: string
  media_url: string
  user: TwitterUser
}
export interface Tweet {
  tweet: TweetData
  similarity: number
  identity: string
}
