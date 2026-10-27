"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Eye,
  FileText,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  deleteDocument,
  getAllDocuments,
  getDocument,
  uploadPdf,
  type DocumentItem,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function DocumentsPage() {
  const { language, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [detail, setDetail] = useState<DocumentItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setDocuments(await getAllDocuments());
    } catch (loadError) {
      setError(
        t("docs.listLoadFailed", {
          error: getErrorMessage(loadError, t("docs.unknownError")),
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file || uploading) return;

    setError("");
    setSuccess("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(t("chat.pdfOnly"));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t("chat.fileTooLarge"));
      return;
    }

    setUploading(true);

    try {
      const uploaded = await uploadPdf(file);
      setSuccess(
        t("docs.uploaded", {
          filename: uploaded.filename,
          pages: uploaded.pages,
        }),
      );

      try {
        setDocuments(await getAllDocuments());
      } catch (refreshError) {
        setError(
          t("docs.uploadedRefreshFailed", {
            error: getErrorMessage(refreshError, t("docs.unknownError")),
          }),
        );
      }
    } catch (uploadError) {
      setError(
        t("docs.uploadFailed", {
          error: getErrorMessage(uploadError, t("docs.unknownError")),
        }),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (document: DocumentItem) => {
    setSelectedDocument(document);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      setDetail(await getDocument(document.id));
    } catch (detailLoadError) {
      setDetailError(
        t("docs.detailsFailed", {
          error: getErrorMessage(detailLoadError, t("docs.unknownError")),
        }),
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!documentToDelete || deletingId !== null) return;
    const document = documentToDelete;
    setDeletingId(document.id);
    setDeleteError("");
    setError("");
    setSuccess("");

    try {
      await deleteDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setSuccess(t("docs.deleted", { filename: document.filename }));
      setDocumentToDelete(null);
      if (selectedDocument?.id === document.id) {
        setSelectedDocument(null);
      }
    } catch (deleteError) {
      setDeleteError(
        t("docs.deleteFailed", {
          error: getErrorMessage(deleteError, t("docs.unknownError")),
        }),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("docs.title")}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {t("docs.description")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadDocuments()}
              disabled={loading}
              aria-label={t("docs.refreshList")}
              title={t("docs.refreshList")}
              className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">{t("docs.refresh")}</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => void handleUpload(event)}
              className="sr-only"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {uploading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? t("docs.uploading") : t("docs.uploadPdf")}
            </button>
          </div>
        </div>

        {(error || success) && (
          <div
            role={error ? "alert" : "status"}
            className={`mt-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
            }`}
          >
            {error && <AlertCircle size={17} className="mt-0.5 shrink-0" />}
            <span>{error || success}</span>
          </div>
        )}

        <section className="mt-8" aria-label={t("docs.list")}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {t("docs.documents")}
            </h2>
            {!loading && (
              <span className="text-xs text-neutral-400">
                {t("docs.documentCount", { count: documents.length })}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 py-12 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <LoaderCircle size={18} className="animate-spin" />
              {t("docs.loadingList")}
            </div>
          ) : error && documents.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 px-5 py-10 text-center dark:border-neutral-800">
              <p className="text-sm text-neutral-500">{t("docs.listFailed")}</p>
              <button
                type="button"
                onClick={() => void loadDocuments()}
                className="mt-3 text-sm font-medium underline underline-offset-4"
              >
                {t("docs.retry")}
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-5 py-12 text-center dark:border-neutral-700">
              <FileText size={24} className="mx-auto text-neutral-400" />
              <p className="mt-3 text-sm font-medium">{t("docs.emptyTitle")}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {t("docs.emptyDescription")}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      <FileText size={19} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">{document.filename}</h3>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        ID {document.id} · {document.chunk_count} chunks ·{" "}
                        {new Date(document.created_at).toLocaleDateString(
                          language === "vi" ? "vi-VN" : "en-US",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleView(document)}
                      aria-label={`${t("docs.viewDetails")}: ${document.filename}`}
                      className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">{t("docs.viewDetails")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentToDelete(document);
                        setDeleteError("");
                      }}
                      aria-label={t("docs.deleteDocument", {
                        filename: document.filename,
                      })}
                      className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">{t("docs.delete")}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDocument(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-detail-title"
            className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="document-detail-title" className="text-lg font-semibold">
                  {t("docs.details")}
                </h2>
                <p className="mt-1 truncate text-sm text-neutral-500">
                  {selectedDocument.filename}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                aria-label={t("docs.closeDetails")}
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
                <LoaderCircle size={17} className="animate-spin" />
                {t("docs.loadingDetails")}
              </div>
            ) : detailError ? (
              <p role="alert" className="py-6 text-sm text-red-600 dark:text-red-400">
                {detailError}
              </p>
            ) : detail ? (
              <dl className="mt-6 divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-500">ID</dt>
                  <dd className="font-medium">{detail.id}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-500">{t("docs.fileName")}</dt>
                  <dd className="break-all text-right font-medium">{detail.filename}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-500">{t("docs.chunks")}</dt>
                  <dd className="font-medium">{detail.chunk_count}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-500">{t("docs.created")}</dt>
                  <dd className="text-right font-medium">
                    {new Date(detail.created_at).toLocaleString(
                      language === "vi" ? "vi-VN" : "en-US",
                    )}
                  </dd>
                </div>
              </dl>
            ) : null}
          </section>
        </div>
      )}

      {documentToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && deletingId === null) {
              setDocumentToDelete(null);
              setDeleteError("");
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
            aria-describedby="delete-document-description"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Trash2 size={20} />
              </div>
              <div className="min-w-0 pt-1">
                <h2 id="delete-document-title" className="text-lg font-semibold">
                  {t("docs.deleteTitle")}
                </h2>
                <p id="delete-document-description" className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {t("docs.deleteDescription", {
                    filename: documentToDelete.filename,
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDocumentToDelete(null);
                  setDeleteError("");
                }}
                disabled={deletingId !== null}
                aria-label={t("docs.closeDelete")}
                className="ml-auto rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            {deleteError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDocumentToDelete(null);
                  setDeleteError("");
                }}
                disabled={deletingId !== null}
                className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {t("docs.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deletingId !== null}
                className="flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {deletingId !== null && <LoaderCircle size={16} className="animate-spin" />}
                {deletingId !== null
                  ? t("docs.deleting")
                  : t("docs.delete")}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
