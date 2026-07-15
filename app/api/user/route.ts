import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

/**
 * GET /api/user
 * Returns the currently authorized user's profile info from Webflow.
 */
export const GET = withAuth(async (client) => {
  const user = await client.token.authorizedBy();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});
