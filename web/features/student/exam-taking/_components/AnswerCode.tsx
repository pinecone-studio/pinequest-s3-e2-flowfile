'use client'

import dynamic from 'next/dynamic'
import { javascript } from '@codemirror/lang-javascript'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
})

export function AnswerCode({
  value,
  onChange,
  onRun,
  isRunning,
  logs,
  result,
  error,
}: {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  isRunning: boolean
  logs: string[]
  result: string | null
  error: string | null
}) {
  return (
    <div className="space-y-3 rounded-xl border border-card-border bg-white p-4">
      <div className="rounded-xl bg-[#EEF5FF] px-3 py-2 text-[12px] text-text-secondary">
        CodeMirror editor нь утсан дээр жижиг дэлгэцэд таарсан өндөртэй харагдана. Код нь plain text хэлбэрээр хадгалагдана.
      </div>
      <CodeMirror
        value={value}
        height="240px"
        theme="light"
        extensions={[javascript()]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          autocompletion: true,
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] text-text-secondary">JavaScript preview runner</div>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isRunning ? 'Ажиллуулж байна...' : 'Run code'}
        </button>
      </div>

      <div className="rounded-xl bg-[#0F172A] p-4 text-[13px] text-slate-100">
        <div className="mb-3 font-semibold text-slate-300">Console</div>
        {logs.length > 0 ? (
          <div className="space-y-1">
            {logs.map((line, index) => (
              <div key={`${line}-${index}`} className="font-mono">
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div className="font-mono text-slate-400">console.log output байхгүй</div>
        )}

        {result && (
          <div className="mt-3 border-t border-slate-700 pt-3">
            <div className="mb-1 font-semibold text-slate-300">Return value</div>
            <div className="font-mono text-emerald-300">{result}</div>
          </div>
        )}

        {error && (
          <div className="mt-3 border-t border-slate-700 pt-3">
            <div className="mb-1 font-semibold text-red-300">Error</div>
            <div className="font-mono text-red-200">{error}</div>
          </div>
        )}
      </div>
    </div>
  )
}
