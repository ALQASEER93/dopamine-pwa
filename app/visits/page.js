// app/visits/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) return "-";
  const m = Number(minutes);
  if (m < 60) return `${m} min`;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${hours}h ${mins}m`;
}

export default function VisitsPage() {
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState(null);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/visits", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Failed to load visits (${res.status})`);
      }

      const data = await res.json();
      setVisits(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Failed to load visits", err);
      setError(err.message || "Unable to load visits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Visits log</h1>
          <p className="page-subtitle">
            آخر الزيارات المسجلة من صفحة <code>/field-visit</code>.
          </p>
        </div>

        <div className="page-actions">
          <Link href="/field-visit" className="btn btn-primary">
            + New field visit
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadVisits}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && !visits.length ? (
        <div className="card">
          <p>Loading visits…</p>
        </div>
      ) : !visits.length ? (
        <div className="card">
          <p>لا يوجد زيارات مسجّلة حتى الآن. جرّب من /field-visit أولاً.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Created at</th>
                  <th>Started</th>
                  <th>Ended</th>
                  <th>Duration</th>
                  <th>Start GPS</th>
                  <th>End GPS</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v, idx) => {
                  const hasStartGPS =
                    v.startLocation &&
                    typeof v.startLocation.lat === "number" &&
                    typeof v.startLocation.lng === "number";

                  const hasEndGPS =
                    v.endLocation &&
                    typeof v.endLocation.lat === "number" &&
                    typeof v.endLocation.lng === "number";

                  return (
                    <tr key={v.id || idx}>
                      <td>{visits.length - idx}</td>
                      <td>{formatDateTime(v.createdAt)}</td>
                      <td>{formatDateTime(v.startedAt)}</td>
                      <td>{formatDateTime(v.endedAt)}</td>
                      <td>{formatDuration(v.durationMinutes)}</td>
                      <td>
                        {hasStartGPS ? (
                          <a
                            href={`https://www.google.com/maps?q=${v.startLocation.lat},${v.startLocation.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="badge badge-success"
                          >
                            Start map
                          </a>
                        ) : (
                          <span className="badge badge-muted">-</span>
                        )}
                      </td>
                      <td>
                        {hasEndGPS ? (
                          <a
                            href={`https://www.google.com/maps?q=${v.endLocation.lat},${v.endLocation.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="badge badge-success"
                          >
                            End map
                          </a>
                        ) : (
                          <span className="badge badge-muted">-</span>
                        )}
                      </td>
                      <td>
                        {v.notes && v.notes.trim()
                          ? v.notes.trim().slice(0, 80)
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="table-footnote">
            البيانات مخزّنة في الذاكرة (in-memory) وتُمسح عند إعادة تشغيل
            السيرفر أو إعادة نشر المشروع.
          </p>
        </div>
      )}
    </div>
  );
}

