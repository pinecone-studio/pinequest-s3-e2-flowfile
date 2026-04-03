import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  experimental: {
    proxyClientMaxBodySize: '100mb',
  },
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      paper$: path.join(__dirname, 'node_modules/paper/dist/paper-core.js'),
      canvas: false,
      jsdom: false,
      'jsdom/lib/jsdom/living/generated/utils': false,
      'paper/dist/node/canvas.js': false,
      'paper/dist/node/extend.js': false,
      'paper/dist/node/self.js': false,
      'source-map-support': false,
    }

    return config
  },
}

export default nextConfig
