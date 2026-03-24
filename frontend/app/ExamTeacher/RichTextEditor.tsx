"use client";

import { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  onChange: (value: string) => void;
  value: string;
};

type MathTool = "MathLive" | "MathQuill" | "MathType";

const mathToolOptions: MathTool[] = ["MathLive", "MathQuill", "MathType"];

const mathTemplates: Record<MathTool, string[]> = {
  MathLive: ["\\frac{x^2+1}{y}", "\\sqrt{a^2+b^2}", "\\int_0^1 x^2 dx"],
  MathQuill: ["x^2 + y^2 = r^2", "\\sum_{n=1}^{10} n", "\\lim_{x \\to 0} \\frac{\\sin x}{x}"],
  MathType: ["\\alpha + \\beta = \\gamma", "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}", "f'(x)=2x+3"],
};

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
};

function ToolbarButton({ label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[10px] px-2 py-1 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700"
    >
      {label}
    </button>
  );
}

export function RichTextEditor({ onChange, value }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<MathTool>("MathLive");
  const [showMathTools, setShowMathTools] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function syncEditor() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function runCommand(command: string) {
    document.execCommand(command);
    syncEditor();
  }

  function insertMathTemplate(template: string) {
    const mathChip = `<span class="rounded bg-[#eef4ff] px-2 py-1 font-mono text-teal-700">${template}</span>&nbsp;`;
    document.execCommand("insertHTML", false, mathChip);
    syncEditor();
  }

  return (
    <div className="mt-3 overflow-hidden rounded-[18px] border border-slate-200">
      <div className="border-b border-slate-200 bg-[#eef4ff] px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <ToolbarButton label="B" onClick={() => runCommand("bold")} />
          <ToolbarButton label="I" onClick={() => runCommand("italic")} />
          <ToolbarButton label="U" onClick={() => runCommand("underline")} />
          <ToolbarButton label="•" onClick={() => runCommand("insertUnorderedList")} />
          <ToolbarButton label="1." onClick={() => runCommand("insertOrderedList")} />
          <ToolbarButton
            label="Math"
            onClick={() => setShowMathTools((current) => !current)}
          />
        </div>
        {showMathTools ? (
          <div className="mt-3 rounded-[14px] bg-white p-3">
            <div className="flex flex-wrap gap-2">
              {mathToolOptions.map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => setActiveTool(tool)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeTool === tool
                      ? "bg-teal-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tool === "MathType" ? "MathType (Wiris)" : tool}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {mathTemplates[activeTool].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => insertMathTemplate(template)}
                  className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncEditor}
        className="min-h-40 bg-white px-4 py-4 text-sm leading-7 text-slate-700 outline-none"
      />
    </div>
  );
}
