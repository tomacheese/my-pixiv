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
import { Franc } from './lib/franc'

export interface LanguageScore {
  language: string
  score: number
}

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
    const logger = Logger.configure('SearchPixiv.run')
    logger.info(`Running search: ${this.search.id}`)

    const limit = this.search.limit

    const word = this.search.include_tags.join(' ')
    logger.info(`Searching illusts for: ${word} (Limit: ${limit})`)
    const illusts = await this.searchIllusts(word, limit)
    logger.info(`Found ${illusts.length} illusts`)
    for (const illustNumber in illusts) {
      const illust = illusts[illustNumber]
      const illustRow = await this.databaseManager.upsertIlust(
        illust,
        await this.getIllustSeriesDetail(illust.series)
      )
      await this.databaseManager.addIllustSearchResult(this.search, illustRow)
      if (Number(illustNumber) % 10 === 0) {
        logger.info(`... ${illustNumber} / ${illusts.length}`)
      }
    }

    logger.info(`Searching novels for: ${word} (Limit: ${limit})`)
    const novels = await this.searchNovels(word, limit)
    logger.info(`Found ${novels.length} novels`)
    for (const novelNumber in novels) {
      const novel = novels[novelNumber]
      const novelRow = await this.databaseManager.upsertNovel(
        novel,
        await this.getNovelSeriesDetail(novel.series),
        await this.getNovelLanguageScores(novel)
      )
      await this.databaseManager.addNovelSearchResult(this.search, novelRow)
      if (Number(novelNumber) % 10 === 0) {
        logger.info(`... ${novelNumber} / ${novels.length}`)
      }
    }

    logger.info(`Finished search: ${this.search.id}`)
  }

  public static async runAll(databaseManager: DatabaseManager, pixiv: Pixiv) {
    const searches = await databaseManager.getSearches()
    for (const search of searches) {
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

  private async searchIllusts(
    word: string,
    limit: number
  ): Promise<PixivIllustItem[]> {
    const results = []
    let offset = 0
    while (true) {
      const response = await this.pixiv.searchIllust({
        word,
        offset,
      })
      PixivSaver.execute(response)
      if (response.status !== 200) {
        throw new Error(`Failed to search illusts: ${response.status}`)
      }
      const illusts = response.data.illusts
      if (illusts.length === 0) {
        break
      }
      results.push(...illusts)
      offset += illusts.length
      if (offset >= limit) {
        break
      }
    }
    return results
  }

  private async searchNovels(
    word: string,
    limit: number
  ): Promise<PixivNovelItem[]> {
    const results = []
    let offset = 0
    while (true) {
      const response = await this.pixiv.searchNovel({
        word,
      })
      PixivSaver.execute(response)
      if (response.status !== 200) {
        throw new Error(`Failed to search novels: ${response.status}`)
      }
      const novels = response.data.novels
      if (novels.length === 0) {
        break
      }
      results.push(...novels)
      offset += novels.length
      if (offset >= limit) {
        break
      }
    }
    return results
  }

  private async getNovelLanguageScores(
    novel: PixivNovelItem
  ): Promise<LanguageScore[]> {
    const franc = new Franc()
    const results: {
      [key: string]: number
    } = {}
    const response = await this.pixiv.novelText({
      novelId: novel.id,
    })
    PixivSaver.execute(response)
    if (response.status !== 200) {
      throw new Error(`Failed to fetch novel text: ${response.status}`)
    }
    const lines = response.data.novel_text.split('\n').filter((line) => !!line)
    for (const rowNumber in lines) {
      const line = lines[rowNumber]
      const language = await franc.run(line)
      const count = results[language] || 0
      results[language] = count + 1
    }
    franc.destroy()

    const scores: LanguageScore[] = []
    const total = Object.values(results).reduce((a, b) => a + b, 0)
    for (const [language, count] of Object.entries(results)) {
      scores.push({
        language,
        score: count / total,
      })
    }
    return scores
  }
}
