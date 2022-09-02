import type { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import type { NuxtAxiosInstance } from '@nuxtjs/axios'
import { Filter, Target, TargetType } from '@/store/settings'
import { PixivItem, PixivItemWithSearchTag } from '@/types/pixivItem'

export class Fetcher {
  private $config: NuxtRuntimeConfig
  private $axios: NuxtAxiosInstance
  private readonly targetType: TargetType
  private readonly globalFilter: Filter[]
  public constructor(
    $config: NuxtRuntimeConfig,
    $axios: NuxtAxiosInstance,
    globalFilter: Filter[],
    targetType: TargetType
  ) {
    this.$axios = $axios
    this.$config = $config
    this.globalFilter = globalFilter
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

  public async getFetchRecommended() {
    const response = await this.$axios.get<PixivItem[]>(
      `/api/recommended/${this.targetType.toLocaleLowerCase()}`
    )
    const data = response.data
    for (const item of data) {
      this.itemProcessor(item)
    }

    return data
  }

  public getFetchItemPromise(target: Target) {
    return new Promise<PixivItemWithSearchTag[]>((resolve, reject) => {
      // /api/illust/XXXXX or /api/novel/XXXXX
      this.$axios
        .get<PixivItem[]>(
          `/api/${this.targetType.toLocaleLowerCase()}/` + target.tag.join(' ')
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
    item.image_urls.large = `${this.$config.baseURL}api/images/${item.id}?url=${item.image_urls.large}`
    item.image_urls.medium = `${this.$config.baseURL}api/images/${item.id}?url=${item.image_urls.medium}`
    item.image_urls.square_medium = `${this.$config.baseURL}api/images/${item.id}?url=${item.image_urls.square_medium}`

    if (this.targetType === 'ILLUST' || this.targetType === 'MANGA') {
      for (const metaPage of item.meta_pages) {
        metaPage.image_urls.large = `${this.$config.baseURL}api/images/${item.id}?url=${metaPage.image_urls.large}`
        metaPage.image_urls.medium = `${this.$config.baseURL}api/images/${item.id}?url=${metaPage.image_urls.medium}`
        metaPage.image_urls.square_medium = `${this.$config.baseURL}api/images/${item.id}?url=${metaPage.image_urls.square_medium}`
      }
    }
  }

  private isFilterItem(target: Target, item: PixivItem) {
    // グローバルフィルター
    for (const filter of this.globalFilter) {
      switch (filter.type) {
        case 'TITLE':
          if (item.title.includes(filter.value)) {
            return true
          }
          break
        case 'AUTHOR':
          if (item.user.name.includes(filter.value)) {
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
        case 'ALL':
          if (
            item.title.includes(filter.value) ||
            item.user.name.includes(filter.value) ||
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
    return target.ignores.some((ignore) => {
      return (
        item.title.includes(ignore) ||
        item.user.name.includes(ignore) ||
        item.tags.some((tag) => tag.name.includes(ignore))
      )
    })
  }
}
