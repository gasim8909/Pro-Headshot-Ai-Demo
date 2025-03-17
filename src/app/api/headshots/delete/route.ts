import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
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
          message: "You must be logged in to delete headshots",
        },
        { status: 401 },
      );
    }

    // Validate input
    if (!id) {
      return NextResponse.json(
        {
          error: "MISSING_ID",
          message: "Headshot ID is required",
        },
        { status: 400 },
      );
    }

    // Delete the headshot
    const { error } = await supabase
      .from("user_headshots")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure the user can only delete their own headshots

    if (error) {
      console.error("Error deleting headshot:", error);
      return NextResponse.json(
        {
          error: "DATABASE_ERROR",
          message: "Failed to delete headshot",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Headshot deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete headshot API:", error);
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
