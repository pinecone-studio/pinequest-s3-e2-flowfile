'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Editor } from 'ketcher-react'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import type { Ketcher } from 'ketcher-core'

const MOLFILE_MARKERS = ['M  END', 'V2000', 'V3000', '$RXN']

export function ChemistryEditorClient({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const ketcherRef = useRef<Ketcher | null>(null)
  const isApplyingExternalValueRef = useRef(false)
  const latestValueRef = useRef(value)
  const changeTimeoutRef = useRef<number | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)

  const structServiceProvider = useMemo(
    () => new StandaloneStructServiceProvider(),
    [],
  )

  useEffect(() => {
    latestValueRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        window.clearTimeout(changeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const ketcher = ketcherRef.current

    if (!ketcher || !isReady || !value.trim()) {
      return
    }

    if (!MOLFILE_MARKERS.some((marker) => value.includes(marker))) {
      return
    }

    isApplyingExternalValueRef.current = true
    ketcher
      .setMolecule(value)
      .catch(() => {
        setEditorError(
          'Өмнө хадгалсан chemistry хариултыг бүтцээр нь нээж чадсангүй.',
        )
      })
      .finally(() => {
        window.setTimeout(() => {
          isApplyingExternalValueRef.current = false
        }, 0)
      })
  }, [isReady, value])

  const handleInit = (ketcher: Ketcher) => {
    ketcherRef.current = ketcher
    setIsReady(true)
    setEditorError(null)

    if (latestValueRef.current.trim()) {
      void ketcher.setMolecule(latestValueRef.current).catch(() => {
        setEditorError(
          'Энэ chemistry хариулт legacy text форматтай тул хоосон canvas-оос зурж эхэлнэ.',
        )
      })
    }

    const handleStructureChange = () => {
      if (isApplyingExternalValueRef.current) {
        return
      }

      if (changeTimeoutRef.current) {
        window.clearTimeout(changeTimeoutRef.current)
      }

      changeTimeoutRef.current = window.setTimeout(() => {
        void ketcher
          .getMolfile()
          .then((molfile) => {
            if (molfile && molfile !== latestValueRef.current) {
              onChange(molfile)
            }
          })
          .catch(() => {
            setEditorError('Chemistry бүтцийг хадгалах явцад алдаа гарлаа.')
          })
      }, 250)
    }

    ketcher.changeEvent.add(handleStructureChange)
  }

  return (
    <div className="space-y-3 rounded-xl border border-card-border bg-white p-4">
      <div className="rounded-2xl bg-[#EEF7F1] px-4 py-3">
        <div className="text-[13px] font-semibold text-foreground">
          Ketcher chemistry editor
        </div>
        <div className="text-[12px] text-text-secondary">
          Молекул, урвалын бүтэц зурж хариултаа автоматаар хадгална.
        </div>
      </div>

      {editorError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
          {editorError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-card-border">
        <div className="h-[520px] bg-white">
          <Editor
            staticResourcesUrl="/"
            structServiceProvider={structServiceProvider}
            onInit={handleInit}
            errorHandler={(message) => setEditorError(message)}
            disableMacromoleculesEditor
          />
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-[#F7F9FC] px-4 py-3 text-[12px] text-text-secondary">
        Хэрэв QR эсвэл refresh хийсний дараа өмнөх бүтэц ачаалвал үргэлжлүүлэн
        засварлаж болно.
      </div>
    </div>
  )
}
