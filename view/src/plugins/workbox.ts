import { Plugin } from '@nuxt/types'

interface WorkboxStatus {
  isUpdate: boolean | null
}

const workboxStatus: WorkboxStatus = {
  // eslint-disable-next-line unicorn/no-null
  isUpdate: null,
}

// See https://typescript.nuxtjs.org/cookbook/plugins/

declare module 'vue/types/vue' {
  // this.$workboxStatus inside Vue components
  interface Vue {
    $workboxStatus: WorkboxStatus
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$workboxStatus inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $workboxStatus: WorkboxStatus
  }
  // nuxtContext.$workboxStatus
  interface Context {
    $workboxStatus: WorkboxStatus
  }
}

const workboxPlugin: Plugin = async (_, inject) => {
  const workbox = await (window as any).$workbox

  if (!workbox) {
    console.warn("Workbox couldn't be loaded.")
    return
  }

  workbox.addEventListener(
    'installed',
    (event: { isUpdate: boolean | null }) => {
      workboxStatus.isUpdate = event.isUpdate
      inject('workboxStatus', workboxStatus)
    }
  )
  inject('workboxStatus', workboxStatus)
}

export default workboxPlugin
