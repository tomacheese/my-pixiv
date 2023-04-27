import {
  IllustSeriesDetail,
  NovelSeriesDetail,
  PixivIllustItem,
  PixivNovelItem,
  PixivUser,
  Series,
  Tag,
} from '@book000/pixivts'
import { AiType, IllustType, Prisma, PrismaClient } from 'my-pixiv-db'

export class DatabaseManager {
  private readonly prisma: PrismaClient
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * イラスト情報をデータベースに追加、または更新する
   *
   * @param illust イラスト情報
   * @returns データベースに追加、または更新されたイラスト情報
   */
  public async upsertIlust(
    illust: PixivIllustItem,
    seriesDetail: IllustSeriesDetail | null
  ) {
    const illustMetaImages = illust.meta_single_page
      ? [
          {
            page_id: 1,
            squareMediumUrl: illust.image_urls.square_medium,
            mediumUrl: illust.image_urls.medium,
            largeUrl: illust.image_urls.large,
            originalUrl: illust.image_urls.original,
          },
        ]
      : illust.meta_pages.map((metaPage, index) => ({
          page_id: index + 1,
          squareMediumUrl: metaPage.image_urls.square_medium,
          mediumUrl: metaPage.image_urls.medium,
          largeUrl: metaPage.image_urls.large,
          originalUrl: metaPage.image_urls.original,
        }))
    const illustImages: Prisma.Enumerable<Prisma.IllustImageCreateOrConnectWithoutIllustInput> =
      illustMetaImages.map((illustImage) => ({
        where: {
          illustId_pageId: {
            illustId: illust.id,
            pageId: illustImage.page_id,
          },
        },
        create: {
          pageId: illustImage.page_id,
          squareMediumUrl: illustImage.squareMediumUrl,
          mediumUrl: illustImage.mediumUrl,
          largeUrl: illustImage.largeUrl,
          originalUrl: illustImage.originalUrl,
        },
      }))

    const data = {
      title: illust.title,
      type: this.convertIllustType(illust.type),
      caption: illust.caption,
      pageCount: illust.page_count,
      tags: {
        connectOrCreate: this.getTagConnectOrCreate(illust.tags),
      },
      user: {
        connectOrCreate: this.getUserConnectOrCreate(illust.user),
      },
      series: this.getUpsertSeries(illust.series, seriesDetail),
      aiType: this.convertAiType(illust.illust_ai_type),
      totalBookmarks: illust.total_bookmarks,
      totalComments: illust.total_comments,
      illustImages: {
        connectOrCreate: illustImages,
      },
    }
    return await this.prisma.illust.upsert({
      where: {
        id: illust.id,
      },
      create: {
        id: illust.id,
        ...data,
      },
      update: data,
    })
  }

  public async upsertNovel(
    novel: PixivNovelItem,
    seriesDetail: NovelSeriesDetail | null
  ) {
    const data = {
      title: novel.title,
      caption: novel.caption,
      pageCount: novel.page_count,
      textLength: novel.text_length,
      tags: {
        connectOrCreate: this.getTagConnectOrCreate(novel.tags),
      },
      user: {
        connectOrCreate: this.getUserConnectOrCreate(novel.user),
      },
      series: this.getUpsertSeries(novel.series, seriesDetail),
      aiType: this.convertAiType(novel.novel_ai_type),
      totalBookmarks: novel.total_bookmarks,
      totalComments: novel.total_comments,
    }
    return await this.prisma.novel.upsert({
      where: {
        id: novel.id,
      },
      create: {
        id: novel.id,
        ...data,
      },
      update: data,
    })
  }

  public async getSearches() {
    return await this.prisma.search.findMany()
  }

  public async isVaildDBSeries(type: 'ILLUST' | 'NOVEL', series: Series) {
    const row = await (type === 'ILLUST'
      ? this.prisma.illustSeries.findFirst({
          where: {
            id: series.id,
          },
        })
      : this.prisma.novelSeries.findFirst({
          where: {
            id: series.id,
          },
        }))
    // 7日以上前のデータは無効
    return row
      ? Date.now() - row.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
      : false
  }

  private getUpsertSeries(
    series: Series | unknown[] | null,
    seriesDetail: IllustSeriesDetail | NovelSeriesDetail | null
  ) {
    // series === null: シリーズに属していない (= undefined)
    // series !== null && seriesDetail === null: 7日以内のため、シリーズの詳細情報が存在しない (= connect)
    // series !== null && seriesDetail !== null: 7日以上経過したため、シリーズの詳細情報が存在する (= connectOrCreate)
    if (!series || Array.isArray(series) || Object.keys(series).length === 0) {
      return
    }
    if (seriesDetail === null) {
      return {
        connect: {
          id: series.id,
        },
      }
    }
    return {
      connectOrCreate: this.getSeriesConnectOrCreate(seriesDetail),
    }
  }

  private getUserConnectOrCreate(
    user: PixivUser
  ):
    | Prisma.UserCreateOrConnectWithoutIllustsInput
    | Prisma.UserCreateOrConnectWithoutNovelsInput {
    return {
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        name: user.name,
        account: user.account,
        profileImageUrl: user.profile_image_urls.medium,
      },
    }
  }

  private getSeriesConnectOrCreate(
    seriesDetail: IllustSeriesDetail | NovelSeriesDetail | null
  ):
    | Prisma.IllustSeriesCreateOrConnectWithoutIllustsInput
    | Prisma.NovelSeriesCreateOrConnectWithoutNovelsInput
    | undefined {
    if (!seriesDetail) {
      return undefined
    }
    return {
      where: {
        id: seriesDetail.id,
      },
      create: {
        id: seriesDetail.id,
        name: seriesDetail.title,
        description: seriesDetail.caption,
        user: {
          connectOrCreate: this.getUserConnectOrCreate(seriesDetail.user),
        },
      },
    }
  }

  private getTagConnectOrCreate(
    tags: Tag[]
  ):
    | Prisma.TagCreateOrConnectWithoutIllustsInput[]
    | Prisma.TagCreateOrConnectWithoutNovelsInput[] {
    return tags.map((tag) => ({
      where: {
        name: tag.name,
      },
      create: {
        name: tag.name,
      },
    }))
  }

  private convertAiType(typeNumber: number): AiType {
    switch (typeNumber) {
      case 0: {
        return 'UNUSED'
      }
      case 1: {
        return 'SUPPORT'
      }
      case 2: {
        return 'USED'
      }
    }
    throw new Error(`Unknown AI type: ${typeNumber}`)
  }

  private convertIllustType(type: string): IllustType {
    switch (type) {
      case 'illust': {
        return 'ILLUST'
      }
      case 'manga': {
        return 'MANGA'
      }
      case 'ugoira': {
        return 'UGOIRA'
      }
    }
    throw new Error(`Unknown illust type: ${type}`)
  }
}
