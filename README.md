# my-pixiv

pixiv client for myself.

## Feature

- おすすめイラストや小説を一覧表示
- 検索ワードを複数登録して一括検索
- **[プログレッシブウェブアプリ (PWA)](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)に対応**: アプリとしてスマートフォンやタブレットにインストール可能
- **あとで見る機能**: 時間がなかったり一人の時に見たいイラストや小説をあとで見るために保存しておける
- **グローバルフィルタ機能**: 苦手なワードが含まれたイラストや小説をどの検索でも非表示
- **アイテムミュート機能**: 苦手な作品をおすすめや一括検索で表示しない
- **既読管理機能**: 一度閲覧したイラストや小説は次回検索時には表示しない
- 設定情報は [ローカルストレージ](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage) に保存。JSON ファイルでのインポート・エクスポートと他端末との同期が可能
- 既読情報など一部のデータは接続中の他の端末とリアルタイムで共有可能
- パスワードによる認証機構を実装
- pixiv や Twitter の URL scheme を利用してイラストなどを公式アプリで簡単に閲覧

## Installation

このプロジェクト（クライアント）を利用するためには、有効な [pixiv](https://www.pixiv.net) アカウントのリフレッシュトークンが必要です。  
[Twitter](https://twitter.com) に関連する機能を利用する場合は、Twitter API v1.1 が利用できる各種トークンが必要です。

### pixiv

「おすすめ」の取得、各種検索処理、イラストの「ブックマーク」登録に pixiv アカウントを利用します。

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

以下の JSON の該当部分を置き換えた上で、 `data/config.json` に書き込んでください。

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

### Boot

`docker-compose.yml` に以下を書き込みます。

```yaml
version: '3.8'
services:
  view:
    image: ghcr.io/tomacheese/my-pixiv:latest
    volumes:
      - type: bind
        source: ./data
        target: /data/
    ports:
      - 8080:80
    init: true
    restart: always

  api:
    image: ghcr.io/tomacheese/my-pixiv-api:latest
    volumes:
      - type: bind
        source: ./data
        target: /data/
    init: true
    restart: always
```

`docker-compose up --build -d` で起動し、`http://localhost:8080` でアクセスできます。

## Development

### Directory structure

このプロジェクトは、Nuxt.js フレームワークを用いたフロントエンドパッケージと Fastify フレームワークを用いたバックエンドパッケージ 、共通の型定義や関数などをまとめたパッケージの 3 つで構成されています。それぞれのパッケージ名およびディレクトリは以下の通りです。

- my-pixiv ([view](./view/)): フロントエンド (Nuxt.js)
- my-pixiv-api ([api](./api/)): バックエンド (Fastify)
- my-pixiv-types ([types](./types/)): 共通の型定義および関数

これらを [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) を用いて monorepo プロジェクトとしています。

## Routing

フロントエンドとバックエンドは異なるプロジェクトとして動作しています。しかし、インターネットに露出するポートは一つのみにしたいという理由から、nginx を用いて以下のようにルーティングしています。

- フロントエンド: SPA としてビルド、成果物をルートに配置
- バックエンド: Fastify を用いてホスティングし、nginx から `/api/` ディレクトリにルーティング

## Scripts

開発時はフロントエンドとバックエンドのそれぞれを独立して動作することをオススメします。以下のコマンドで起動できます。

- クライアント (フロントエンド): `.\scripts\client-dev.ps1`
- サーバ (バックエンド): `.\scripts\server-dev.ps1`

この方法で起動した場合、フロントエンドは [0.0.0.0:3000](http://localhost:3000) 、バックエンドは [0.0.0.0:8000](http://localhost:8000) でホストされます。

その他、開発用のスクリプトをいくつか `scripts` ディレクトリに配置しています。

## License

このプロジェクトのライセンスは [MIT License](LICENSE) です。

## Disclaimer

このプロジェクトを使用したことによって引き起こされた問題に関して開発者は一切の責任を負いません。

The developer is not responsible for any problems caused by the user using this project.
