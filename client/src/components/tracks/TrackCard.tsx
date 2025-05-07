import { Link } from "wouter";
import { PlayIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useState } from "react";
import { Track, User } from "@shared/schema";
import { formatTime } from "@/lib/utils";
import Waveform from "./Waveform";

interface TrackCardProps {
  track: Track & { user: User };
  className?: string;
}

export default function TrackCard({ track, className }: TrackCardProps) {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCurrentTrack = currentTrack?.id === track.id;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCurrentTrack && isPlaying) {
      // If this track is already playing, do nothing or pause
      return;
    }
    
    playTrack(track);
  };
  
  return (
    <div 
      className={cn(
        "bg-card rounded-lg overflow-hidden track-card group", 
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/track/${track.id}`}>
        <a className="block">
          <div className="relative">
            <img 
              src={track.coverArt || "https://via.placeholder.com/400x300"} 
              alt={`${track.title} cover art`} 
              className="w-full h-40 object-cover"
            />
            
            <div className="absolute inset-0 bg-black/30 opacity-0 track-overlay transition-opacity flex items-center justify-center">
              <button 
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center"
                onClick={handlePlayClick}
              >
                <PlayIcon />
              </button>
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="font-semibold text-card-foreground truncate">{track.title}</h3>
            <p className="text-muted-foreground text-sm truncate">{track.user.displayName}</p>
            
            <Waveform 
              waveformData={track.waveformData} 
              active={isCurrentTrack}
              className="mt-3 mb-2" 
            />
            
            <div className="flex justify-between items-center mt-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <PlayIcon className="h-3 w-3" />
                  <span>{track.plays}</span>
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <HeartIcon className="h-3 w-3" />
                  <span>
                    {/* We would fetch the actual like count here */}
                    {Math.floor(Math.random() * 100)}
                  </span>
                </span>
              </div>
              <span className="text-muted-foreground">{formatTime(track.duration / 1000)}</span>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
