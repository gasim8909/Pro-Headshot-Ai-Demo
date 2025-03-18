import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// This endpoint is disabled - users cannot update their subscription tier directly
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "This feature has been disabled. Please contact support to change your subscription.",
    },
    { status: 403 },
  );
}
