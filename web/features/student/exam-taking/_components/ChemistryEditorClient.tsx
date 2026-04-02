'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { StructServiceProvider } from 'ketcher-core'

type KetcherLike = {
  getMolfile: () => Promise<string>
  setMolecule: (value: string) => Promise<void>
}

type ChemistryEditorComponent = React.ComponentType<{
  staticResourcesUrl: string
  structServiceProvider: StructServiceProvider
  errorHandler: (message: string) => void
  disableMacromoleculesEditor?: boolean
  onInit?: (instance: KetcherLike) => void
}>

export function ChemistryEditorClient({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const ketcherRef = useRef<KetcherLike | null>(null)
  const pollRef = useRef<number | null>(null)
  const valueRef = useRef(value)
  const [EditorComponent, setEditorComponent] =
    useState<ChemistryEditorComponent | null>(null)
  const [provider, setProvider] = useState<StructServiceProvider | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    let isMounted = true

    void Promise.all([import('ketcher-react'), import('ketcher-standalone')])
      .then(([reactMod, standaloneMod]) => {
        if (!isMounted) {
          return
        }

        setEditorComponent(() => reactMod.Editor)
        setProvider(new standaloneMod.StandaloneStructServiceProvider())
      })
      .catch((error) => {
        if (!isMounted) {
          return
        }

        setLoadError(
          error instanceof Error ? error.message : 'Ketcher ачааллаж чадсангүй.',
        )
      })

    return () => {
      isMounted = false

      if (pollRef.current) {
        window.clearInterval(pollRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!ketcherRef.current || !value) {
      return
    }

    void ketcherRef.current.setMolecule(value).catch(() => null)
  }, [value])

  if (loadError) {
    return (
      <div className="space-y-3 rounded-xl border border-card-border bg-white p-4">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          placeholder="Molfile/SMILES утгаа энд оруулна уу..."
          className="w-full rounded-lg border border-input-border px-4 py-3 text-[14px] focus:outline-none"
        />
        <div className="text-[12px] text-red-500">{loadError}</div>
      </div>
    )
  }

  if (!EditorComponent || !provider) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-card-border bg-white text-[14px] text-text-secondary">
        Chemistry editor ачааллаж байна...
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-card-border bg-white">
      <div className="h-[420px]">
        <EditorComponent
          staticResourcesUrl="/"
          structServiceProvider={provider}
          errorHandler={(message: string) => setLoadError(message)}
          disableMacromoleculesEditor
          onInit={(instance: KetcherLike) => {
            ketcherRef.current = instance

            if (value) {
              void instance.setMolecule(value).catch(() => null)
            }

            if (pollRef.current) {
              window.clearInterval(pollRef.current)
            }

            pollRef.current = window.setInterval(() => {
              if (!ketcherRef.current) {
                return
              }

              void ketcherRef.current
                .getMolfile()
                .then((nextValue) => {
                  if (nextValue && nextValue !== valueRef.current) {
                    onChange(nextValue)
                  }
                })
                .catch(() => null)
            }, 1200)
          }}
        />
      </div>
    </div>
  )
}
