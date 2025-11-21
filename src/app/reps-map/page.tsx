
'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    initDopamineMap?: () => void;
    google?: any;
  }
}

interface RepLocation {
  id: string;
  name: string;
  lastSeen: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline';
}

const mockReps: RepLocation[] = [
  { id: '1', name: 'Hanaa', lastSeen: 'قبل ٣ دقائق', lat: 31.9539, lng: 35.9106, status: 'online' },
  { id: '2', name: 'Mohammad', lastSeen: 'قبل ١٥ دقيقة', lat: 31.9632, lng: 35.9304, status: 'online' },
  { id: '3', name: 'Sami', lastSeen: 'قبل ساعة', lat: 31.9856, lng: 35.8989, status: 'offline' },
];

export default function RepsMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.google && mapRef.current && !mapLoaded) {
      createMap();
      return;
    }

    const existing = document.getElementById('dopamine-maps-script');
    if (existing) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('أضف مفتاح Google Maps في متغير NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
      return;
    }

    window.initDopamineMap = () => {
      createMap();
    };

    const script = document.createElement('script');
    script.id = 'dopamine-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initDopamineMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setError('تعذر تحميل خرائط Google. تأكد من صحة الـ API key.');
    document.head.appendChild(script);
  }, [mapLoaded]);

  const createMap = () => {
    if (!mapRef.current || !window.google) return;
    const center = { lat: 31.963158, lng: 35.930359 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      disableDefaultUI: true,
      styles: [
        {
          elementType: 'geometry',
          stylers: [{ color: '#020617' }],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#e5e7eb' }],
        },
      ],
    });

    mockReps.forEach((rep) => {
      const marker = new window.google.maps.Marker({
        position: { lat: rep.lat, lng: rep.lng },
        map,
        title: rep.name,
      });

      const bubble = new window.google.maps.InfoWindow({
        content: `<div style="font-size:12px;color:#020617">
          <strong>${rep.name}</strong><br/>
          آخر ظهور: ${rep.lastSeen}<br/>
          الحالة: ${rep.status === 'online' ? 'متصل' : 'غير متصل'}
        </div>`,
      });

      marker.addListener('click', () => bubble.open({ map, anchor: marker }));
    });

    setMapLoaded(true);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-title">خريطة حركة المندوبين</div>
          <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>
            لقطة حية (أو شبه حية) لمواقع المندوبين في الميدان، مع إمكانية الربط لاحقًا بالزيارات والـ geofencing.
          </p>
        </div>
        <span className="chip">Google Maps • Snapshot</span>
      </header>

      <section className="card-grid">
        <article className="card">
          <div className="card-header">
            <span>ملخص الحالة الآن</span>
          </div>
          <ul style={{ marginTop: 6, paddingLeft: 16, fontSize: 13 }}>
            <li>عدد المندوبين الأونلاين الآن: ٢</li>
            <li>مندوب واحد لم يحدّث موقعه منذ أكثر من ٦٠ دقيقة.</li>
            <li>يمكن ربط هذه الشاشة مستقبلاً بتقارير التأخير وتغطية التيريتوري.</li>
          </ul>
        </article>
      </section>

      <section style={{ marginTop: 12 }}>
        <div className="map-shell">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {!mapLoaded && !error && (
            <div className="map-fallback">
              جاري تحميل خرائط Google… تأكد أن متصل بالإنترنت وأن الـ API key مفعّل.
            </div>
          )}
          {error && <div className="map-fallback">{error}</div>}
        </div>
      </section>
    </>
  );
}
