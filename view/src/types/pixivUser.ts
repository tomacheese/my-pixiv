export interface PixivUserItem {
  id: number
  name: string
  account: string
  profile_image_urls: {
    medium: string
  }
  comment: string
  is_followed: boolean
  is_access_blocking_user: boolean
}
