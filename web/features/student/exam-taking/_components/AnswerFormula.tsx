'use client'

import { createElement, useEffect, useMemo, useRef } from 'react'

type MathFieldElementLike = HTMLElement & {
  value?: string
  mathVirtualKeyboardPolicy?: string
}

export function AnswerFormula({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const fieldRef = useRef<MathFieldElementLike | null>(null)

  useEffect(() => {
    void import('mathlive').catch(() => null)
  }, [])

  useEffect(() => {
    if (!fieldRef.current) {
      return
    }

    if ((fieldRef.current.value ?? '') !== value) {
      fieldRef.current.value = value
    }
  }, [value])

  const mathField = useMemo(
    () =>
      createElement('math-field', {
        ref: (node: MathFieldElementLike | null) => {
          fieldRef.current = node

          if (node) {
            node.mathVirtualKeyboardPolicy = 'auto'
            node.value = value
          }
        },
        onInput: (event: Event) => {
          const target = event.currentTarget as MathFieldElementLike
          onChange(target.value ?? '')
        },
        onFocus: () => {
          const keyboard = (window as Window & {
            mathVirtualKeyboard?: { show: (options?: unknown) => void }
          }).mathVirtualKeyboard

          keyboard?.show()
        },
        className:
          'block min-h-[72px] w-full rounded-xl border border-input-border bg-white px-4 py-3 text-[18px] focus:outline-none',
      }),
    [onChange, value],
  )

  return <div className="rounded-xl border border-card-border bg-white p-4">{mathField}</div>
}
