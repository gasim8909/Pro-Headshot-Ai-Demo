import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user information
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to view headshots",
        },
        { status: 401 },
      );
    }

    // Add cache control headers to allow browser caching
    const headers = new Headers();
    headers.append("Cache-Control", "private, max-age=300"); // 5 minutes

    // Get all headshots for the user, ordered by most recent first
    const { data, error } = await supabase
      .from("user_headshots")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching headshots:", error);
      return NextResponse.json(
        {
          error: "DATABASE_ERROR",
          message: "Failed to fetch headshots",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        headshots: data || [],
        timestamp: Date.now(),
      },
      { headers },
    );
  } catch (error) {
    console.error("Error in list headshots API:", error);
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "An unexpected error occurred",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
