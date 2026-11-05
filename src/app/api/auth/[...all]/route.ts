import { getAuth } from "@/features/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  try {
    const auth = await getAuth();
    const response = await auth.handler(request);
    response.headers.set("Cache-Control", "private, no-store");
    const retryAfter = response.headers.get("X-Retry-After");
    if (response.status === 429 && retryAfter) {
      response.headers.set("Retry-After", retryAfter);
    }
    return response;
  } catch {
    return Response.json(
      {
        message: "Authentication is temporarily unavailable. Please try again.",
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

export { handle as GET, handle as POST };
