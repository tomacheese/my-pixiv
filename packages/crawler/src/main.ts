import { Pixiv } from '@book000/pixivts'
import { PrismaClient } from 'my-pixiv-db'
import { Configuration } from './config'
import { Logger } from '@book000/node-utils'
import { DatabaseManager } from './lib/database'

async function main() {
  const logger = Logger.configure('main')

  const config = new Configuration()
  config.load()
  if (!config.validate()) {
    logger.error('Configuration validation failed')
    for (const failure of config.getValidateFailures()) {
      logger.error(`- ${failure}`)
    }
    process.exitCode = 1
    return
  }

  const prisma = new PrismaClient()
  const databaseManager = new DatabaseManager(prisma)

  const pixiv = await Pixiv.of(config.get('pixiv').refresh_token)
  const illustRecommendeds = await pixiv.recommendedIllust({
    contentType: 'illust',
  })
  if (!illustRecommendeds.status) {
    logger.error('Failed to fetch recommended illusts')
    return
  }

  for (const illust of illustRecommendeds.data.illusts) {
    logger.info(`Fetching illust: ${illust.id}`)

    await databaseManager.upsertIlust(illust)
  }
}

;(async () => {
  await main()
})()
