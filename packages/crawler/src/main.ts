import { Pixiv } from '@book000/pixivts'
import { PrismaClient } from 'my-pixiv-db'
import { Configuration } from './config'
import { Logger } from '@book000/node-utils'
import { DatabaseManager } from './lib/database'
import { SearchPixiv } from './features/search-pixiv'

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
  await SearchPixiv.runAll(databaseManager, pixiv)

  await prisma.$disconnect()
}

;(async () => {
  await main()
})()
