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
}

export default nextConfig
