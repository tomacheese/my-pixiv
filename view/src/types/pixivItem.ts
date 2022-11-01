import { PixivIllustItem } from './pixivIllust'
import { PixivNovelItem } from './pixivNovel'
import { PixivUserItem } from './pixivUser'

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
