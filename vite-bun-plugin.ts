import { builtinModules } from 'node:module'

export const bunServerPlugin = () => {
  const virtualEntryId = 'virtual:bun-server-entry-module'
  const resolvedVirtualEntryId = '\0' + virtualEntryId

  return {
    name: '@hono/bun-server',
    resolveId(id: string) {
      if (id === virtualEntryId) {
        return resolvedVirtualEntryId
      }
    },
    load(id: string) {
      if (id === resolvedVirtualEntryId) {
        return `import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const worker = new Hono()
worker.use('/static/*', serveStatic({ root: './dist' }))

const modules = glob('/app/server.ts', { import: 'default', eager: true })
for (const [, app] of Object.entries(modules)) {
  if (app) {
    worker.route('/', app)
    worker.notFound(app.notFoundHandler)
  }
}

Bun.serve({
  fetch: worker.fetchHandler,
  port: process.env.PORT || 3000,
  development: process.env.NODE_ENV !== 'production',
  logger: {
    info(req, { statusCode, startTime }) {
      const duration = Date.now() - startTime
      console.log(
        \`\${req.method} \${req.url} \${statusCode} \${duration}ms\`
      )
    },
  },
})
`
      }
    },
    config: () => ({
      build: {
        outDir: './dist',
        emptyOutDir: false,
        minify: process.env.NODE_ENV === 'production',
        ssr: true,
        rollupOptions: {
          external: [...builtinModules, /^node:/],
          input: virtualEntryId,
          output: {
            entryFileNames: 'server.mjs',
          },
        },
      },
    }),
  }
}

export default bunServerPlugin