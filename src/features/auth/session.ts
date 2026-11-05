import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./server";
import { canAccess, safeReturnTo, type UserRole } from "./access";

export async function getSession() {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession(returnTo: string) {
  const session = await getSession();
  if (!session)
    redirect(`/sign-in?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
  return session;
}

export async function requireRole(
  returnTo: string,
  allowed: readonly UserRole[],
) {
  const session = await requireSession(returnTo);
  if (!canAccess(session.user.role, allowed))
    redirect("/account?access=denied");
  return session;
}
