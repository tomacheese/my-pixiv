import { ConfigFramework } from '@book000/node-utils'

interface MyPixivConfiguration {
  pixiv: {
    refresh_token: string
  }
}

export class Configuration extends ConfigFramework<MyPixivConfiguration> {
  protected validates(): { [key: string]: (config: MyPixivConfiguration) => boolean } {
    return {
      'pixiv is required': config => config.pixiv !== undefined,
      'pixiv.refresh_token is vaild': config => config.pixiv.refresh_token.length > 0,
    }
  }
}