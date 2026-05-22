"use client";

import { useRef, useEffect, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, ImagePlus } from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  uploadPreset?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  minHeight = "220px",
  uploadPreset,
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
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      exec("insertLineBreak");
    }
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL (https://...):");
    if (url?.trim()) exec("createLink", url.trim());
  };

  const handleImageUrl = () => {
    const url = window.prompt("Enter image URL (https://...):");
    if (url?.trim()) {
      editorRef.current?.focus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand(
        "insertHTML",
        false,
        `<img src="${url.trim()}" style="max-width:100%;height:auto;" />`
      );
      onChange(editorRef.current?.innerHTML ?? "");
    }
  };

  const handleCloudinaryUpload = useCallback(
    (result: unknown) => {
      const info = (result as { info?: { secure_url?: string } })?.info;
      if (info?.secure_url) {
        editorRef.current?.focus();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).execCommand(
          "insertHTML",
          false,
          `<img src="${info.secure_url}" style="max-width:100%;height:auto;" />`
        );
        onChange(editorRef.current?.innerHTML ?? "");
      }
    },
    [onChange]
  );

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
        {/* Alignment controls */}
        <Btn onClick={() => exec("justifyLeft")} title="Align left">
          <AlignLeft size={13} />
        </Btn>
        <Btn onClick={() => exec("justifyCenter")} title="Align center">
          <AlignCenter size={13} />
        </Btn>
        <Btn onClick={() => exec("justifyRight")} title="Align right">
          <AlignRight size={13} />
        </Btn>
        <Btn onClick={() => exec("justifyFull")} title="Justify">
          <AlignJustify size={13} />
        </Btn>
        <Sep />
        <Btn onClick={handleLink} title="Insert link">
          <span className="text-xs">🔗 Link</span>
        </Btn>
        {/* Image upload — Cloudinary if preset provided, URL fallback otherwise */}
        {uploadPreset ? (
          <CldUploadWidget
            uploadPreset={uploadPreset}
            onSuccess={handleCloudinaryUpload}
            options={{ multiple: false, resourceType: "image" }}
          >
            {({ open }) => (
              <Btn
                onClick={() => open()}
                title="Upload image"
              >
                <span className="flex items-center gap-1 text-xs">
                  <ImagePlus size={12} /> Image
                </span>
              </Btn>
            )}
          </CldUploadWidget>
        ) : (
          <Btn onClick={handleImageUrl} title="Insert image by URL">
            <span className="flex items-center gap-1 text-xs">
              <ImagePlus size={12} /> Image
            </span>
          </Btn>
        )}
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
