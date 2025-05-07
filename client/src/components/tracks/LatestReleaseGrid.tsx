import LatestReleaseCard from "./LatestReleaseCard";
import { Track, User } from "@shared/schema";
import { useEffect, useState } from "react";
import { audioDB, authDB } from "@/lib/indexedDb";
import { Skeleton } from "@/components/ui/skeleton";

interface LatestReleaseGridProps {
  title: string;
  viewAllLink?: string;
  limit?: number;
}

export default function LatestReleaseGrid({ 
  title, 
  viewAllLink,
  limit = 2
}: LatestReleaseGridProps) {
  const [tracks, setTracks] = useState<(Track & { user: User })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        // Get latest tracks
        const trackList = await audioDB.getLatestTracks(limit);
        
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
  }, [limit]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <LatestReleaseCardSkeleton key={i} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => (
            <LatestReleaseCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </section>
  );
}

function LatestReleaseCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="sm:w-40 h-40" />
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          
          <Skeleton className="h-4 w-full mt-4 mb-2" />
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
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
