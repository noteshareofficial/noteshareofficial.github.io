import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface GenreCardProps {
  genre: string;
  imageUrl: string;
  className?: string;
}

// Image URLs for different genres
const genreImages: Record<string, string> = {
  "Electronic": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&auto=format&fit=crop",
  "Hip Hop": "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=300&h=200&auto=format&fit=crop",
  "Rock": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=200&auto=format&fit=crop",
  "Jazz": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=200&auto=format&fit=crop",
  "Classical": "https://images.unsplash.com/photo-1466232373731-46205f0b668e?w=300&h=200&auto=format&fit=crop",
  "Reggae": "https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=300&h=200&auto=format&fit=crop",
  "Pop": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=200&auto=format&fit=crop",
  "R&B": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&auto=format&fit=crop",
  "Country": "https://images.unsplash.com/photo-1570751485205-b664dd5c9d8a?w=300&h=200&auto=format&fit=crop",
  "Folk": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=200&auto=format&fit=crop",
  "Blues": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=200&auto=format&fit=crop",
  "Metal": "https://images.unsplash.com/photo-1551909904-8d517c5d1b34?w=300&h=200&auto=format&fit=crop",
  "Ambient": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=200&auto=format&fit=crop"
};

export default function GenreCard({ genre, imageUrl, className }: GenreCardProps) {
  // Use provided imageUrl or fallback to the mapping
  const imageSource = imageUrl || genreImages[genre] || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=200&auto=format&fit=crop";
  
  return (
    <Link href={`/discover?genre=${encodeURIComponent(genre)}`}>
      <a className={cn(
        "bg-card rounded-lg overflow-hidden relative h-28 group block",
        className
      )}>
        <img 
          src={imageSource} 
          alt={`${genre} genre`} 
          className="w-full h-full object-cover brightness-50 group-hover:brightness-75 transition-all"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold text-lg">{genre}</span>
        </div>
      </a>
    </Link>
  );
}
