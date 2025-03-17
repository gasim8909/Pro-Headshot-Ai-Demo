"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Check, Loader2 } from "lucide-react";

interface SaveToHistoryButtonProps {
  image: string;
  style: string;
  description: string;
}

export default function SaveToHistoryButton({
  image,
  style,
  description,
}: SaveToHistoryButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (isSaved) return; // Already saved

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/headshots/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: image,
          style: style,
          description: description,
        }),
      });

      if (response.ok) {
        setIsSaved(true);
      } else {
        console.error("Failed to save headshot");
        setError("Failed to save");
      }
    } catch (error) {
      console.error("Error saving headshot:", error);
      setError("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
        disabled
      >
        <Check className="mr-1 h-3 w-3" /> Saved to History
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant={error ? "destructive" : "secondary"}
      className="w-full text-xs"
      onClick={handleSave}
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Saving...
        </>
      ) : error ? (
        <>Try Again</>
      ) : (
        <>Save to History</>
      )}
    </Button>
  );
}
