"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  MarkerClusterer,
  useLoadScript,
} from "@react-google-maps/api";

// حجم الخريطة داخل الكارد
const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

// مركز افتراضي (عمان)
const DEFAULT_CENTER = { lat: 31.9515, lng: 35.9239 };

function formatCoordLink(coord) {
  if (!coord) return "—";

  const url = `https://www.google.com/maps?q=${coord.lat},${coord.lng}`;
  const label = `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-400 underline hover:text-sky-300"
    >
      {label}
    </a>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

export default function RepsMapPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedVisit, setSelectedVisit] = useState(null);

  const [filterRepId, setFilterRepId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // تحميل سكربت خرائط جوجل
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    let cancelled = false;

    async function load(initialParams) {
      setLoading(true);
      setFetchError(null);

      try {
        const searchParams = new URLSearchParams();
        searchParams.set("limit", "300");
        if (initialParams?.repId) searchParams.set("repId", initialParams.repId);
        if (initialParams?.dateFrom)
          searchParams.set("dateFrom", initialParams.dateFrom);
        if (initialParams?.dateTo)
          searchParams.set("dateTo", initialParams.dateTo);

        const res = await fetch(`/api/visits?${searchParams.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load visits");
        }

        if (!cancelled) {
          setVisits(Array.isArray(json.data) ? json.data : []);
        }
      } catch (err) {
        console.error("Failed to fetch visits for map:", err);
        if (!cancelled) {
          setFetchError(err.message || "Unexpected error while loading visits");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleApplyFilters = async (event) => {
    event.preventDefault();
    setFetchError(null);
    setSelectedVisit(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("limit", "300");
      if (filterRepId.trim()) searchParams.set("repId", filterRepId.trim());
      if (dateFrom.trim()) searchParams.set("dateFrom", dateFrom.trim());
      if (dateTo.trim()) searchParams.set("dateTo", dateTo.trim());

      setLoading(true);

      const res = await fetch(`/api/visits?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load visits");
      }

      setVisits(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Failed to fetch visits for map with filters:", err);
      setFetchError(err.message || "Unexpected error while loading visits");
    } finally {
      setLoading(false);
    }
  };

  // زيارات تحتوي على GPS
  const gpsVisits = useMemo(() => {
    return visits.filter((v) => {
      const loc = v.location || {};
      const start = loc.start;
      const end = loc.end;
      const hasStart =
        start && typeof start.lat === "number" && typeof start.lng === "number";
      const hasEnd =
        end && typeof end.lat === "number" && typeof end.lng === "number";
      return hasStart || hasEnd;
    });
  }, [visits]);

  const repIds = useMemo(() => {
    const set = new Set();
    gpsVisits.forEach((v) => {
      if (v.repId) set.add(v.repId);
    });
    return Array.from(set);
  }, [gpsVisits]);

  // حساب مركز الخريطة بناء على كل الماركرز
  const mapCenter = useMemo(() => {
    if (!gpsVisits.length) return DEFAULT_CENTER;

    let sumLat = 0;
    let sumLng = 0;
    let count = 0;

    gpsVisits.forEach((v) => {
      const loc = v.location || {};
      const point = loc.start || loc.end;
      if (
        point &&
        typeof point.lat === "number" &&
        typeof point.lng === "number"
      ) {
        sumLat += point.lat;
        sumLng += point.lng;
        count++;
      }
    });

    if (!count) return DEFAULT_CENTER;
    return {
      lat: sumLat / count,
      lng: sumLng / count,
    };
  }, [gpsVisits]);

  const totalGpsVisits = gpsVisits.length;
  const totalReps = repIds.length;
  const lastUpdate = useMemo(() => {
    if (!gpsVisits.length) return null;
    const latest = gpsVisits.reduce((max, v) => {
      const d = new Date(v.visitDate || v.createdAt || Date.now());
      return d > max ? d : max;
    }, new Date(0));
    return latest.toISOString().slice(0, 10);
  }, [gpsVisits]);

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>خريطة المندوبين</h1>
      <p style={{ color: "#9ca3af", marginBottom: 24 }}>
        مشاهدة آخر موقع معروف لكل مندوب بناءً على زيارات تحتوي على بيانات GPS.
      </p>

      {/* فلاتر بسيطة */}
      <div className="card" style={{ marginBottom: 16 }}>
        <form
          onSubmit={handleApplyFilters}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="filter-rep">
              المندوب
            </label>
            <select
              id="filter-rep"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={filterRepId}
              onChange={(e) => setFilterRepId(e.target.value)}
            >
              <option value="">كل المندوبين</option>
              {repIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="filter-date-from"
            >
              من تاريخ
            </label>
            <input
              id="filter-date-from"
              type="date"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="filter-date-to"
            >
              إلى تاريخ
            </label>
            <input
              id="filter-date-to"
              type="date"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              تطبيق الفلاتر
            </button>
          </div>
        </form>
      </div>

      {/* كروت ملخص بسيط */}
      <div className="card-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">إجمالي الزيارات التي تحتوي GPS</div>
          <div className="card-value">{totalGpsVisits}</div>
        </div>
        <div className="card">
          <div className="card-title">عدد المندوبين مع مواقع مسجلة</div>
          <div className="card-value">{totalReps}</div>
        </div>
        <div className="card">
          <div className="card-title">آخر تاريخ لزيارة بها GPS</div>
          <div className="card-value">{lastUpdate || "-"}</div>
        </div>
      </div>

      {/* الخريطة داخل كارد */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>
          مواقع المندوبين على الخريطة
        </div>

        {loadError && (
          <p className="text-red-400">
            حدث خطأ في تحميل خرائط جوجل، تأكد من NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
          </p>
        )}

        {!isLoaded && !loadError && (
          <p className="text-slate-400">جارٍ تحميل الخريطة...</p>
        )}

        {isLoaded && !loadError && (
          <>
            {gpsVisits.length === 0 ? (
              <p className="text-slate-400">
                لا توجد زيارات تحتوي على بيانات GPS حتى الآن. جرّب تسجيل زيارة
                جديدة من صفحة Field visit، مع السماح بالوصول لموقع الجهاز.
              </p>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={11}
              >
                {gpsVisits.length > 30 ? (
                  <MarkerClusterer>
                    {(clusterer) =>
                      gpsVisits.map((v) => {
                        const loc = v.location || {};
                        const point = loc.start || loc.end;
                        if (
                          !point ||
                          typeof point.lat !== "number" ||
                          typeof point.lng !== "number"
                        ) {
                          return null;
                        }

                        return (
                          <Marker
                            key={v._id}
                            position={{ lat: point.lat, lng: point.lng }}
                            clusterer={clusterer}
                            label={{
                              text: v.repId?.charAt(0)?.toUpperCase() || "R",
                              className: "marker-label",
                            }}
                            onClick={() => setSelectedVisit(v)}
                          />
                        );
                      })
                    }
                  </MarkerClusterer>
                ) : (
                  gpsVisits.map((v) => {
                    const loc = v.location || {};
                    const point = loc.start || loc.end;
                    if (
                      !point ||
                      typeof point.lat !== "number" ||
                      typeof point.lng !== "number"
                    ) {
                      return null;
                    }

                    return (
                      <Marker
                        key={v._id}
                        position={{ lat: point.lat, lng: point.lng }}
                        label={{
                          text: v.repId?.charAt(0)?.toUpperCase() || "R",
                          className: "marker-label",
                        }}
                        onClick={() => setSelectedVisit(v)}
                      />
                    );
                  })
                )}

                {selectedVisit && (
                  <InfoWindow
                    position={
                      selectedVisit.location?.start ||
                      selectedVisit.location?.end
                    }
                    onCloseClick={() => setSelectedVisit(null)}
                  >
                    <div style={{ fontSize: 12, maxWidth: 220 }}>
                      <div>
                        <strong>المندوب:</strong> {selectedVisit.repId}
                      </div>
                      <div>
                        <strong>العميل:</strong>{" "}
                        {selectedVisit.customerName || selectedVisit.customerId}
                      </div>
                      <div>
                        <strong>الحالة:</strong> {selectedVisit.status}
                      </div>
                      <div>
                        <strong>التاريخ:</strong>{" "}
                        {formatDate(
                          selectedVisit.visitDate || selectedVisit.createdAt
                        )}
                      </div>
                      {selectedVisit.location?.start && (
                        <div style={{ marginTop: 4 }}>
                          <a
                            href={`https://www.google.com/maps?q=${selectedVisit.location.start.lat},${selectedVisit.location.start.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 underline hover:text-sky-300"
                          >
                            فتح في Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </>
        )}
      </div>

      {/* جدول بسيط لآخر الزيارات مع GPS */}
      <div className="card">
        <div className="card-title">آخر الزيارات التي تحتوي على GPS</div>
        <table className="table">
          <thead>
            <tr>
              <th>المندوب</th>
              <th>العميل</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>Start GPS</th>
              <th>End GPS</th>
            </tr>
          </thead>
          <tbody>
            {gpsVisits.slice(0, 20).map((v) => (
              <tr key={v._id}>
                <td>{v.repId}</td>
                <td>{v.customerName || v.customerId}</td>
                <td>{formatDate(v.visitDate || v.createdAt)}</td>
                <td>
                  <span className="status-badge status-completed">
                    {v.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-200 text-sm">
                  {formatCoordLink(v.location?.start)}
                </td>
                <td className="px-4 py-2 text-slate-200 text-sm">
                  {formatCoordLink(v.location?.end)}
                </td>
              </tr>
            ))}
            {gpsVisits.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  لا توجد زيارات تحتوي على GPS حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

