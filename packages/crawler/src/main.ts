import { Pixiv } from '@book000/pixivts'
import { AiType, IllustType, PrismaClient } from 'my-pixiv-db'
import { Configuration } from './config'
import { Logger } from '@book000/node-utils'

function convertAiType(typeNumber: number): AiType {
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

function convertIllustType(type: string): IllustType {
  switch (type) {
    case 'illust': {
      return 'ILLUST'
    }
    case 'manga': {
      return 'MANGA'
    }
  }
  throw new Error(`Unknown illust type: ${type}`)
}

async function main() {
  const logger = Logger.configure('main')

  const config = new Configuration()
  config.load()
  if (!config.validate()) {
    logger.error('Configuration validation failed')
    for (const failure of config.getValidateFailures()) {
      logger.error(`- ${failure}`)
    }
    return
  }

  const prisma = new PrismaClient()

  const pixiv = await Pixiv.of(config.get('pixiv').refresh_token)
  const illustRecommendeds = await pixiv.recommendedIllust({
    contentType: 'illust',
  })
  if (!illustRecommendeds.status) {
    logger.error('Failed to fetch recommended illusts')
    return
  }

  for (const illust of illustRecommendeds.data.illusts) {
    const illustSingleImages = illust.meta_single_page ? [
      {
        page_id: 1,
        squareMediumUrl: illust.image_urls.square_medium,
        mediumUrl: illust.image_urls.medium,
        largeUrl: illust.image_urls.large,
        originalUrl: illust.image_urls.original,
      },
    ] : []
    const illustMetaImages = illust.meta_pages.map((metaPage, index) => ({
        page_id: index + 2, // indexは0から始まる。1はカバー画像
        squareMediumUrl: metaPage.image_urls.square_medium,
        mediumUrl: metaPage.image_urls.medium,
        largeUrl: metaPage.image_urls.large,
        originalUrl: metaPage.image_urls.original,
    }))
    const illustImages = [...illustSingleImages, ...illustMetaImages]
    prisma.illust.create({
      data: {
        id: illust.id,
        title: illust.title,
        type: convertIllustType(illust.type),
        caption: illust.caption,
        pageCount: illust.page_count,
        aiType: convertAiType(illust.illust_ai_type),
        totalBookmarks: illust.total_bookmarks,
        totalComments: illust.total_comments,
        tags: {
          connectOrCreate: illust.tags.map(tag => ({
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

  // eslint-disable-next-line no-console
  console.log(illustRecommendeds)
}

;(async () => {
  await main()
})()
