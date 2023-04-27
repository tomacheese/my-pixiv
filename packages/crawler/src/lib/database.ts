import { PixivIllustItem } from '@book000/pixivts'
import { AiType, IllustType, Prisma, PrismaClient } from 'my-pixiv-db'

export class DatabaseManager {
  private readonly prisma: PrismaClient
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * name
   */
  public async upsertIlust(illust: PixivIllustItem) {
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
    await this.prisma.illust.upsert({
      where: {
        id: illust.id,
      },
      create: {
        id: illust.id,
        title: illust.title,
        type: this.convertIllustType(illust.type),
        caption: illust.caption,
        pageCount: illust.page_count,
        aiType: this.convertAiType(illust.illust_ai_type),
        totalBookmarks: illust.total_bookmarks,
        totalComments: illust.total_comments,
        tags: {
          connectOrCreate: illust.tags.map((tag) => ({
            where: {
              name: tag.name,
            },
            create: {
              name: tag.name,
            },
          })),
        },
        user: {
          connectOrCreate: {
            where: {
              id: illust.user.id,
            },
            create: {
              id: illust.user.id,
              name: illust.user.name,
              account: illust.user.account,
              profileImageUrl: illust.user.profile_image_urls.medium,
            },
          },
        },
        illustImages: {
          connectOrCreate: illustImages,
        },
      },
      update: {
        title: illust.title,
        type: this.convertIllustType(illust.type),
        caption: illust.caption,
        pageCount: illust.page_count,
        aiType: this.convertAiType(illust.illust_ai_type),
        totalBookmarks: illust.total_bookmarks,
        totalComments: illust.total_comments,
        tags: {
          connectOrCreate: illust.tags.map((tag) => ({
            where: {
              name: tag.name,
            },
            create: {
              name: tag.name,
            },
          })),
        },
        user: {
          connectOrCreate: {
            where: {
              id: illust.user.id,
            },
            create: {
              id: illust.user.id,
              name: illust.user.name,
              account: illust.user.account,
              profileImageUrl: illust.user.profile_image_urls.medium,
            },
          },
        },
        illustImages: {
          connectOrCreate: illustImages,
        },
      },
    })
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
