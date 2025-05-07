import TrackCard from "./TrackCard";
import { useQuery } from "@tanstack/react-query";
import { Track, User } from "@shared/schema";
import { useEffect, useState } from "react";
import { audioDB, authDB } from "@/lib/indexedDb";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackGridProps {
  title: string;
  viewAllLink?: string;
  fetchKey: "trending" | "latest" | "byGenre" | "byUser";
  genreId?: string;
  userId?: number;
  limit?: number;
}

export default function TrackGrid({ 
  title, 
  viewAllLink,
  fetchKey,
  genreId,
  userId,
  limit = 4
}: TrackGridProps) {
  const [tracks, setTracks] = useState<(Track & { user: User })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        let trackList: Track[] = [];
        
        // Fetch tracks based on key
        switch (fetchKey) {
          case "trending":
            trackList = await audioDB.getTrendingTracks(limit);
            break;
          case "latest":
            trackList = await audioDB.getLatestTracks(limit);
            break;
          case "byGenre":
            if (genreId) {
              trackList = await audioDB.getTracksByGenre(genreId);
              trackList = trackList.slice(0, limit);
            }
            break;
          case "byUser":
            if (userId) {
              trackList = await audioDB.getTracksByUserId(userId);
              trackList = trackList.slice(0, limit);
            }
            break;
        }
        
        // Fetch user data for each track
        const tracksWithUsers = await Promise.all(
          trackList.map(async (track) => {
            const user = await authDB.getUserById(track.userId);
            return {
              ...track,
              user: user!
            };
          })
        );
        
        setTracks(tracksWithUsers);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch tracks"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
  }, [fetchKey, genreId, userId, limit]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-poppins">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
            <span>View All</span>
            <ChevronRightIcon className="h-4 w-4" />
          </a>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <TrackCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-muted-foreground">
          Failed to load tracks. Please try again later.
        </div>
      ) : tracks.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No tracks found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </section>
  );
}

function TrackCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
