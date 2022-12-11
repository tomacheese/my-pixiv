import fs from 'fs'
import { execSync } from 'child_process'
import { NuxtConfig } from '@nuxt/types'

const baseURL =
  process.env.NODE_ENV === 'production' ? '/' : 'http://192.168.0.101:8000/'

execSync(
  'npx npm-license-crawler --dependencies --production --onlyDirectDependencies --omitVersion --json ./src/licenses.json'
)
const licenses = JSON.parse(fs.readFileSync('./src/licenses.json', 'utf8'))

const config: NuxtConfig = {
  srcDir: 'src/',
  ssr: false,

  target: 'static',

  head: {
    titleTemplate: 'my-pixiv',
    title: 'my-pixiv',
    htmlAttrs: {
      lang: 'ja',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      { name: 'apple-mobile-web-app-title', content: 'my-pixiv' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    link: [
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/favicons/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicons/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicons/favicon-16x16.png',
      },
      {
        rel: 'mask-icon',
        href: '/favicons/safari-pinned-tab.svg',
        color: '#ffb41d',
      },
      {
        rel: 'shortcut icon',
        type: 'image/x-icon',
        href: '/favicons/favicon.ico',
      },
    ],
  },

  pwa: {
    manifest: {
      lang: 'ja',
      name: 'my-pixiv',
      short_name: 'my-pixiv',
      description: 'pixiv client for myself.',
      display: 'standalone',
      theme_color: '#0097fa',
      background_color: '#fff',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
    },
  },

  css: ['@/assets/scroll.css'],

  plugins: [
    { src: '@/plugins/settings.ts', ssr: false },
    { src: '@/plugins/websocket.ts', ssr: false },
    { src: '@/plugins/fetcher.ts', ssr: false },
    { src: '@/plugins/workbox.ts', mode: 'client' },
  ],

  components: false,

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/stylelint-module',
    '@nuxtjs/vuetify',
    '@nuxtjs/pwa',
    'nuxt-typed-vuex',
  ],

  modules: ['@nuxtjs/axios'],

  axios: {
    baseURL,
  },

  publicRuntimeConfig: {
    baseURL,
    appVersion: process.env.npm_package_version,
    os: process.platform,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    licenses,
  },

  vuetify: {
    customVariables: [],
    theme: {
      dark: false,
    },
  },

  server: {
    host: '0.0.0.0',
  },

  build: {
    parallel: true,
    cache: true,
    postcss: false,
  },
}
export default config
