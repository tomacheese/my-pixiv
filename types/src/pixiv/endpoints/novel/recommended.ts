import { PixivNovelItem } from '../../pixivNovel'

export interface RecommendedNovelApiResponse {
  novels: PixivNovelItem[]
  ranking_novels: unknown[]
  privacy_policy: unknown
  next_url: string
}
