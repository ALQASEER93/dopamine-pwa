"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = "/api/visits";

export default function FieldVisitPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const timerRef = useRef(null);
  const startTimestampRef = useRef(null);

  // تشغيل التايمر
  const startTimer = () => {
    const now = Date.now();
    startTimestampRef.current = now;
    setHasStarted(true);
    setIsRunning(true);
    setElapsedSeconds(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  // إيقاف التايمر
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  // تنظيف التايمر عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // دالة التقاط الـ GPS
  const captureLocation = async (type) => {
    setLocationError(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };

          if (type === "start") {
            setStartLocation(coords);
          } else if (type === "end") {
            setEndLocation(coords);
          }

          resolve(coords);
        },
        (err) => {
          console.warn("GPS error:", err);
          setLocationError(err.message || "Unable to capture location.");
          resolve(null); // لا نمنع الحفظ، فقط نرجع null
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  // بدء الزيارة
  const handleStartVisit = async () => {
    setSaveMessage("");
    setSaveError("");
    setEndLocation(null);

    startTimer();
    await captureLocation("start");
  };

  // إنهاء الزيارة + حساب المدة + حفظ تلقائي
  const handleEndAndSave = async () => {
    setSaveMessage("");
    setSaveError("");

    // نأخذ نسخة من الوقت المنقضي قبل أي setState
    const seconds = elapsedSeconds;

    stopTimer();

    const minutes = Math.max(1, Math.round(seconds / 60) || 1);

    // نلتقط موقع النهاية
    const endCoords = await captureLocation("end");

    // نبقي القيمة في واجهة المستخدم (عرض فقط)
    // (لو أردت حقل duration ظاهر مستقبلاً يمكن إضافته)
    const startedAt = startTimestampRef.current
      ? new Date(startTimestampRef.current).toISOString()
      : null;
    const endedAt = new Date().toISOString();

    const payload = {
      source: "pwa-field-visit",
      startedAt,
      endedAt,
      durationMinutes: minutes,
      startLocation: startLocation
        ? {
            lat: startLocation.lat,
            lng: startLocation.lng,
            accuracy: startLocation.accuracy,
          }
        : null,
      endLocation: endCoords
        ? {
            lat: endCoords.lat,
            lng: endCoords.lng,
            accuracy: endCoords.accuracy,
          }
        : endLocation
        ? {
            lat: endLocation.lat,
            lng: endLocation.lng,
            accuracy: endLocation.accuracy,
          }
        : null,
    };

    try {
      setIsSaving(true);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to save visit, status ${res.status}`);
      }

      setSaveMessage("Visit saved successfully.");
      setSaveError("");

      // إعادة ضبط الحالة بعد الحفظ
      setHasStarted(false);
      setElapsedSeconds(0);
      startTimestampRef.current = null;
      // نترك الـ locations ظاهرة كملخص، أو يمكن تصفيرها لو أحببت:
      // setStartLocation(null);
      // setEndLocation(null);
    } catch (err) {
      console.error("Failed to save visit", err);
      setSaveError(err.message || "Unable to save visit.");
    } finally {
      setIsSaving(false);
    }
  };

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

        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-400">Elapsed time</span>
            <span className="text-3xl font-mono font-semibold text-emerald-400">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="flex gap-3">
            {!hasStarted && (
              <button
                type="button"
                onClick={handleStartVisit}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium py-2.5 text-sm transition disabled:opacity-60"
              >
                Start visit
              </button>
            )}

            {hasStarted && isRunning && (
              <button
                type="button"
                onClick={handleEndAndSave}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-medium py-2.5 text-sm transition disabled:opacity-60"
              >
                End visit &amp; save
              </button>
            )}

            {hasStarted && !isRunning && (
              <button
                type="button"
                onClick={handleEndAndSave}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-medium py-2.5 text-sm transition disabled:opacity-60"
              >
                Save visit
              </button>
            )}
          </div>

          {isSaving && (
            <p className="text-xs text-slate-300">Saving visit…</p>
          )}

          {saveMessage && (
            <p className="text-xs text-emerald-400">{saveMessage}</p>
          )}
          {saveError && <p className="text-xs text-red-400">{saveError}</p>}
        </section>

        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
          <h2 className="text-sm font-medium text-slate-200">
            GPS snapshots
          </h2>

          <div className="space-y-1">
            <div className="text-slate-400">Start location</div>
            {startLocation ? (
              <div className="text-slate-200">
                lat: {startLocation.lat.toFixed(6)}, lng:{" "}
                {startLocation.lng.toFixed(6)}{" "}
                <span className="text-slate-400">
                  (±{Math.round(startLocation.accuracy)} m)
                </span>
              </div>
            ) : (
              <div className="text-slate-500">Not captured yet.</div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-slate-400">End location</div>
            {endLocation ? (
              <div className="text-slate-200">
                lat: {endLocation.lat.toFixed(6)}, lng:{" "}
                {endLocation.lng.toFixed(6)}{" "}
                <span className="text-slate-400">
                  (±{Math.round(endLocation.accuracy)} m)
                </span>
              </div>
            ) : (
              <div className="text-slate-500">Not captured yet.</div>
            )}
          </div>

          {locationError && (
            <p className="text-xs text-red-400 mt-2">{locationError}</p>
          )}
        </section>
      </div>
    </main>
  );
}

