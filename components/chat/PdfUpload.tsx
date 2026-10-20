
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { uploadPdf } from "@/lib/api";

type UploadResult = {
  document_id: number;
  filename: string;
  pages: number;
};

export default function PdfUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.currentTarget.files?.[0];

    // Cho phép chọn lại cùng một file
    event.currentTarget.value = "";

    if (!file || uploading) return;

    setError(null);
    setResult(null);

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Chỉ hỗ trợ file PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File không được vượt quá 10 MB.");
      return;
    }

    try {
      setUploading(true);

      const data = await uploadPdf(file);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể upload PDF."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="sr-only"
        tabIndex={-1}
      />

      {(uploading || error || result) && (
        <div
          aria-live="polite"
          className="absolute bottom-full left-0 z-30 mb-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">
              {uploading
                ? "Đang xử lý tài liệu"
                : error
                ? "Upload thất bại"
                : "Đã thêm tài liệu"}
            </p>

            {!uploading && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setResult(null);
                }}
                aria-label="Đóng thông báo"
                className="rounded-full px-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                ×
              </button>
            )}
          </div>

          {uploading && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800 dark:border-t-white" />
              <p className="text-xs text-neutral-500">
                Đang đọc PDF, tạo embeddings và lưu tài liệu...
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {result && (
            <div className="space-y-1 text-sm">
              <p className="break-words font-medium">
                📄 {result.filename}
              </p>
              <p className="text-neutral-500">
                {result.pages} trang · ID {result.document_id}
              </p>
              <p className="text-xs text-green-600">
                Đã thêm vào kho tài liệu RAG
              </p>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        aria-label="Thêm tài liệu PDF"
        title="Thêm tài liệu PDF"
        className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 active:scale-95 disabled:cursor-wait disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
