import fs from 'fs'
import { ViewedItem, ViewedItemType } from 'my-pixiv-types'
import { PATH } from './utils'

type ViewedItemJsonSchema = ViewedItem[]

export class ViewedApi {
  private vieweds: ViewedItem[]
  private static cache: {
    vieweds: ViewedItem[]
    timestamp: number
  } | null = null

  constructor(vieweds: ViewedItem[]) {
    this.vieweds = vieweds
  }

  isViewed(type: ViewedItemType, id: number): boolean {
    return this.vieweds.some(
      (viewed) => viewed.type === type && viewed.id === id
    )
  }

  add(item: ViewedItem): void {
    if (this.isViewed(item.type, item.id)) {
      return
    }
    this.vieweds.push(item)

    this.save()
  }

  remove(type: ViewedItemType, id: number): void {
    this.vieweds = this.vieweds.filter(
      (viewed) => !(viewed.type === type && viewed.id === id)
    )

    this.save()
  }

  get(type?: ViewedItemType): ViewedItem[] {
    if (!type) {
      return this.vieweds
    }
    return this.vieweds.filter((viewed) => viewed.type === type)
  }

  set(vieweds: ViewedItem[]): void {
    this.vieweds = vieweds

    this.save()
  }

  clear(): void {
    this.vieweds = []

    this.save()
  }

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
