"use client";

import { useRef, useEffect, useCallback } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  minHeight = "220px",
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isSetting = useRef(false);

  // Sync external value into the editor without losing cursor position
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isSetting.current) return;
    if (el.innerHTML !== value) {
      isSetting.current = true;
      el.innerHTML = value || "";
      isSetting.current = false;
    }
  }, [value]);

  const exec = useCallback(
    (cmd: string, val?: string) => {
      editorRef.current?.focus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand(cmd, false, val ?? undefined);
      onChange(editorRef.current?.innerHTML ?? "");
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    if (!isSetting.current) {
      onChange(editorRef.current?.innerHTML ?? "");
    }
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter key
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      exec("insertLineBreak");
    }
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL (https://...):");
    if (url?.trim()) exec("createLink", url.trim());
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <Btn onClick={() => exec("bold")} title="Bold">
          <strong className="text-xs">B</strong>
        </Btn>
        <Btn onClick={() => exec("italic")} title="Italic">
          <em className="text-xs">I</em>
        </Btn>
        <Sep />
        <Btn onClick={() => exec("formatBlock", "h1")} title="Heading 1">
          <span className="text-xs font-bold">H1</span>
        </Btn>
        <Btn onClick={() => exec("formatBlock", "h2")} title="Heading 2">
          <span className="text-xs font-bold">H2</span>
        </Btn>
        <Btn onClick={() => exec("formatBlock", "h3")} title="Heading 3">
          <span className="text-xs font-bold">H3</span>
        </Btn>
        <Sep />
        <Btn onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <span className="text-xs">• List</span>
        </Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="Numbered list">
          <span className="text-xs">1. List</span>
        </Btn>
        <Sep />
        <Btn onClick={handleLink} title="Insert link">
          <span className="text-xs">🔗 Link</span>
        </Btn>
        <Btn onClick={() => exec("removeFormat")} title="Clear formatting">
          <span className="text-xs text-gray-500">✕ Clear</span>
        </Btn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={[
          "p-3 focus:outline-none text-sm text-gray-800",
          "prose prose-sm max-w-none",
          "[&:empty]:before:content-[attr(data-placeholder)]",
          "[&:empty]:before:text-gray-400",
          "[&:empty]:before:pointer-events-none",
        ].join(" ")}
      />
    </div>
  );
}

function Btn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor from losing focus
        onClick();
      }}
      title={title}
      className="px-2 py-1 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px h-4 bg-gray-300 mx-1 inline-block" />;
}
