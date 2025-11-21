"use client";

import { useEffect, useRef, useState } from "react";
import { addOfflineVisit, getOfflineVisits } from "../../lib/offline-queue";

const API_URL = "/api/visits";

export default function FieldVisitPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [repId, setRepId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [visitType, setVisitType] = useState("visit");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("completed");

  const [repIdError, setRepIdError] = useState("");
  const [customerIdError, setCustomerIdError] = useState("");
  const [offlineVisits, setOfflineVisits] = useState([]);

  const timerRef = useRef(null);
  const startTimestampRef = useRef(null);

  const SESSION_KEY = "dopamine-field-visit-session";

  const startTimer = (existingStartIso) => {
    const startIso = existingStartIso || new Date().toISOString();
    startTimestampRef.current = startIso;
    setHasStarted(true);
    setIsRunning(true);

    if (existingStartIso) {
      const diffSeconds = Math.floor(
        (Date.now() - new Date(existingStartIso).getTime()) / 1000
      );
      setElapsedSeconds(diffSeconds > 0 ? diffSeconds : 0);
    } else {
      setElapsedSeconds(0);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const validateRequiredFields = () => {
    let isValid = true;

    if (!repId.trim()) {
      setRepIdError("الرجاء إدخال اسم المندوب");
      isValid = false;
    } else {
      setRepIdError("");
    }

    if (!customerId.trim()) {
      setCustomerIdError("الرجاء إدخال اسم العميل أو الصيدلية");
      isValid = false;
    } else {
      setCustomerIdError("");
    }

    return isValid;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (raw) {
          const session = JSON.parse(raw);

          if (session.repId) setRepId(session.repId);
          if (session.customerId) setCustomerId(session.customerId);
          if (session.status) setStatus(session.status);
          if (session.visitType) setVisitType(session.visitType);
          if (session.notes) setNotes(session.notes);

          if (session.startTimestamp) {
            startTimer(session.startTimestamp);
          }
        }
      } catch (e) {
        console.error("Failed to restore field visit session", e);
        try {
          window.localStorage.removeItem(SESSION_KEY);
        } catch {
          // ignore
        }
      }
    }

    if (typeof window !== "undefined") {
      try {
        setOfflineVisits(getOfflineVisits());
      } catch {
        // ignore
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        return reject(new Error("Geolocation not supported"));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  const handleStartVisit = async () => {
    setSuccess(false);
    setError(null);
    setLocationError(null);
    setEndLocation(null);

    const ok = validateRequiredFields();
    if (!ok) {
      return;
    }

    startTimer();
    try {
      const loc = await getCurrentPosition();
      setStartLocation(loc);
    } catch (err) {
      console.error("Failed to capture start location", err);
      setLocationError(
        (err && err.message) || "Unable to capture start location."
      );
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setLocationError(null);

    try {
      const ok = validateRequiredFields();
      if (!ok) {
        setIsSubmitting(false);
        return;
      }

      const seconds = elapsedSeconds;
      if (seconds > 0) {
        stopTimer();
      }

      let endLoc = null;
      try {
        endLoc = await getCurrentPosition();
        setEndLocation(endLoc);
      } catch (gpsErr) {
        console.error("Failed to capture end location", gpsErr);
        setLocationError(
          (gpsErr && gpsErr.message) || "Unable to capture end location."
        );
      }

      const endedAt = new Date().toISOString();

      const payload = {
        repId: repId.trim(),
        // customerId/customerName will be adjusted when customer master data is wired
        customerId: null,
        customerName: customerId.trim(),
        visitType,
        notes,
        status,
        visitDate: endedAt,
        elapsedSeconds: seconds,
        location: {
          start: startLocation,
          end: endLoc,
        },
      };

      const isOnline =
        typeof navigator !== "undefined" ? navigator.onLine !== false : true;

      if (!isOnline) {
        const id =
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now())) + "-offline";

        addOfflineVisit({
          id,
          createdAt: new Date().toISOString(),
          payload,
          status: "pending",
        });

        try {
          setOfflineVisits(getOfflineVisits());
        } catch {
          // ignore
        }

        setSuccess(true);
      } else {
        const res = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create visit");
        }

        setSuccess(true);
      }

      setRepId("");
      setCustomerId("");
      setVisitType("visit");
      setNotes("");
      setStatus("completed");

      setHasStarted(false);
      setElapsedSeconds(0);
      startTimestampRef.current = null;

      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(SESSION_KEY);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Failed to save visit", err);
      setError(err.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Field visit timer
          </h1>
          <p className="text-sm text-slate-300">
            Start the visit, let the timer run, then end &amp; save. Duration is
            calculated automatically and GPS snapshots are stored with the
            visit.
          </p>
        </header>

        {offlineVisits.length > 0 && (
          <div className="bg-amber-900/60 border border-amber-700 rounded-2xl px-4 py-3 text-xs text-amber-100">
            هناك {offlineVisits.length} زيارات بانتظار المزامنة. سيتم إرسالها
            تلقائياً عند توفر الاتصال بالإنترنت.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-400">Elapsed time</span>
              <span className="text-3xl font-mono font-semibold text-emerald-400">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="block text-slate-300" htmlFor="repId">
                  Rep ID
                </label>
                <input
                  id="repId"
                  type="text"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  value={repId}
                  onChange={(e) => {
                    setRepId(e.target.value);
                    if (repIdError) setRepIdError("");
                  }}
                  placeholder="REP_001"
                />
                {repIdError && (
                  <p className="text-xs text-red-400 mt-1">{repIdError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300" htmlFor="customerId">
                  Customer / Pharmacy
                </label>
                <input
                  id="customerId"
                  type="text"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    if (customerIdError) setCustomerIdError("");
                  }}
                  placeholder="PHARM_001"
                />
                {customerIdError && (
                  <p className="text-xs text-red-400 mt-1">
                    {customerIdError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300" htmlFor="visitType">
                    Visit type
                  </label>
                  <select
                    id="visitType"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                  >
                    <option value="visit">Visit</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="call">Call</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Visit notes..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              {!hasStarted && (
                <button
                  type="button"
                  onClick={handleStartVisit}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium py-2.5 text-sm transition disabled:opacity-60"
                >
                  Start visit
                </button>
              )}

              {hasStarted && isRunning && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-medium py-2.5 text-sm transition disabled:opacity-60"
                >
                  End visit &amp; save
                </button>
              )}

              {hasStarted && !isRunning && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-medium py-2.5 text-sm transition disabled:opacity-60"
                >
                  Save visit
                </button>
              )}
            </div>

            {isSubmitting && (
              <p className="text-xs text-slate-300">Saving visit...</p>
            )}

            {success && (
              <p className="text-xs text-emerald-400">
                Visit created successfully.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </section>
        </form>

        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
          <h2 className="text-sm font-medium text-slate-200">
            GPS snapshots
          </h2>

          <div className="space-y-1">
            <p className="text-slate-400">
              Start location:{" "}
              {startLocation
                ? `${startLocation.lat.toFixed(5)}, ${startLocation.lng.toFixed(
                    5
                  )}`
                : "Not captured yet"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-400">
              End location:{" "}
              {endLocation
                ? `${endLocation.lat.toFixed(5)}, ${endLocation.lng.toFixed(5)}`
                : "Not captured yet"}
            </p>
          </div>

          {locationError && (
            <p className="text-xs text-red-400 mt-2">{locationError}</p>
          )}
        </section>
      </div>
    </main>
  );
}
