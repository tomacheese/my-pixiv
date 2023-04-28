import { Search } from 'my-pixiv-db'
import { DatabaseManager } from './lib/database'
import {
  Pixiv,
  PixivIllustItem,
  PixivNovelItem,
  Series,
} from '@book000/pixivts'
import { Logger } from '@book000/node-utils'
import { PixivSaver } from './lib/pixiv-saver'

export class SearchPixiv {
  private databaseManager: DatabaseManager
  private pixiv: Pixiv
  private search: Search

  constructor(databaseManager: DatabaseManager, pixiv: Pixiv, search: Search) {
    this.databaseManager = databaseManager
    this.pixiv = pixiv
    this.search = search
  }

  async run() {
    const word = this.search.include_tags.join(' ')
    const illusts = await this.searchIllusts(word)
    for (const illust of illusts) {
      const illustRow = await this.databaseManager.upsertIlust(
        illust,
        await this.getIllustSeriesDetail(illust.series)
      )
      await this.databaseManager.addIllustSearchResult(this.search, illustRow)
    }

    const novels = await this.searchNovels(word)
    for (const novel of novels) {
      const novelRow = await this.databaseManager.upsertNovel(
        novel,
        await this.getNovelSeriesDetail(novel.series)
      )
      await this.databaseManager.addNovelSearchResult(this.search, novelRow)
    }
  }

  public static async runAll(databaseManager: DatabaseManager, pixiv: Pixiv) {
    const logger = Logger.configure('SearchPixiv.runAll')
    const searches = await databaseManager.getSearches()
    for (const search of searches) {
      logger.info(`Running search: ${search.id}`)
      const searchPixiv = new SearchPixiv(databaseManager, pixiv, search)
      await searchPixiv.run()
    }
  }

  private async getIllustSeriesDetail(series: Series | null) {
    if (!series || Array.isArray(series)) {
      return null
    }
    if (await this.databaseManager.isVaildDBSeries('ILLUST', series)) {
      return null
    }
    const response = await this.pixiv.illustSeries({
      illustSeriesId: series.id,
    })
    PixivSaver.execute(response)
    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch illust series detail: ${response.status}`
      )
    }
    return response.data.illust_series_detail
  }

  private async getNovelSeriesDetail(series: Series | unknown[]) {
    if (!series || Array.isArray(series)) {
      return null
    }
    if (await this.databaseManager.isVaildDBSeries('NOVEL', series)) {
      return null
    }
    const response = await this.pixiv.novelSeries({
      seriesId: series.id,
    })
    PixivSaver.execute(response)
    if (response.status !== 200) {
      throw new Error(`Failed to fetch novel series detail: ${response.status}`)
    }
    return response.data.novel_series_detail
  }

  private async searchIllusts(word: string): Promise<PixivIllustItem[]> {
    const response = await this.pixiv.searchIllust({
      word,
    })
    PixivSaver.execute(response)
    if (response.status !== 200) {
      throw new Error(`Failed to search illusts: ${response.status}`)
    }
    return response.data.illusts
  }

  private async searchNovels(word: string): Promise<PixivNovelItem[]> {
    const response = await this.pixiv.searchNovel({
      word,
    })
    PixivSaver.execute(response)
    if (response.status !== 200) {
      throw new Error(`Failed to search novels: ${response.status}`)
    }
    return response.data.novels
  }
}
