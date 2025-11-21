import CustomersClient from "./CustomersClient";
import { serverFetch } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

async function fetchInitialCustomers() {
  const res = await serverFetch("/api/customers?page=1&limit=50", {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      success: false,
      data: [],
      page: 1,
      limit: 50,
      total: 0,
    };
  }

  const json = await res.json();
  return json;
}

export default async function CustomersPage() {
  const initial = await fetchInitialCustomers();
  return <CustomersClient initial={initial} />;
}
