import { NuxtConfig } from '@nuxt/types'

const baseURL =
  process.env.NODE_ENV === 'production' ? '/' : 'http://192.168.0.101:8000/'

const config: NuxtConfig = {
  srcDir: 'src/',
  ssr: false,

  target: 'static',

  head: {
    titleTemplate: '%s - my-pixiv',
    title: 'my-pixiv',
    htmlAttrs: {
      lang: 'ja',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  css: [],

  plugins: [
    { src: '@/plugins/settings', ssr: false },
    { src: '@/plugins/fetcher', ssr: false },
  ],

  components: true,

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/stylelint-module',
    '@nuxtjs/vuetify',
    'nuxt-typed-vuex',
  ],

  modules: ['@nuxtjs/axios'],

  axios: {
    baseURL,
  },

  publicRuntimeConfig: {
    baseURL,
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

  build: {},
}
export default config
