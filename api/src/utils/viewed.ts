import fs from 'fs'
import { ViewedItem, ViewedItemType } from 'my-pixiv-types'
import { PATH } from './utils'

type ViewedItemJsonSchema = ViewedItem[]

/**
 * 既読 API
 */
export class ViewedApi {
  private vieweds: ViewedItem[]
  private static cache: {
    vieweds: ViewedItem[]
    timestamp: number
  } | null = null

  private constructor(vieweds: ViewedItem[]) {
    this.vieweds = vieweds
  }

  /**
   * アイテムが既読かどうかを返す
   *
   * @param type 既読アイテム種別
   * @param id アイテム ID
   * @returns 既読なら true
   */
  isViewed(type: ViewedItemType, id: number): boolean {
    return this.vieweds.some(
      (viewed) => viewed.type === type && viewed.id === id
    )
  }

  /**
   * アイテムを既読にする
   *
   * @param item 既読アイテム
   * @returns 既読なら true
   */
  add(item: ViewedItem): void {
    if (this.isViewed(item.type, item.id)) {
      return
    }
    this.vieweds.push(item)

    this.save()
  }

  /**
   * アイテムの既読を解除する
   *
   * @param type 既読アイテム種別
   * @param id アイテム ID
   */
  remove(type: ViewedItemType, id: number): void {
    this.vieweds = this.vieweds.filter(
      (viewed) => !(viewed.type === type && viewed.id === id)
    )

    this.save()
  }

  /**
   * 既読アイテムを取得する
   *
   * @param type 既読アイテム種別
   * @returns 既読アイテム
   */
  get(type?: ViewedItemType): ViewedItem[] {
    if (!type) {
      return this.vieweds
    }
    return this.vieweds.filter((viewed) => viewed.type === type)
  }

  /**
   * 既読アイテムを設定する
   *
   * @param vieweds 既読アイテム
   */
  set(vieweds: ViewedItem[]): void {
    this.vieweds = vieweds

    this.save()
  }

  /**
   * すべての既読を解除する
   */
  clear(): void {
    this.vieweds = []

    this.save()
  }

  /**
   * 既読情報を保存する
   */
  save(): void {
    fs.writeFileSync(
      PATH.VIEWED_FILE,
      JSON.stringify(this.vieweds as ViewedItemJsonSchema)
    )

    ViewedApi.cache = {
      vieweds: this.vieweds,
      timestamp: Date.now(),
    }
  }

  /**
   * インスタンスを生成する
   *
   * @returns 既読 API インスタンス
   */
  public static of() {
    // 1時間キャッシュ
    if (
      !ViewedApi.cache ||
      Date.now() - ViewedApi.cache.timestamp > 1000 * 60 * 60
    ) {
      if (!fs.existsSync(PATH.VIEWED_FILE)) {
        return new ViewedApi([])
      }
      const vieweds: ViewedItemJsonSchema = JSON.parse(
        fs.readFileSync(PATH.VIEWED_FILE, 'utf8')
      )
      ViewedApi.cache = {
        vieweds,
        timestamp: Date.now(),
      }
      return new ViewedApi(vieweds)
    }

    return new ViewedApi(ViewedApi.cache.vieweds)
  }
}
