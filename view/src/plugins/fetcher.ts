import type { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import type { NuxtAxiosInstance } from '@nuxtjs/axios'
import { Context } from '@nuxt/types'
import { Filter, Target, TargetType } from '@/store/settings'
import {
  PixivItem,
  PixivItemRecommended,
  PixivItemWithSearchTag,
} from '@/types/pixivItem'

export class Fetcher {
  private $config: NuxtRuntimeConfig
  private $axios: NuxtAxiosInstance
  private $accessor: Context['$accessor']
  private readonly targetType: TargetType
  private readonly globalFilter: Filter[]
  private recommendedNextUrl: string | null = null
  public constructor(
    $config: NuxtRuntimeConfig,
    $axios: NuxtAxiosInstance,
    $accessor: Context['$accessor'],
    targetType: TargetType
  ) {
    this.$axios = $axios
    this.$config = $config
    this.$accessor = $accessor
    this.globalFilter = $accessor.settings.filters
    this.targetType = targetType
  }

  public async getItems(targets: Target[]): Promise<PixivItemWithSearchTag[]> {
    const results = (
      await Promise.all(
        targets.map((target) => this.getFetchItemPromise(target))
      )
    )
      .flat()
      .filter((item, index, self) => {
        return self.map((item) => item.id).indexOf(item.id) === index
      })
      .sort(
        (a, b) =>
          new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
      )
    return results
  }

  public async getFetchRecommended(more: boolean = false) {
    const response = await this.$axios.get<PixivItemRecommended>(
      `/api/recommended/${this.targetType.toLocaleLowerCase()}`,
      {
        params: {
          next_url: more ? this.recommendedNextUrl : null,
        },
      }
    )
    if (response.status !== 200) {
      throw new Error('Failed to fetch recommended')
    }

    const data = response.data.data
    for (const item of data) {
      this.itemProcessor(item)
    }

    this.recommendedNextUrl = response.data.next_url

    return data
      .filter((item) => !this.isFilterItem(null, item))
      .filter((item) => !this.isMutedItem(item))
  }

  public isLoadMoreAvailable() {
    return this.recommendedNextUrl !== null
  }

  public getFetchItemPromise(target: Target) {
    return new Promise<PixivItemWithSearchTag[]>((resolve, reject) => {
      // /api/search/illust/XXXXX or /api/search/manga/XXXXX or /api/search/novel/XXXXX
      this.$axios
        .get<PixivItem[]>(
          `/api/search/${this.targetType.toLocaleLowerCase()}/` +
            target.tag.join(' ')
        )
        .then((result) => {
          const data = result.data
          for (const item of data) {
            this.itemProcessor(item)
          }
          // フィルタリングを行う
          resolve(
            data
              .filter((item) => !this.isFilterItem(target, item))
              .filter((item) => !this.isMutedItem(item))
              .filter(
                (item: PixivItem) => item.total_bookmarks >= target.minLikeCount
              )
              .map((item) => {
                return {
                  ...item,
                  searchTags: target.tag,
                }
              })
          )
        })
        .catch(reject)
    })
  }

  private itemProcessor(item: PixivItem) {
    item.image_urls.large = this.convertImageUrl(item, item.image_urls.large)
    item.image_urls.medium = this.convertImageUrl(item, item.image_urls.medium)
    item.image_urls.square_medium = this.convertImageUrl(
      item,
      item.image_urls.square_medium
    )

    if (this.targetType === 'ILLUST' || this.targetType === 'MANGA') {
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
              (tag) =>
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
            item.tags.some((tag) => tag.name.includes(ignore))
          )
        })
      : false
  }

  public isMutedItem(item: PixivItem) {
    return this.$accessor.itemMute.items.some((mutedItem) => {
      switch (mutedItem.type) {
        case 'ILLUST':
          // イラストとマンガの場合は item.type が undefined ではない
          return item.type !== undefined && item.id === mutedItem.id
        case 'NOVEL':
          // 小説の場合は item.type が undefined
          return item.type === undefined && item.id === mutedItem.id
        case 'USER':
          return item.user.id === mutedItem.id
        default:
          return false
      }
    })
  }
}
