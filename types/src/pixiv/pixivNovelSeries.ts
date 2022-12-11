import { PixivUser } from './pixivCommon'
import { PixivNovelItem } from './pixivNovel'

export interface NovelSeriesDetail {
  id: number
  title: string
  caption: string
  is_original: boolean
  is_concluded: boolean
  content_count: number
  total_character_count: number
  user: PixivUser
  display_text: string
  novel_ai_type: number
  watchlist_added: boolean
}

export interface PixivNovelSeriesItem {
  novel_series_detail: NovelSeriesDetail
  novel_series_first_novel: PixivNovelItem
  novel_series_latest_novel: PixivNovelItem
  novels: PixivNovelItem[]
  next_url: string
}
