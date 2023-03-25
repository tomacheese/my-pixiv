import type { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import { Context } from '@nuxt/types'
import {
  SearchNovelResponse,
  SearchMangaResponse,
  SearchIllustResponse,
} from 'my-pixiv-types'
import { Filter, Target, TargetType } from '@/store/settings'
import {
  isPixivIllustItem,
  isPixivNovelItem,
  isSeriesItem,
  PixivItem,
  PixivItemWithSearchTag,
} from '@/types/pixiv-item'

/**
 * アイテム取得クラス
 */
export class Fetcher {
  private $config: NuxtRuntimeConfig
  private $api: Context['$api']
  private $accessor: Context['$accessor']
  private readonly targetType: TargetType
  private readonly globalFilter: Filter[]
  private recommendedNextUrl: string | undefined = undefined

  /**
   * コンストラクタ
   *
   * @param $config NuxtRuntimeConfig
   * @param $api WebSocket API
   * @param $accessor Vuex アクセサ
   * @param targetType 対象種別
   */
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

  /**
   * アイテムの重複を除去してソートする。ソートは新しい順
   *
   * @param items アイテム
   * @returns 重複を除去してソートしたアイテム
   */
  public sortItems(items: PixivItemWithSearchTag[]): PixivItemWithSearchTag[] {
    return items
      .filter(Boolean)
      .filter((item, index, self) => {
        return self.map((item) => item.id).indexOf(item.id) === index
      })
      .sort(
        (a, b) =>
          new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
      )
  }

  /**
   * おすすめアイテムを取得する
   *
   * @param more 追加取得するか
   * @returns おすすめアイテム
   */
  public async getFetchRecommended(more = false) {
    if (this.$api.getReadyState() !== WebSocket.OPEN) {
      this.$api.reconnect()
    }
    const apiMethod = this.getApiMethod(this.targetType)
    const response = await apiMethod
      .recommended(
        more && this.recommendedNextUrl ? this.recommendedNextUrl : undefined
      )
      .catch((error) => {
        console.error(error)
        // eslint-disable-next-line unicorn/no-null
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
      .filter((item) => !this.isFilterItem(undefined, item))
      .filter((item) => !this.isMutedItem(item))
  }

  /**
   * あとで見るアイテムを取得する
   *
   * @returns あとで見るアイテム
   */
  public getFetchLater() {
    const items = this.$accessor.settings.later

    return items
      .filter((item) => !this.isFilterItem(undefined, item))
      .filter((item) => !this.isMutedItem(item))
      .filter((item) =>
        this.targetType === 'ILLUST'
          ? isPixivIllustItem(item)
          : isPixivNovelItem(item)
      )
  }

  /**
   * さらに読み込むアイテムがあるか
   *
   * @returns さらに読み込むアイテムがあるか
   */
  public isLoadMoreAvailable() {
    return !!this.recommendedNextUrl
  }

  /**
   * アイテムを取得するPromiseを取得する
   *
   * @param target 対象
   * @returns アイテムを取得するPromise
   */
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
            const items: PixivItem[] = result.data.items
            for (const item of items) {
              this.itemProcessor(item)
            }
            // フィルタリングを行う
            resolve(
              items
                .filter((item) => !this.isFilterItem(target, item))
                .filter((item) => !this.isMutedItem(item))
                .filter((item) => item.total_bookmarks >= target.minLikeCount)
                .map((item) => {
                  return {
                    ...item,
                    searchTags: target.tag,
                  }
                })
            )
          }
        )
        .catch((error) => reject(error))
    })
  }

  /**
   * 対象種別に応じたAPIメソッドを取得する
   *
   * @param targetType 対象種別
   * @returns APIメソッド
   */
  private getApiMethod(targetType: TargetType) {
    switch (targetType) {
      case 'ILLUST': {
        return this.$api.illust
      }
      case 'MANGA': {
        return this.$api.manga
      }
      case 'NOVEL': {
        return this.$api.novel
      }
    }
  }

  /**
   * アイテムを処理する。画像をmy-pixiv API経由で取得するようにURLを変換する
   *
   * アイテムは参照渡しで変更される
   *
   * @param item アイテム
   */
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

  /**
   * 画像URLを変換する
   *
   * @param item アイテム
   * @param url 画像URL
   * @returns 変換後の画像URL
   */
  private convertImageUrl(item: PixivItem, url: string) {
    if (this.$accessor.settings.imageServerUrl) {
      return [
        this.$accessor.settings.imageServerUrl,
        'images',
        this.targetType.toLocaleLowerCase(),
        `${item.id}?url=${url}`,
      ].join('/')
    }
    return [
      `${this.$config.baseURL}api`,
      'images',
      this.targetType.toLocaleLowerCase(),
      `${item.id}?url=${url}`,
    ].join('/')
  }

  /**
   * フィルター対象かどうか
   *
   * @param target 検索ターゲット情報
   * @param item アイテム
   * @returns フィルター対象であれば true
   */
  private isFilterItem(target: Target | undefined, item: PixivItem) {
    // グローバルフィルター
    for (const filter of this.globalFilter) {
      switch (filter.type) {
        case 'TITLE': {
          if (item.title.includes(filter.value)) {
            return true
          }
          break
        }
        case 'CAPTION': {
          if (item.caption.includes(filter.value)) {
            return true
          }
          break
        }
        case 'TAG': {
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
    }
    // 個別ターゲットフィルター
    // 除外文字列が、タイトル・作者名・タグに含まれていたらフィルタリング対象
    return target === undefined
      ? false
      : target.ignores.some((ignore) => {
          return (
            item.title.includes(ignore) ||
            item.user.name.includes(ignore) ||
            item.tags.some((tag) => tag.name.includes(ignore))
          )
        })
  }

  /**
   * アイテムがミュート対象かどうか
   *
   * @param item アイテム
   * @returns ミュート対象であれば true
   */
  public isMutedItem(item: PixivItem): boolean {
    return this.$accessor.itemMute.items.some((mutedItem) => {
      switch (mutedItem.type) {
        case 'ILLUST': {
          return isPixivIllustItem(item) && item.id === mutedItem.id
        }
        case 'NOVEL': {
          return isPixivNovelItem(item) && item.id === mutedItem.id
        }
        case 'USER': {
          return item.user.id === mutedItem.id
        }
        case 'NOVEL_SERIES': {
          return (
            isPixivNovelItem(item) &&
            isSeriesItem(item.series) &&
            item.series.id === mutedItem.id
          )
        }
        default: {
          return false
        }
      }
    })
  }
}
