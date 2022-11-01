/**
 * 作品の画像URL群
 *
 * 単一画像の場合、オリジナル画像へは MetaSinglePage.original_image_url から取得
 *
 * 画像へのアクセスは適切なリファラを付与する必要がある
 */
export interface ImageUrls {
  /** 360x360 */
  square_medium: string
  /** 長辺が最大 540px */
  medium: string
  /** 横幅が最大 600px, 縦幅が最大 1200px */
  large: string
  /**
   * オリジナル画像
   *
   * MetaPages.image_urls の場合のみ存在？
   */
  original?: string
}

/**
 * プロフィール画像URL群
 */
export interface ProfileImageUrls {
  medium: string
}

/**
 * ユーザー情報
 */
export interface User {
  /** ユーザー内部 ID */
  id: number

  /** ユーザー名 */
  name: string

  /** pixiv ID (URLに使用) */
  account: string

  /** プロフィール画像URL群 */
  profile_image_urls: ProfileImageUrls

  /** フォローしているかどうか */
  is_followed: boolean
}

/**
 * タグ情報
 */
export interface Tag {
  /** タグ名 */
  name: string

  /** 翻訳済みタグ名 */
  translated_name: null | string
}

/**
 * シリーズ情報
 */
export interface Series {
  /** シリーズ ID */
  id: number

  /** シリーズ名 */
  title: string
}

/** 単一イラスト詳細情報 */
export interface MetaSinglePage {
  /** オリジナル画像URL */
  original_image_url: string
}

/** 複数イラスト詳細情報 */
export interface MetaPages {
  /** 画像URL群 */
  image_urls: ImageUrls
}

export interface PixivIllustItem {
  /**
   * 作品 ID
   *
   * イラスト・小説それぞれでIDの振り方が異なり、重複するので注意。
   */
  id: number

  /**
   * 作品タイトル
   */
  title: string

  /**
   * 作品種別
   *
   * illust: イラスト
   * manga: マンガ
   */
  type: string

  /**
   * 作品の画像URL群
   *
   * イラスト・マンガの場合は1枚目の画像が入っている。
   * 2枚目以降の画像は `meta_pages` に入っている。
   */
  image_urls: ImageUrls

  /**
   * キャプション（説明文）
   */
  caption: string

  /**
   * 公開範囲
   *
   * 詳細不明。0 が公開なのは確定
   */
  restrict: number

  /**
   * 作品投稿者情報
   */
  user: User

  /**
   * 作品タグ
   */
  tags: Tag[]

  /**
   * 使用ツール
   *
   * SAI, CLIP STUDIO PAINT など。投稿者は最大3つまで登録できる。選択式。
   */
  tools: string[]

  /**
   * 投稿日時
   *
   * ISO 8601 形式。YYYY-MM-DD'T'HH:mm:ss+09:00
   */
  create_date: string

  /**
   * ページ数
   */
  page_count: number

  /** 画像の横幅 */
  width: number

  /** 画像の縦幅 */
  height: number

  /**
   * 正気度? (表現内容設定？)
   *
   * 詳細不明。2, 4, 6 をとりうる。2 は全年齢、6 は R-18？
   */
  sanity_level: number

  /**
   * 年齢制限
   *
   * 0 が全年齢、1 が R-18、2 が R-18G
   */
  x_restrict: number

  /**
   * シリーズ情報
   *
   * イラスト・マンガの場合、シリーズに属していない場合 null が入っている。
   */
  series: Series | null

  /**
   * 単一イラスト詳細情報
   *
   * 単一ページの場合のみ利用。複数ページの場合は `meta_pages` を利用する。
   * 複数ページの場合、このプロパティには {} が入っている。
   */
  meta_single_page: MetaSinglePage | unknown[]

  /**
   * 複数イラスト詳細情報
   *
   * 複数ページの場合のみ利用。単一ページの場合は `meta_single_page` を利用する。
   * 複数ページの場合、このプロパティには [] が入っている。
   */
  meta_pages: MetaPages[]

  /**
   * 閲覧数
   */
  total_view: number

  /**
   * ブックマーク数
   */
  total_bookmarks: number

  /**
   * ブックマークしているかどうか
   */
  is_bookmarked: boolean

  /**
   * 閲覧可能かどうか
   */
  visible: boolean

  /**
   * この作品をミュートしているかどうか
   */
  is_muted: boolean

  /**
   * AI使用フラグ
   *
   * 0: 未使用
   * 1: 補助的に使用
   * 2: 使用
   *
   * 2022/11/02時点で投稿画面に「補助的に使用」を選択できるUIは存在しないように見えるが、実際に 1 が入っている作品はある。
   *
   * @see https://www.pixiv.help/hc/ja/articles/11866194231577
   * @see https://github.com/ArkoClub/async-pixiv/blob/fa45c81093a5c6f4eabfcc942915fc479e42174f/src/async_pixiv/model/other.py#L40-L48
   */
  illust_ai_type: number
}
