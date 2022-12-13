import type { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import { Context } from '@nuxt/types'
import {
  SearchNovelResponse,
  SearchMangaResponse,
  SearchIllustResponse,
  Tag,
} from 'my-pixiv-types'
import { Filter, Target, TargetType } from '@/store/settings'
import {
  isPixivIllustItem,
  isPixivNovelItem,
  isSeriesItem,
  PixivItem,
  PixivItemWithSearchTag,
} from '@/types/pixivItem'

export class Fetcher {
  private $config: NuxtRuntimeConfig
  private $api: Context['$api']
  private $accessor: Context['$accessor']
  private readonly targetType: TargetType
  private readonly globalFilter: Filter[]
  private recommendedNextUrl: string | null = null
  public constructor(
    $config: NuxtRuntimeConfig,
    $api: Context['$api'],
    $accessor: Context['$accessor'],
    targetType: TargetType
  ) {
    this.$api = $api
    this.$config = $config
    this.$accessor = $accessor
    this.globalFilter = $accessor.settings.filters
    this.targetType = targetType
  }

  public sortItems(items: PixivItemWithSearchTag[]): PixivItemWithSearchTag[] {
    return items
      .filter((item) => item)
      .filter((item, index, self) => {
        return self.map((item) => item.id).indexOf(item.id) === index
      })
      .sort(
        (a, b) =>
          new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
      )
  }

  public async getFetchRecommended(more: boolean = false) {
    if (this.$api.getReadyState() !== WebSocket.OPEN) {
      this.$api.reconnect()
    }
    const apiMethod = this.getApiMethod(this.targetType)
    const response = await apiMethod
      .recommended(
        more && this.recommendedNextUrl ? this.recommendedNextUrl : undefined
      )
      .catch((e) => {
        console.error(e)
        return null
      })
    if (response === null) {
      throw new Error('Failed to fetch recommended')
    }

    const data = response.data.items
    for (const item of data) {
      this.itemProcessor(item)
    }

    this.recommendedNextUrl = response.data.next_url

    return data
      .filter((item) => !this.isFilterItem(null, item))
      .filter((item) => !this.isMutedItem(item))
  }

  public getFetchLater() {
    const items = this.$accessor.settings.later

    return items
      .filter((item) => !this.isFilterItem(null, item))
      .filter((item) => !this.isMutedItem(item))
      .filter((item) =>
        this.targetType === 'ILLUST'
          ? isPixivIllustItem(item)
          : isPixivNovelItem(item)
      )
  }

  public isLoadMoreAvailable() {
    return this.recommendedNextUrl !== null
  }

  public getFetchItemPromise(target: Target) {
    return new Promise<PixivItemWithSearchTag[]>((resolve, reject) => {
      if (this.$api.getReadyState() !== WebSocket.OPEN) {
        this.$api.reconnect()
      }
      const apiMethod = this.getApiMethod(this.targetType)
      apiMethod
        .searchByTag(target.tag.join(' '), target.searchItemCount ?? 150)
        .then(
          (
            result:
              | SearchNovelResponse
              | SearchMangaResponse
              | SearchIllustResponse
          ) => {
            const items = result.data.items
            for (const item of items) {
              this.itemProcessor(item)
            }
            // フィルタリングを行う
            resolve(
              (items as PixivItem[])
                .filter((item: PixivItem) => !this.isFilterItem(target, item))
                .filter((item: PixivItem) => !this.isMutedItem(item))
                .filter(
                  (item: PixivItem) =>
                    item.total_bookmarks >= target.minLikeCount
                )
                .map((item: PixivItem) => {
                  return {
                    ...item,
                    searchTags: target.tag,
                  }
                })
            )
          }
        )
        .catch((e) => reject(e))
    })
  }

  private getApiMethod(targetType: TargetType) {
    switch (targetType) {
      case 'ILLUST':
        return this.$api.illust
      case 'MANGA':
        return this.$api.manga
      case 'NOVEL':
        return this.$api.novel
    }
  }

  private itemProcessor(item: PixivItem) {
    item.image_urls.large = this.convertImageUrl(item, item.image_urls.large)
    item.image_urls.medium = this.convertImageUrl(item, item.image_urls.medium)
    item.image_urls.square_medium = this.convertImageUrl(
      item,
      item.image_urls.square_medium
    )

    if (
      (this.targetType === 'ILLUST' || this.targetType === 'MANGA') &&
      isPixivIllustItem(item) &&
      item.meta_pages
    ) {
      for (const metaPage of item.meta_pages) {
        metaPage.image_urls.large = this.convertImageUrl(
          item,
          metaPage.image_urls.large
        )
        metaPage.image_urls.medium = this.convertImageUrl(
          item,
          metaPage.image_urls.medium
        )
        metaPage.image_urls.square_medium = this.convertImageUrl(
          item,
          metaPage.image_urls.square_medium
        )
        metaPage.image_urls.original = this.convertImageUrl(
          item,
          metaPage.image_urls.original
        )
      }
    }
  }

  private convertImageUrl(item: PixivItem, url: string) {
    return [
      `${this.$config.baseURL}api`,
      'images',
      this.targetType.toLocaleLowerCase(),
      `${item.id}?url=${url}`,
    ].join('/')
  }

  private isFilterItem(target: Target | null, item: PixivItem) {
    // グローバルフィルター
    for (const filter of this.globalFilter) {
      switch (filter.type) {
        case 'TITLE':
          if (item.title.includes(filter.value)) {
            return true
          }
          break
        case 'CAPTION':
          if (item.caption.includes(filter.value)) {
            return true
          }
          break
        case 'TAG':
          if (
            item.tags.some(
              (tag: Tag) =>
                tag.name.includes(filter.value) ||
                (tag.translated_name &&
                  tag.translated_name.includes(filter.value))
            )
          ) {
            return true
          }
          break
      }
    }
    // 個別ターゲットフィルター
    // 除外文字列が、タイトル・作者名・タグに含まれていたらフィルタリング対象
    return target !== null
      ? target.ignores.some((ignore) => {
          return (
            item.title.includes(ignore) ||
            item.user.name.includes(ignore) ||
            item.tags.some((tag: Tag) => tag.name.includes(ignore))
          )
        })
      : false
  }

  public isMutedItem(item: PixivItem) {
    return this.$accessor.itemMute.items.some((mutedItem) => {
      switch (mutedItem.type) {
        case 'ILLUST':
          return isPixivIllustItem(item) && item.id === mutedItem.id
        case 'NOVEL':
          return isPixivNovelItem(item) && item.id === mutedItem.id
        case 'USER':
          return item.user.id === mutedItem.id
        case 'NOVEL_SERIES':
          return (
            isPixivNovelItem(item) &&
            isSeriesItem(item.series) &&
            item.series.id === mutedItem.id
          )
        default:
          return false
      }
    })
  }
}
