// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: 'Exploration 3D du système solaire',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { hid: 'description', name: 'description', content: "Une application web 3D du système solaire avec ses planètes, leurs orbites, leurs lunes ainsi que la ceinture d'astéroïdes et de Kuiper." },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/logo4000x4000.png' },
      ],
      htmlAttrs: {
        lang: 'fr'
      },
    },
    baseURL: process.env.NODE_ENV === 'production' ? '/3D-solar-system-nuxt-three.js/' : '/',
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
