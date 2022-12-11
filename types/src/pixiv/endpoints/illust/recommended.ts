import { PixivIllustItem } from '../../pixivIllust'

export interface RecommendedIllustApiResponse {
  illusts: PixivIllustItem[]
  ranking_illusts: unknown[]
  contest_exists: boolean
  privacy_policy: unknown
  next_url: string
}
