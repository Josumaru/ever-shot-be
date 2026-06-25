import { auth } from "@/lib/auth";
import { apiError, apiSuccess, apiUnauthorized } from "@/lib/api-response";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return apiUnauthorized();

    return apiSuccess({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch user",
    );
  }
}
