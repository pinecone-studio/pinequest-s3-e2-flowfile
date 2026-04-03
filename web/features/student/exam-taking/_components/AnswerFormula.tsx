'use client'

import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, KeyboardOff } from 'lucide-react'

type VirtualKeyboardLike = {
  show: (options?: { animate?: boolean }) => void
  hide: (options?: { animate?: boolean }) => void
  visible: boolean
  layouts?: readonly string[] | string[]
  alphabeticLayout?: string
  editToolbar?: 'none' | string
  addEventListener?: (name: string, handler: EventListener) => void
  removeEventListener?: (name: string, handler: EventListener) => void
}

type MathFieldElementLike = HTMLElement & {
  value?: string
  defaultMode?: 'inline-math' | 'math' | 'text'
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
  const [keyboardOpen, setKeyboardOpen] = useState(false)

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

  useEffect(() => {
    const keyboard = (window as unknown as { mathVirtualKeyboard?: VirtualKeyboardLike }).mathVirtualKeyboard

    if (!keyboard) {
      return
    }

    keyboard.layouts = ['numeric', 'symbols', 'alphabetic', 'greek']
    keyboard.alphabeticLayout = 'qwerty'
    keyboard.editToolbar = 'none'

    const syncVisibility = () => {
      setKeyboardOpen(Boolean(keyboard.visible))
    }

    syncVisibility()
    keyboard.addEventListener?.('virtual-keyboard-toggle', syncVisibility as EventListener)

    return () => {
      keyboard.removeEventListener?.('virtual-keyboard-toggle', syncVisibility as EventListener)
    }
  }, [])

  const toggleKeyboard = () => {
    const keyboard = (window as unknown as { mathVirtualKeyboard?: VirtualKeyboardLike }).mathVirtualKeyboard

    if (!keyboard) {
      return
    }

    if (keyboard.visible) {
      keyboard.hide({ animate: true })
    } else {
      keyboard.show({ animate: true })
    }
  }

  const mathField = useMemo(
    () =>
      createElement('math-field', {
        ref: (node: MathFieldElementLike | null) => {
          fieldRef.current = node

          if (node) {
            node.defaultMode = 'math'
            node.mathVirtualKeyboardPolicy = window.matchMedia('(max-width: 768px)').matches ? 'manual' : 'auto'
            node.value = value
          }
        },
        onInput: (event: Event) => {
          const target = event.currentTarget as MathFieldElementLike
          onChange(target.value ?? '')
        },
        onFocus: () => {
          const keyboard = (window as unknown as { mathVirtualKeyboard?: VirtualKeyboardLike }).mathVirtualKeyboard
          keyboard?.show({ animate: true })
        },
        className:
          'block min-h-[88px] w-full rounded-2xl border border-input-border bg-white px-4 py-4 text-[18px] md:min-h-[96px] md:text-[22px] focus:outline-none',
      }),
    [onChange, value],
  )

  const KeyboardIcon = keyboardOpen ? KeyboardOff : Keyboard

  return (
    <div className="rounded-2xl border border-card-border bg-white p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-[#EEF5FF] px-3 py-2">
        <div>
          <div className="text-[13px] font-semibold text-foreground">MathLive хариулт</div>
          <div className="text-[12px] text-text-secondary">Mobile дээр Photomath-той төстэй virtual keyboard доороос гарна.</div>
        </div>
        <button
          type="button"
          onClick={toggleKeyboard}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[12px] font-medium text-primary shadow-sm"
        >
          <KeyboardIcon size={14} strokeWidth={1.7} />
          {keyboardOpen ? 'Keyboard нуух' : 'Keyboard гаргах'}
        </button>
      </div>
      {mathField}
    </div>
  )
}
