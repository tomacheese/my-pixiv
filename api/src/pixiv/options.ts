export type SearchTargets =
  | 'partial_match_for_tags'
  | 'exact_match_for_tags'
  | 'title_and_caption'
  | 'keyword'
export type SearchSorts = 'date_desc' | 'date_asc' | 'popular_desc'
export type SearchIllustDurations =
  | 'within_last_day'
  | 'within_last_week'
  | 'within_last_month'
export type Filters = 'for_ios'
export type ContentType = 'illust' | 'manga'
export type BookmarkRestrict = 'public' | 'private'

export interface SearchIllustOptions {
  word: string
  searchTarget?: SearchTargets
  sort?: SearchSorts
  duration?: SearchIllustDurations
  startDate?: string
  endDate?: string
  filter?: Filters
  offset?: number
}

export interface GetIllustDetailOptions {
  illustId: number
}

export interface RecommendedIllustOptions {
  requireAuth?: boolean
  contentType: ContentType
  includeRankingLabel?: boolean
  filter?: Filters
  maxBookmarkIdForRecommend?: number
  minBookmarkIdForRecentIllust?: number
  offset?: number
  includeRankingIllusts?: boolean
  bookmarkIllustIds?: number[]
  includePrivacyPolicy?: boolean
  // viewed: number[] // めんどくさいから対応しない
}

export interface IllustBookmarkAddOptions {
  illustId: number
  restrict?: BookmarkRestrict
  tags?: string[]
}

export interface GetNovelDetailOptions {
  novelId: number
}

export interface SearchNovelOptions {
  word: string
  searchTarget?: SearchTargets
  sort?: SearchSorts
  mergePlainKeywordResults?: boolean
  includeTranslatedTagResults?: boolean
  startDate?: string
  endDate?: string
  filter?: Filters
  offset?: number
}

export interface RecommendedNovelOptions {
  requireAuth?: boolean
  includeRankingLabel?: boolean
  filter?: Filters
  offset?: number
  includeRankingNovels?: boolean
  alreadyRecommended?: number[]
  maxBookmarkIdForRecommend?: number
  includePrivacyPolicy?: boolean
}

export interface GetNovelSeriesOptions {
  seriesId: number
  filter?: Filters
  lastOrder?: string
}

export interface GetUserDetailOptions {
  userId: number
  filter?: Filters
}
