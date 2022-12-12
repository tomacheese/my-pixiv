import { TwitterApi } from 'twitter-api-v2'
import { Configuration } from '../config'
import { WebSocket } from 'ws'

export const PATH = {
  TOKEN_FILE: process.env.PIXIVPY_TOKEN_FILE || '/data/token.json',
  CONFIG_FILE: process.env.CONFIG_FILE || '/data/config.json',
  VIEWED_FILE: process.env.VIEWED_FILE || '/data/viewed.json',
  ITEM_MUTES_FILE: process.env.ITEM_MUTES_FILE || '/data/item_mutes.json',
  ILLUST_CACHE_DIR: process.env.ILLUST_CACHE_DIR || '/cache/illusts/',
  MANGA_CACHE_DIR: process.env.MANGA_CACHE_DIR || '/cache/manga/',
  NOVEL_CACHE_DIR: process.env.NOVEL_CACHE_DIR || '/cache/novels/',
  USER_CACHE_DIR: process.env.USER_CACHE_DIR || '/cache/users/',
  IMAGE_CACHE_DIR: process.env.IMAGE_CACHE_DIR || '/cache/images/',
  TWEET_CACHE_DIR: process.env.TWEET_CACHE_DIR || '/cache/tweets/',
  SHADOW_BAN_CACHE_DIR:
    process.env.SHADOW_BAN_CACHE_DIR || '/cache/shadow-ban/',
}

export const websocketClients: {
  [key: string]: WebSocket
} = {}

export function organizeWebsocketClients() {
  const keys = Object.keys(websocketClients)
  for (const key of keys) {
    if (websocketClients[key].readyState === WebSocket.OPEN) {
      continue
    }
    delete websocketClients[key]
  }
}

const twitterCaches: {
  [key: string]: {
    twitterApi: TwitterApi | null
    timestamp: number
  }
} = {}

export async function loadTwitterApi(
  config: Configuration,
  accountName: string | null
) {
  if (!accountName) {
    accountName = 'NO_ACCOUNT'
  }
  // 10分以内に呼ばれたらキャッシュを返す
  const twitterCache = twitterCaches[accountName]
  if (
    twitterCache &&
    twitterCache.twitterApi &&
    twitterCache.timestamp + 10 * 60 * 1000 > Date.now()
  ) {
    return twitterCache.twitterApi
  }

  const account =
    accountName !== 'NO_ACCOUNT' ? config.get('accounts')[accountName] : null
  if (account === undefined) {
    throw new Error(`Account not found: ${accountName}`)
  }
  const twitterApi = new TwitterApi({
    appKey: config.get('consumerKey'),
    appSecret: config.get('consumerSecret'),
    accessToken: account ? account.accessToken : undefined,
    accessSecret: account ? account.accessTokenSecret : undefined,
  })

  twitterCaches[accountName] = {
    twitterApi,
    timestamp: Date.now(),
  }

  return twitterApi
}
