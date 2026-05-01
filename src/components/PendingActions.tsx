"use client";

import { useState } from "react";

export function PendingActions({ userId }: { userId: number }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    try {
      await fetch("/api/admin/approvals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action,
          reason: action === "reject" ? "No cumple requisitos" : undefined,
        }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => handleAction("reject")}
        disabled={loading}
        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors disabled:opacity-50"
      >
        Rechazar
      </button>
      <button
        onClick={() => handleAction("approve")}
        disabled={loading}
        className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Aprobar"}
      </button>
    </div>
  );
}
