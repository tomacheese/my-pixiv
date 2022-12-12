import { BaseWSRouter } from '@/base-ws-router'
import { loadPixiv, Pixiv } from '@/pixiv/pixiv'
import {
  AddMangaLikeRequest,
  AddMangaLikeResponse,
  GetMangaRequest,
  GetMangaResponse,
  PixivIllustItem,
  RecommendedMangaRequest,
  RecommendedMangaResponse,
  SearchMangaRequest,
  SearchMangaResponse,
} from 'my-pixiv-types'
import fs from 'fs'
import { dirname, join } from 'path'
import { PATH } from '@/utils/utils'
import { RecommendedIllustOptions } from '@/pixiv/options'

interface CacheGetManga {
  timestamp: number
  data: PixivIllustItem
}

interface CacheSearchManga {
  timestamp: number
  data: PixivIllustItem[]
}

export class GetManga extends BaseWSRouter<GetMangaRequest, GetMangaResponse> {
  validate() {
    // manga_idが存在し、数値かつ0以上であること
    return !!this.data.manga_id && this.isVaildIllustId(this.data.manga_id)
  }

  async execute() {
    const pixiv = await loadPixiv()

    const mangaId = this.data.manga_id

    // キャッシュの存在確認、1時間以内ならキャッシュを返す
    const cachePath = this.getCachePath()
    if (fs.existsSync(cachePath)) {
      const cache: CacheGetManga = JSON.parse(
        fs.readFileSync(cachePath, 'utf-8')
      )
      if (cache.timestamp + 3600 * 1000 > Date.now()) {
        this.send({
          item: cache.data,
        })
        return
      }
    }

    // キャッシュがないか、古い場合はAPIから取得
    const mangaDetail = await pixiv.getIllustDetail({
      illustId: mangaId,
    })
    const data = mangaDetail.data.illust

    // キャッシュを保存
    const cache: CacheGetManga = {
      timestamp: Date.now(),
      data,
    }
    fs.mkdirSync(dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(cache))

    this.send({
      item: data,
    })
  }

  getCachePath() {
    return join(PATH.MANGA_CACHE_DIR, 'items', this.data.manga_id + '.json')
  }

  isVaildIllustId(rawIllustId: any) {
    return (
      !Number.isNaN(parseInt(rawIllustId, 10)) || parseInt(rawIllustId, 10) < 0
    )
  }
}

export class SearchManga extends BaseWSRouter<
  SearchMangaRequest,
  SearchMangaResponse
> {
  validate() {
    // wordが空でないこと
    // search_item_countが数値かつ0以上であること
    return (
      !!this.data.word &&
      this.data.word.length > 0 &&
      !!this.data.search_item_count &&
      !Number.isNaN(
        parseInt(this.data.search_item_count as unknown as string, 10)
      ) &&
      this.data.search_item_count > 0
    )
  }

  async execute() {
    const pixiv = await loadPixiv()

    // キャッシュの存在確認、1時間以内ならキャッシュを返す
    const cachePath = this.getCachePath()
    if (fs.existsSync(cachePath)) {
      const cache: CacheSearchManga = JSON.parse(
        fs.readFileSync(cachePath, 'utf-8')
      )
      if (cache.timestamp + 3600 * 1000 > Date.now()) {
        this.send({
          items: cache.data,
        })
        return
      }
    }

    // キャッシュがないか、古い場合はAPIから取得
    const pageCount = this.getSearchPageCount()
    const illusts: PixivIllustItem[] = []
    for (let i = 0; i < pageCount; i++) {
      const result = await pixiv.searchIllust({
        word: this.data.word,
        offset: i * 30,
      })
      illusts.push(...result.data.illusts.filter((i) => i.type === 'manga'))
    }

    // キャッシュを保存
    const cache: CacheSearchManga = {
      timestamp: Date.now(),
      data: illusts,
    }

    fs.mkdirSync(dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(cache))

    this.send({
      items: illusts,
    })
  }

  getCachePath() {
    return join(
      PATH.MANGA_CACHE_DIR,
      'search',
      this.data.word.replace(' ', '-') + '.json'
    )
  }

  getSearchPageCount() {
    return Math.ceil(this.data.search_item_count / 30)
  }
}

export class RecommendedManga extends BaseWSRouter<
  RecommendedMangaRequest,
  RecommendedMangaResponse
> {
  validate(): boolean {
    // 無条件。next_urlは無くても可
    return true
  }

  async execute() {
    const pixiv = await loadPixiv()

    // next_urlがある場合はそれからオプションを生成
    let options: RecommendedIllustOptions = {
      contentType: 'manga',
    }
    if (this.data.next_url) {
      const query = Pixiv.parseQueryString(this.data.next_url)
      const minBookmarkIdForRecentIllust =
        query.min_bookmark_id_for_recent_illust
          ? parseInt(query.min_bookmark_id_for_recent_illust as string, 10)
          : undefined
      const maxBookmarkIdForRecommend = query.max_bookmark_id_for_recommend
        ? parseInt(query.max_bookmark_id_for_recommend as string, 10)
        : undefined

      options = {
        ...options,
        minBookmarkIdForRecentIllust,
        maxBookmarkIdForRecommend,
      }
    }

    // next_urlがない場合はAPIから取得
    const result = await pixiv.recommendedIllust(options)
    this.send({
      items: result.data.illusts,
      next_url: result.data.next_url,
    })
  }
}

export class AddMangaLike extends BaseWSRouter<
  AddMangaLikeRequest,
  AddMangaLikeResponse
> {
  validate(): boolean {
    // illust_idが存在し、数値かつ0以上であること
    return !!this.data.manga_id && this.isVaildIllustId(this.data.manga_id)
  }

  async execute() {
    const pixiv = await loadPixiv()

    await pixiv.illustBookmarkAdd({
      illustId: this.data.manga_id,
    })
    this.send({
      status: 'OK',
    })
  }

  isVaildIllustId(rawIllustId: any) {
    return (
      !Number.isNaN(parseInt(rawIllustId, 10)) || parseInt(rawIllustId, 10) < 0
    )
  }
}
