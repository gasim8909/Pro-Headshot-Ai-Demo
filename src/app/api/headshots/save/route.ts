import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, style, description } = await request.json();
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
          message: "You must be logged in to save headshots",
        },
        { status: 401 },
      );
    }

    // Validate input
    if (!imageUrl) {
      return NextResponse.json(
        {
          error: "MISSING_IMAGE_URL",
          message: "Image URL is required",
        },
        { status: 400 },
      );
    }

    // Save the headshot to the database
    const { data, error } = await supabase
      .from("user_headshots")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        style: style || "professional",
        description: description || "",
      })
      .select();

    if (error) {
      console.error("Error saving headshot:", error);
      return NextResponse.json(
        {
          error: "DATABASE_ERROR",
          message: "Failed to save headshot",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Headshot saved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in save headshot API:", error);
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
