"use client";

import { useEffect, useState } from "react";
import {
  getOfflineVisits,
  updateOfflineVisit,
  clearOfflineVisit,
  type OfflineVisitPayload,
} from "../lib/offline-queue";

export default function OfflineSyncClient() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const runSync = async () => {
      if (typeof window === "undefined") return;
      if (!navigator.onLine) return;

      const pending = getOfflineVisits().filter(
        (v) => v.status === "pending" || v.status === "failed"
      );
      if (!pending.length) {
        return;
      }

      setIsSyncing(true);
      setJustSynced(false);

      let remaining = pending.length;

      for (const visit of pending) {
        updateOfflineVisit(visit.id, { status: "syncing", lastError: undefined });
        try {
          const res = await fetch("/api/visits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(visit.payload),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok || json.success === false) {
            throw new Error(json.error || "Failed to sync visit");
          }
          clearOfflineVisit(visit.id);
        } catch (err: any) {
          remaining -= 1;
          updateOfflineVisit(visit.id, {
            status: "failed",
            lastError: err?.message || "Failed to sync visit",
          });
        }
      }

      setIsSyncing(false);
      if (getOfflineVisits().length === 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 3000);
      }
    };

    const handleOnline = () => {
      runSync().catch(() => {});
    };

    if (typeof window !== "undefined") {
      if (navigator.onLine) {
        runSync().catch(() => {});
      }
      window.addEventListener("online", handleOnline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
      }
    };
  }, []);

  if (!isSyncing && !justSynced) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-40">
      {isSyncing && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-700 px-4 py-2 text-xs text-slate-100 shadow-lg">
          جاري مزامنة الزيارات غير المتصلة...
        </div>
      )}
      {justSynced && !isSyncing && (
        <div className="rounded-xl bg-emerald-900/90 border border-emerald-700 px-4 py-2 text-xs text-emerald-100 shadow-lg">
          تمت مزامنة جميع الزيارات غير المتصلة بنجاح.
        </div>
      )}
    </div>
  );
}

