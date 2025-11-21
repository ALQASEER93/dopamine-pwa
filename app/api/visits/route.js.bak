import { NextResponse } from 'next/server';

// تخزين مؤقت في الذاكرة (in-memory)
// ⚠ ملاحظة: على Vercel ممكن يتم تصفيرها أحياناً عند إعادة تشغيل السيرفر.
let visitsMemory = [];
let nextId = 1;

export const dynamic = 'force-dynamic'; // تأكد أن Next.js لا يحاول عمل cache ثابت

// GET /api/visits
// يرجّع آخر الزيارات المخزنة في الذاكرة
export async function GET() {
  try {
    // ممكن مستقبلاً نضيف query للفلترة (مثلاً limit أو date range)
    const items = [...visitsMemory].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return NextResponse.json(
      {
        ok: true,
        count: items.length,
        items,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('GET /api/visits failed:', err);
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load visits',
      },
      { status: 500 },
    );
  }
}

// POST /api/visits
// يستقبل بيانات الزيارة من /field-visit ويحفظها في الذاكرة
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      source = 'field-visit',
      startedAt,
      endedAt,
      durationMinutes,
      startLocation = null,
      endLocation = null,
      notes = null,
      meta = null,
    } = body || {};

    // تحقق بسيط على المدّة
    const numericDuration = Number(durationMinutes || 0);
    if (!numericDuration || Number.isNaN(numericDuration) || numericDuration < 1) {
      return NextResponse.json(
        {
          ok: false,
          message: 'durationMinutes must be >= 1 (visit must be created via timer).',
        },
        { status: 400 },
      );
    }

    // نبني الزيارة ونخزنها في الذاكرة
    const now = new Date().toISOString();

    const visit = {
      id: String(nextId++),
      source,
      startedAt: startedAt || null,
      endedAt: endedAt || null,
      durationMinutes: numericDuration,
      startLocation: normalizeLocation(startLocation),
      endLocation: normalizeLocation(endLocation),
      notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
      meta: meta && typeof meta === 'object' ? meta : null,
      createdAt: now,
    };

    visitsMemory.push(visit);

    return NextResponse.json(
      {
        ok: true,
        id: visit.id,
        visit,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('POST /api/visits failed:', err);
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to save visit',
      },
      { status: 500 },
    );
  }
}

// دالة مساعدة لتنظيف بيانات الـ GPS
function normalizeLocation(loc) {
  if (!loc || typeof loc !== 'object') return null;
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  const accuracy =
    loc.accuracy != null && !Number.isNaN(Number(loc.accuracy))
      ? Number(loc.accuracy)
      : null;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    lat,
    lng,
    accuracy,
  };
}
