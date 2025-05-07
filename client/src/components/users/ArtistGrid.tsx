import { useState, useEffect } from "react";
import ArtistCard from "./ArtistCard";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@shared/schema";
import { authDB, audioDB } from "@/lib/indexedDb";
import { useAuth } from "@/hooks/useAuth";

interface ArtistGridProps {
  title: string;
  viewAllLink?: string;
  limit?: number;
}

export default function ArtistGrid({ 
  title, 
  viewAllLink,
  limit = 6
}: ArtistGridProps) {
  const { user: currentUser } = useAuth();
  const [artists, setArtists] = useState<(User & { followersCount: number, isFollowing: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        // Get all users
        const allUsers = await authDB.getAllUsers();
        
        // Calculate followers for each user
        const usersWithFollowers = await Promise.all(
          allUsers.map(async (user) => {
            const followers = await audioDB.getFollowsByFollowedId(user.id);
            const isFollowing = currentUser 
              ? await audioDB.isFollowing(currentUser.id, user.id)
              : false;
            
            return {
              ...user,
              followersCount: followers.length,
              isFollowing
            };
          })
        );
        
        // Sort by followers count and take only the limit
        const sortedUsers = usersWithFollowers
          .sort((a, b) => b.followersCount - a.followersCount)
          .slice(0, limit);
        
        setArtists(sortedUsers);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch artists"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtists();
  }, [currentUser, limit]);
  
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
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <ArtistCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-muted-foreground">
          Failed to load artists. Please try again later.
        </div>
      ) : artists.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No artists found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {artists.map((artist) => (
            <ArtistCard 
              key={artist.id} 
              user={artist} 
              followersCount={artist.followersCount}
              isFollowing={artist.isFollowing}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ArtistCardSkeleton() {
  return (
    <div className="text-center">
      <Skeleton className="mx-auto w-24 h-24 rounded-full mb-2" />
      <Skeleton className="h-5 w-20 mx-auto mb-1" />
      <Skeleton className="h-4 w-16 mx-auto" />
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
