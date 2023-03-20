import { BaseWSRouter } from '@/base-ws-router'
import { loadPixiv, Pixiv } from '@/pixiv/pixiv'
import {
  GetNovelRequest,
  SearchNovelRequest,
  RecommendedNovelRequest,
  GetNovelSeriesRequest,
  GetNovelResponse,
  GetNovelSeriesResponse,
  RecommendedNovelResponse,
  SearchNovelResponse,
  PixivNovelItem,
  PixivNovelSeriesItem,
} from 'my-pixiv-types'
import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { PATH } from '@/utils/utils'
import { RecommendedNovelOptions } from '@/pixiv/options'

/**
 * 小説キャッシュモデル
 */
interface CacheGetNovel {
  timestamp: number
  data: PixivNovelItem
}

/**
 * 小説シリーズキャッシュモデル
 */
interface CacheGetNovelSeries {
  timestamp: number
  data: PixivNovelSeriesItem
}

/**
 * 小説検索キャッシュモデル
 */
interface CacheSearchNovel {
  timestamp: number
  data: PixivNovelItem[]
}

/**
 * 小説詳細取得 WebSocket API
 *
 * 結果は1時間キャッシュする。
 */
export class GetNovel extends BaseWSRouter<GetNovelRequest, GetNovelResponse> {
  validate() {
    // novel_idが存在し、数値かつ0以上であること
    return !!this.data.novel_id && this.isVaildNovelId(this.data.novel_id)
  }

  async execute() {
    const pixiv = await loadPixiv()

    const novelId = this.data.novel_id

    // キャッシュの存在確認、1時間以内ならキャッシュを返す
    const cachePath = this.getCachePath()
    if (fs.existsSync(cachePath)) {
      const cache: CacheGetNovel = JSON.parse(
        fs.readFileSync(cachePath, 'utf8')
      )
      if (cache.timestamp + 3600 * 1000 > Date.now()) {
        this.send(cache.data)
        return
      }
    }

    // キャッシュがないか、古い場合はAPIから取得
    const novelDetail = await pixiv.getNovelDetail({
      novelId,
    })
    const data = novelDetail.data.novel

    // キャッシュを保存
    const cache: CacheGetNovel = {
      timestamp: Date.now(),
      data,
    }
    fs.mkdirSync(dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(cache))

    this.send(data)
  }

  getCachePath() {
    return join(PATH.NOVEL_CACHE_DIR, 'items', this.data.novel_id + '.json')
  }

  isVaildNovelId(rawIllustId: any) {
    return (
      !Number.isNaN(Number.parseInt(rawIllustId, 10)) ||
      Number.parseInt(rawIllustId, 10) < 0
    )
  }
}

/**
 * 小説検索 WebSocket API
 *
 * 結果は1時間キャッシュする。
 */
export class SearchNovel extends BaseWSRouter<
  SearchNovelRequest,
  SearchNovelResponse
> {
  validate() {
    // wordが空でないこと
    // search_item_countが数値かつ0以上であること
    return (
      !!this.data.word &&
      this.data.word.length > 0 &&
      !!this.data.search_item_count &&
      !Number.isNaN(
        Number.parseInt(this.data.search_item_count as unknown as string, 10)
      ) &&
      this.data.search_item_count > 0
    )
  }

  async execute() {
    const pixiv = await loadPixiv()

    // キャッシュの存在確認、1時間以内ならキャッシュを返す
    const cachePath = this.getCachePath()
    if (fs.existsSync(cachePath)) {
      const cache: CacheSearchNovel = JSON.parse(
        fs.readFileSync(cachePath, 'utf8')
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
    const novels: PixivNovelItem[] = []
    for (let i = 0; i < pageCount; i++) {
      const result = await pixiv.searchNovel({
        word: this.data.word,
        offset: i * 30,
      })
      novels.push(...result.data.novels)
    }

    // キャッシュを保存
    const cache: CacheSearchNovel = {
      timestamp: Date.now(),
      data: novels,
    }

    fs.mkdirSync(dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(cache))

    this.send({
      items: novels,
    })
  }

  getCachePath() {
    return join(
      PATH.NOVEL_CACHE_DIR,
      'search',
      this.data.word.replace(' ', '-') + '.json'
    )
  }

  getSearchPageCount() {
    return Math.ceil(this.data.search_item_count / 30)
  }
}

/**
 * おすすめ小説取得 WebSocket API
 */
export class RecommendedNovel extends BaseWSRouter<
  RecommendedNovelRequest,
  RecommendedNovelResponse
> {
  validate(): boolean {
    // 無条件。next_urlは無くても可
    return true
  }

  async execute() {
    const pixiv = await loadPixiv()

    // next_urlがある場合はそれからオプションを生成
    let options: RecommendedNovelOptions = {}
    if (this.data.next_url) {
      const query = Pixiv.parseQueryString(this.data.next_url)
      const maxBookmarkIdForRecommend = query.max_bookmark_id_for_recommend
        ? Number.parseInt(query.max_bookmark_id_for_recommend as string, 10)
        : undefined
      const alreadyRecommended = (query.already_recommended as string)
        .split(',')
        .map((id) => Number.parseInt(id, 10))
      options = {
        ...options,
        maxBookmarkIdForRecommend,
        alreadyRecommended,
      }
    }

    // next_urlがない場合はAPIから取得
    const result = await pixiv.recommendedNovel(options)
    this.send({
      items: result.data.novels,
      next_url: result.data.next_url,
    })
  }
}

/**
 * 小説シリーズ取得 WebSocket API
 *
 * 結果は1時間キャッシュする。
 */
export class GetNovelSeries extends BaseWSRouter<
  GetNovelSeriesRequest,
  GetNovelSeriesResponse
> {
  validate(): boolean {
    // series_idが存在し、数値かつ0以上であること
    return (
      !!this.data.series_id && this.isVaildNovelSeriesId(this.data.series_id)
    )
  }

  async execute() {
    const pixiv = await loadPixiv()

    const seriesId = this.data.series_id

    // キャッシュの存在確認、1時間以内ならキャッシュを返す
    const cachePath = this.getCachePath()
    if (fs.existsSync(cachePath)) {
      const cache: CacheGetNovelSeries = JSON.parse(
        fs.readFileSync(cachePath, 'utf8')
      )
      if (cache.timestamp + 3600 * 1000 > Date.now()) {
        this.send(cache.data)
        return
      }
    }

    // キャッシュがないか、古い場合はAPIから取得
    const novelSeries = await pixiv.getNovelSeries({
      seriesId,
    })
    const data = novelSeries.data

    // キャッシュを保存
    const cache: CacheGetNovelSeries = {
      timestamp: Date.now(),
      data,
    }
    fs.mkdirSync(dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(cache))

    this.send(data)
  }

  getCachePath() {
    return join(PATH.NOVEL_CACHE_DIR, 'series', this.data.series_id + '.json')
  }

  isVaildNovelSeriesId(rawIllustId: any) {
    return (
      !Number.isNaN(Number.parseInt(rawIllustId, 10)) ||
      Number.parseInt(rawIllustId, 10) < 0
    )
  }
}
