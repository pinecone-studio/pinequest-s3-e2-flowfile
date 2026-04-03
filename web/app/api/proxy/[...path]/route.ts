import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function buildUpstreamUrl(request: NextRequest, pathSegments: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.')
  }

  const upstreamUrl = new URL(baseUrl)
  const normalizedPath = pathSegments.join('/')
  upstreamUrl.pathname = `${upstreamUrl.pathname.replace(/\/$/, '')}/${normalizedPath}`.replace(
    /\/{2,}/g,
    '/',
  )
  upstreamUrl.search = new URL(request.url).search

  return upstreamUrl
}

function buildUpstreamHeaders(request: NextRequest) {
  const headers = new Headers()

  request.headers.forEach((value, key) => {
    if (key === 'host' || key === 'content-length') {
      return
    }

    headers.set(key, value)
  })

  return headers
}

async function forwardRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  const upstreamUrl = buildUpstreamUrl(request, path)
  const method = request.method.toUpperCase()
  const body =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : await request.arrayBuffer().then((buffer) =>
          buffer.byteLength > 0 ? buffer : undefined,
        )

  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers: buildUpstreamHeaders(request),
    body,
    cache: 'no-store',
  })

  const responseHeaders = new Headers(upstreamResponse.headers)
  responseHeaders.delete('content-length')

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context)
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context)
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context)
}
