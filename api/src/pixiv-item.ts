import {
  PixivIllustItem,
  PixivNovelItem,
  PixivUserItem,
  Series,
  PixivNovelSeriesItem,
  NovelSeriesDetail,
} from 'my-pixiv-types'

export type PixivItem = PixivIllustItem | PixivNovelItem

export type PixivItemWithSearchTag = PixivItem & {
  searchTags: string[]
}

export const isPixivItem = (item: any): item is PixivItem => {
  return (
    (item as PixivItem).id !== undefined &&
    (item as PixivItem).title !== undefined &&
    (item as PixivItem).user !== undefined &&
    (item as PixivItem).tags !== undefined
  )
}

/**
 * アイテムがイラストかどうかを判定する
 *
 * イラストの場合、type は "illust" または "manga" になる。
 *
 * @param item アイテム
 * @returns イラストの場合は true
 */
export const isPixivIllustItem = (item: PixivItem): item is PixivIllustItem => {
  return (item as PixivIllustItem).type !== undefined
}

/**
 * アイテムが小説かどうかを判定する
 *
 * 小説の場合、type は undefined になる。
 *
 * @param item アイテム
 * @returns 小説の場合は true
 */
export const isPixivNovelItem = (item: PixivItem): item is PixivNovelItem => {
  return (item as PixivIllustItem).type === undefined
}

/**
 * アイテムがユーザーかどうかを判定する
 *
 * @param item アイテム
 * @returns ユーザーの場合は true
 */
export const isPixivUserItem = (item: any): item is PixivUserItem => {
  return (
    (item as PixivUserItem).name !== undefined &&
    (item as PixivUserItem).account !== undefined
  )
}

export const isSeriesItem = (
  series: Series | unknown[] | null
): series is Series => {
  return series !== null && (series as Series).id !== undefined
}

export const isPixivNovelSeriesItem = (
  item: any
): item is PixivNovelSeriesItem => {
  return (
    (item as PixivNovelSeriesItem).novel_series_detail !== undefined &&
    (item as PixivNovelSeriesItem).novel_series_first_novel !== undefined &&
    (item as PixivNovelSeriesItem).novel_series_latest_novel !== undefined &&
    (item as PixivNovelSeriesItem).novels !== undefined &&
    (item as PixivNovelSeriesItem).next_url !== undefined
  )
}

export const isNovelSeriesDetail = (item: any): item is NovelSeriesDetail => {
  return (
    (item as NovelSeriesDetail).id !== undefined &&
    (item as NovelSeriesDetail).title !== undefined &&
    (item as NovelSeriesDetail).caption !== undefined &&
    (item as NovelSeriesDetail).is_original !== undefined &&
    (item as NovelSeriesDetail).is_concluded !== undefined &&
    (item as NovelSeriesDetail).content_count !== undefined
  )
}
