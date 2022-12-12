import {
  PixivUserItem,
  PixivUserProfile,
  PixivUserProfilePublicity,
  PixivUserProfileWorkspace,
} from '../../pixivUser'

export interface GetUserDetailApiResponse {
  user: PixivUserItem
  profile: PixivUserProfile
  profile_publicity: PixivUserProfilePublicity
  workspace: PixivUserProfileWorkspace
}
