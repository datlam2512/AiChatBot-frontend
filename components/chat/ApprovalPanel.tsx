
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

type PendingApproval = {
  pending: boolean;
  action?: string;
  document_id?: number;
  filename?: string;
  question?: string;
};

type Props = {
  conversationId: number;
  onResolved?: () => void;
};

export default function ApprovalPanel({
  conversationId,
  onResolved,
}: Props) {
  const { t } = useLanguage();
  const [approval, setApproval] =
    useState<PendingApproval | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    let active = true;

    setApproval(null);
    setResult("");
    setError("");

    async function checkApproval() {
      try {
        const response = await fetch(
          `${API_BASE}/api/chat/${conversationId}/pending-approval`
        );

        if (!response.ok) return;

        const data: PendingApproval = await response.json();

        if (active) {
          setApproval(data);
        }
      } catch {
        // The backend may be restarting.
      }
    }

    void checkApproval();

    // Poll periodically while the approval is pending.
    const interval = setInterval(checkApproval, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [conversationId]);

  async function respond(approved: boolean) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/chat/${conversationId}/approval`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approved }),
        }
      );

      if (!response.ok) {
        throw new Error(t("approval.failed"));
      }

      const data = await response.json();

      setResult(data.message);

      if (data.status !== "pending") {
        setApproval({ pending: false });
      }

      onResolved?.();

    } catch {
      setError(t("approval.genericError"));
    } finally {
      setLoading(false);
    }
  }

  if (!approval?.pending && !result) {
    return null;
  }

  return (
    <div className="my-4 rounded-xl border p-4">
      {approval?.pending && (
        <>
          <h3 className="font-semibold">
            {t("approval.title")}
          </h3>

          <p className="mt-2 text-sm">
            {approval.question}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {t("chat.documentId")}: {approval.document_id}
          </p>

          <p className="mt-2 text-xs text-amber-600">
            {t("approval.demo")}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              disabled={loading}
              onClick={() => respond(false)}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              {t("approval.cancel")}
            </button>

            <button
              disabled={loading}
              onClick={() => respond(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? t("approval.processing") : t("approval.confirm")}
            </button>
          </div>
        </>
      )}

      {result && (
        <p className="mt-2 text-sm">{result}</p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
