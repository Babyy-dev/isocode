import { getSession } from "@/features/auth/session";
import { canAccess } from "@/features/auth/access";
import { dmsRows } from "@/features/dms-export/columns";
import { toCsv } from "@/features/dms-export/csv";
import { bookingsCreatedOn } from "@/features/dms-export/repository";
import { endOfIndiaDate } from "@/features/pricing/validate-price";
import { indiaDate } from "@/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };

/** GET /api/admin/dms-export?date=YYYY-MM-DD → that India day's leads as CSV (admins only). */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401, headers: noStore });
  if (!canAccess(session.user.role, ["admin"]))
    return Response.json({ error: "Admins only." }, { status: 403, headers: noStore });

  const date = new URL(request.url).searchParams.get("date") ?? indiaDate();
  if (!isPastOrToday(date))
    return Response.json({ error: "Use a valid date that is today or earlier." }, { status: 400, headers: noStore });

  const { header, rows } = dmsRows(await bookingsCreatedOn(date));
  // The BOM lets Excel read Hindi names as UTF-8.
  return new Response(`﻿${toCsv(header, rows)}`, {
    headers: {
      ...noStore,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="company-a-dms-leads-${date}.csv"`,
    },
  });
}

function isPastOrToday(date: string) {
  try {
    endOfIndiaDate(date); // throws on anything but a real YYYY-MM-DD date
  } catch {
    return false;
  }
  return date <= indiaDate();
}
