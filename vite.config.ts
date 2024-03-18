import honox from 'honox/vite'
import client from 'honox/vite/client'
import { defineConfig } from 'vite'
import bunServerPlugin from './vite-bun-plugin'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [client()],
    }
  } else {
    return {
      plugins: [
        honox(),
        bunServerPlugin()
      ],
    }
  }
})