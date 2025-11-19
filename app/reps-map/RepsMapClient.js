'use client';

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

const cardStyle = {
  backgroundColor: "rgba(10, 25, 47, 0.95)",
  borderRadius: "18px",
  padding: "16px 20px",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  color: "#e5e7eb",
  height: "100%",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const buttonStyle = {
  padding: "6px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(248, 250, 252, 0.4)",
  background: "linear-gradient(90deg,#f97316,#ec4899)",
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const badgeStyle = {
  fontSize: "12px",
  borderRadius: "999px",
  padding: "2px 8px",
  backgroundColor: "rgba(15, 118, 110, 0.15)",
  border: "1px solid rgba(45, 212, 191, 0.4)",
};

async function fetchVisits() {
  const res = await fetch("/api/visits");
  if (!res.ok) {
    throw new Error("Failed to load visits");
  }
  return res.json();
}

export default function RepsMapClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visits, setVisits] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVisits();
      if (data && Array.isArray(data.items)) {
        setVisits(data.items);
      } else {
        setVisits([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load visits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const gpsPoints = useMemo(() => {
    const pts = [];
    for (const v of visits) {
      if (
        v.startLocation &&
        typeof v.startLocation.lat === "number" &&
        typeof v.startLocation.lng === "number"
      ) {
        pts.push({
          type: "start",
          lat: v.startLocation.lat,
          lng: v.startLocation.lng,
          label: `Start – visit #${v.id}`,
          durationMinutes: v.durationMinutes || 0,
        });
      }
      if (
        v.endLocation &&
        typeof v.endLocation.lat === "number" &&
        typeof v.endLocation.lng === "number"
      ) {
        pts.push({
          type: "end",
          lat: v.endLocation.lat,
          lng: v.endLocation.lng,
          label: `End – visit #${v.id}`,
          durationMinutes: v.durationMinutes || 0,
        });
      }
    }
    return pts;
  }, [visits]);

  const mapCenter = useMemo(() => {
    if (!gpsPoints.length) {
      // مركز افتراضي عمّان
      return { lat: 31.963158, lng: 35.930359, zoom: 11 };
    }
    const sumLat = gpsPoints.reduce((s, p) => s + p.lat, 0);
    const sumLng = gpsPoints.reduce((s, p) => s + p.lng, 0);
    const lat = sumLat / gpsPoints.length;
    const lng = sumLng / gpsPoints.length;
    return { lat, lng, zoom: 12 };
  }, [gpsPoints]);

  return (
    <div style={{ padding: "24px 32px", height: "100%", boxSizing: "border-box" }}>
      <h1 style={{ color: "#f9fafb", fontSize: "24px", marginBottom: "4px" }}>
        خريطة المندوبين
      </h1>
      <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "16px" }}>
        مشاهدة مواقع الزيارات الميدانية (بداية ونهاية كل زيارة تحتوي على GPS).
      </p>

      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px" }}>
              إجمالي الزيارات:{" "}
              <strong>{visits.length}</strong> – نقاط GPS:{" "}
              <strong>{gpsPoints.length}</strong>
            </span>
            {loading && (
              <span style={{ fontSize: "12px", color: "#e5e7eb" }}>
                يجري تحميل البيانات...
              </span>
            )}
            {error && (
              <span style={{ fontSize: "12px", color: "#f97316" }}>
                {error}
              </span>
            )}
          </div>

          <button type="button" style={buttonStyle} onClick={loadData} disabled={loading}>
            تحديث البيانات
          </button>
        </div>

        {!gpsPoints.length ? (
          <div style={{ fontSize: "13px", color: "#9ca3af", padding: "16px 4px" }}>
            لا توجد زيارات تحتوي على بيانات GPS بعد. جرّب تسجيل زيارة جديدة من صفحة{" "}
            <span style={{ fontWeight: 600 }}>Field visit</span>.
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                gap: "12px",
                fontSize: "12px",
              }}
            >
              <span style={badgeStyle}>S = بداية الزيارة</span>
              <span style={badgeStyle}>E = نهاية الزيارة</span>
            </div>

            <div style={{ height: "460px", borderRadius: "18px", overflow: "hidden" }}>
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={mapCenter.zoom}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {gpsPoints.map((p, idx) => (
                  <CircleMarker
                    key={`${p.type}-${idx}`}
                    center={[p.lat, p.lng]}
                    radius={p.type === "start" ? 8 : 7}
                    pathOptions={{
                      color: p.type === "start" ? "#4ade80" : "#f97316",
                      weight: 2,
                      fillOpacity: 0.7,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                      <div style={{ fontSize: "11px" }}>
                        <div>
                          {p.type === "start" ? "Start" : "End"} – {p.label}
                        </div>
                        <div>مدة الزيارة: {p.durationMinutes} دقيقة</div>
                        <div>
                          lat: {p.lat.toFixed(6)}, lng: {p.lng.toFixed(6)}
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

