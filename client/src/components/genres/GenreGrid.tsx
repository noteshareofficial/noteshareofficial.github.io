import { useEffect, useState } from "react";
import GenreCard from "./GenreCard";
import { Skeleton } from "@/components/ui/skeleton";
import { audioDB } from "@/lib/indexedDb";

interface GenreGridProps {
  title: string;
  viewAllLink?: string;
  limit?: number;
}

// Genre list with image URLs
const genres = [
  { name: "Electronic", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&auto=format&fit=crop" },
  { name: "Hip Hop", image: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=300&h=200&auto=format&fit=crop" },
  { name: "Rock", image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=200&auto=format&fit=crop" },
  { name: "Jazz", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=200&auto=format&fit=crop" },
  { name: "Classical", image: "https://images.unsplash.com/photo-1466232373731-46205f0b668e?w=300&h=200&auto=format&fit=crop" },
  { name: "Reggae", image: "https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=300&h=200&auto=format&fit=crop" },
  { name: "Pop", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=200&auto=format&fit=crop" },
  { name: "R&B", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&auto=format&fit=crop" },
  { name: "Country", image: "https://images.unsplash.com/photo-1570751485205-b664dd5c9d8a?w=300&h=200&auto=format&fit=crop" },
  { name: "Folk", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=200&auto=format&fit=crop" },
  { name: "Blues", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=200&auto=format&fit=crop" },
  { name: "Metal", image: "https://images.unsplash.com/photo-1551909904-8d517c5d1b34?w=300&h=200&auto=format&fit=crop" },
  { name: "Ambient", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=200&auto=format&fit=crop" }
];

export default function GenreGrid({
  title, 
  viewAllLink,
  limit = 6
}: GenreGridProps) {
  const [popularGenres, setPopularGenres] = useState<{ name: string; image: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchGenreCounts = async () => {
      setIsLoading(true);
      try {
        // Get all tracks
        const allTracks = await audioDB.getAllTracks();
        
        // Count tracks by genre
        const genreCounts: Record<string, number> = {};
        allTracks.forEach(track => {
          if (track.genre) {
            genreCounts[track.genre] = (genreCounts[track.genre] || 0) + 1;
          }
        });
        
        // Map genre counts with genre info
        const genresWithCount = genres.map(genre => ({
          ...genre,
          count: genreCounts[genre.name] || 0
        }));
        
        // Sort by track count and limit
        const sortedGenres = genresWithCount
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
        
        setPopularGenres(sortedGenres);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch genres"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGenreCounts();
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-muted-foreground">
          Failed to load genres. Please try again later.
        </div>
      ) : popularGenres.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No genres found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularGenres.map((genre) => (
            <GenreCard 
              key={genre.name} 
              genre={genre.name} 
              imageUrl={genre.image} 
            />
          ))}
        </div>
      )}
    </section>
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
