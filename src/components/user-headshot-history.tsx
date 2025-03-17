"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Download, Trash2, AlertCircle } from "lucide-react";
import { Shimmer } from "./ui/shimmer";
import { LazyImage } from "./ui/lazy-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type Headshot = {
  id: string;
  image_url: string;
  style: string;
  created_at: string;
  description?: string;
};

export default function UserHeadshotHistory({ userId }: { userId: string }) {
  const [headshots, setHeadshots] = useState<Headshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use sessionStorage to cache headshots data
  const fetchHeadshots = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have cached data in sessionStorage
      const cachedData = sessionStorage.getItem(`headshots-${userId}`);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;

        // Use cache if it's less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          console.log("Using cached headshots data");
          setHeadshots(data);
          setIsLoading(false);
          return;
        }
      }

      // If no valid cache, fetch from API
      console.log("Fetching headshots from API");
      const response = await fetch("/api/headshots/list", {
        cache: "default", // Use browser's standard cache behavior
        headers: {
          "Cache-Control": "max-age=300", // 5 minutes
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch headshots: ${response.status}`);
      }

      const data = await response.json();
      const headshotsData = data.headshots || [];

      // Save to sessionStorage with timestamp
      sessionStorage.setItem(
        `headshots-${userId}`,
        JSON.stringify({
          data: headshotsData,
          timestamp: data.timestamp || Date.now(),
        }),
      );

      setHeadshots(headshotsData);
    } catch (err) {
      console.error("Error fetching headshots:", err);
      setError("Failed to load your headshot history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadshots();

    // Clear cache on component unmount if user logs out
    return () => {
      // We don't clear the cache here to keep it between tab switches
    };
  }, [userId]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch("/api/headshots/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deleteId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete headshot: ${response.status}`);
      }

      // Remove the deleted headshot from the state
      setHeadshots(headshots.filter((headshot) => headshot.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting headshot:", err);
      setDeleteError("Failed to delete headshot. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <div className="aspect-[3/4] relative bg-gray-200">
                <Shimmer className="w-full h-full" />
              </div>
              <CardContent className="p-4">
                <Shimmer className="h-4 w-3/4 mb-2" />
                <Shimmer className="h-4 w-1/2" />
                <div className="flex justify-between mt-3">
                  <Shimmer className="h-3 w-1/4" />
                  <div className="flex gap-2">
                    <Shimmer className="h-6 w-6 rounded-full" />
                    <Shimmer className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        {error}
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={fetchHeadshots}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (headshots.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
            <circle cx="12" cy="13" r="3"></circle>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No saved headshots yet
        </h3>
        <p className="text-gray-500 mb-4">
          Generate headshots and save them to see them here
        </p>
        <Button asChild>
          <a href="/generate">Generate Headshots</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Headshot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this headshot? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{deleteError}</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className={isDeleting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {headshots.map((headshot) => (
          <Card
            key={headshot.id}
            className="overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <LazyImage
                src={headshot.image_url}
                alt={headshot.description || "AI Headshot"}
                className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                aspectRatio="aspect-[3/4]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                <span className="text-white font-medium text-sm">
                  {headshot.style?.charAt(0).toUpperCase() +
                    headshot.style?.slice(1) || "Professional"}{" "}
                  Style
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">
                  {new Date(headshot.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(headshot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    asChild
                  >
                    <a href={headshot.image_url} download="ai-headshot.jpg">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              {headshot.description && (
                <p className="text-sm text-gray-500 truncate">
                  {headshot.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
