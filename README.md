# my-pixiv

pixiv client for myself.

## Installation

このプロジェクト（クライアント）を利用するためには、有効な [pixiv](https://www.pixiv.net) アカウントとリフレッシュトークンが必須です。

### pixiv

「おすすめ」の取得、検索処理、イラストの「ブックマーク」登録に pixiv アカウントを利用します。

[Retrieving Auth Token (with Selenium)](https://gist.github.com/upbit/6edda27cb1644e94183291109b8a5fde) などを参考にリフレッシュトークンを取得してください。

その後、以下の形式で `data/token.json` にリフレッシュトークン(`<REFRESH-TOKEN>`)を設定してください。

```json
{
  "refresh_token": "<REFRESH-TOKEN>"
}
```

### Twitter

イラストから取得できるツイートの「いいね」に最大 2 つの Twitter アカウントを利用できます。この機能を利用しない場合は設定する必要はありません。

Twitter API v1.1 が利用できる以下 4 つのキーが必要です。

- Consumer Key (API Key): `<CONSUMER-KEY>`
- Consumer Secret (API Secret): `<CONSUMER-SECRET>`
- メインアカウント
  - Access Token: `<MAIN-ACCOUNT-ACCESS-TOKEN>`
  - Access Token Secret: `<MAIN-ACCOUNT-ACCESS-TOKEN-SECRET>`
- サブアカウント (任意)
  - Access Token: `<SUB-ACCOUNT-ACCESS-TOKEN>`
  - Access Token Secret: `<SUB-ACCOUNT-ACCESS-TOKEN-SECRET>`

```json
{
  "consumer_key": "<CONSUMER-KEY>",
  "consumer_secret": "<CONSUMER-SECRET>",
  "accounts": {
    "main": {
      "access_token": "<MAIN-ACCOUNT-ACCESS-TOKEN>",
      "access_token_secret": "<MAIN-ACCOUNT-ACCESS-TOKEN-SECRET>"
    },
    "sub": {
      "access_token": "<SUB-ACCOUNT-ACCESS-TOKEN>",
      "access_token_secret": "<SUB-ACCOUNT-ACCESS-TOKEN-SECRET>"
    }
  }
}
```

## Development

このプロジェクトはフロントエンドの SPA モードの Nuxt.js プロジェクトと Python3 FastAPI プロジェクトで動作しています。  
Docker で動作する場合、Nuxt.js プロジェクトからビルドした成果物をルートにマウントし、API エンドポイントを `/api/` 以下に設定しています。

開発時、ホットリロードのためにそれぞれ独立として動作することをオススメします。以下のコマンドで起動できます。

- クライアント (フロントエンド): `.\scripts\client-dev.ps1`
- サーバ (バックエンド): `.\scripts\server-dev.ps1`

この方法で起動した場合、フロントエンドは [0.0.0.0:3000](http://localhost:3000) 、バックエンドは [0.0.0.0:8000](http://localhost:8000) でホストされます。

## Disclaimer

このプロジェクトを使用したことによって引き起こされた問題に関して開発者は一切の責任を負いません。

The developer is not responsible for any problems caused by the user using this project.
