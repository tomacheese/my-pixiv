<template>
  <v-icon>icon-pixiv</v-icon>
</template>

<style>
@font-face {
  font-family: icomoon;
  src: url('@/assets/pixiv-logo/font.eot');
  src: url('@/assets/pixiv-logo/font.eot') format('embedded-opentype'),
    url('@/assets/pixiv-logo/font.ttf') format('truetype'),
    url('@/assets/pixiv-logo/font.woff') format('woff'),
    url('@/assets/pixiv-logo/font.svg') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

[class^='icon-'],
[class*=' icon-'] {
  font-family: icomoon, sans-serif !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-pixiv::before {
  content: '\e900';
}
</style>
