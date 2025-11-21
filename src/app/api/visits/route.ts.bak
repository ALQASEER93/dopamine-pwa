
import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema(
  {
    repName: String,
    accountName: String,
    status: String,
    durationMinutes: Number,
    startLat: Number,
    startLng: Number,
    endLat: Number,
    endLng: Number,
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

const VisitModel = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

export async function GET() {
  await dbConnect();
  const visits = await VisitModel.find().sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ visits });
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();

  const visit = await VisitModel.create(body);
  return NextResponse.json(visit, { status: 201 });
}
