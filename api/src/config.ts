import fs from 'node:fs'

interface Account {
  accessToken: string
  accessTokenSecret: string
}

interface Config {
  consumerKey: string
  consumerSecret: string
  accounts: { [key: string]: Account }
  password?: string
}

/**
 * 設定
 */
export class Configuration {
  private filepath: string
  private config!: Config

  constructor(filepath: string) {
    this.filepath = filepath

    this.load()
  }

  /**
   * 設定ファイルを読み込む
   */
  public load() {
    if (!fs.existsSync(this.filepath)) {
      throw new Error(`Config file not found: ${this.filepath}`)
    }
    const content = fs.readFileSync(this.filepath, 'utf8')
    const json = JSON.parse(content)
    if (!json) {
      throw new Error(`Config file is not valid JSON: ${this.filepath}`)
    }
    const accounts = Object.entries(json.accounts).reduce(
      (acc, [key, value]) => {
        acc[key] = {
          accessToken: (value as any).access_token,
          accessTokenSecret: (value as any).access_token_secret,
        }
        return acc
      },
      {} as { [key: string]: Account }
    )
    this.config = {
      consumerKey: json.consumer_key,
      consumerSecret: json.consumer_secret,
      accounts,
      password: json.password,
    }
  }

  /**
   * 設定値を取得する
   *
   * @param key キー
   * @returns 設定値
   */
  public get<T extends keyof Config>(key: T): Config[T] {
    return this.config[key]
  }
}
