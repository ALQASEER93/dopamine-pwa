import type { VisitLocationPoint } from "./visit";

export type CustomerType = "pharmacy" | "doctor" | "hospital" | "other";

export interface Customer {
  _id: string;
  name: string;
  type: CustomerType;
  specialty?: string;
  region?: string;
  location?: VisitLocationPoint;
  phone?: string | null;
  repName?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}
