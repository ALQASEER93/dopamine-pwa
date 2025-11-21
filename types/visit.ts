export interface VisitLocationPoint {
  lat: number;
  lng: number;
  accuracy?: number | null;
}

export interface VisitLocation {
  start?: VisitLocationPoint | null;
  end?: VisitLocationPoint | null;
}

export interface Visit {
  _id?: string;
  repId: string;
  customerId?: string | null;
  customerName: string;
  visitType?: string;
  notes?: string;
  status?: string;
  visitDate?: string;
  createdAt?: string;
  updatedAt?: string;
  location?: VisitLocation | null;
  elapsedSeconds?: number | null;
}

export interface StatsData {
  totalVisitsToday: number;
  totalVisitsThisWeek: number;
  activeRepsNow: number;
  avgVisitDurationMinutes: number;
}

export interface StatsResponse {
  success: boolean;
  data?: StatsData;
  error?: string;
}
