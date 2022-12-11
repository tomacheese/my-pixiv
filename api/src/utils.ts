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
