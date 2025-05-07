import { Link } from "wouter";
import { PlayIcon, HeartIcon, Share2Icon, MessageSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useState } from "react";
import { Track, User } from "@shared/schema";
import { formatTime } from "@/lib/utils";
import AudioProgress from "./AudioProgress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LatestReleaseCardProps {
  track: Track & { user: User };
  className?: string;
}

export default function LatestReleaseCard({ track, className }: LatestReleaseCardProps) {
  const { playTrack, currentTrack, isPlaying, currentTime, duration, togglePlay } = useAudioPlayer();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  
  const isCurrentTrack = currentTrack?.id === track.id;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };
  
  const handleLikeClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like tracks",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiked(!isLiked);
    // Here you would call your like/unlike API
  };
  
  const handleShareClick = () => {
    // Implement share functionality
    navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`);
    toast({
      title: "Link copied",
      description: "Track link copied to clipboard",
    });
  };
  
  return (
    <div className={cn("bg-card rounded-lg overflow-hidden", className)}>
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-40 h-40">
          <img 
            src={track.coverArt || "https://via.placeholder.com/200x200"} 
            alt={`${track.title} cover art`} 
            className="w-full h-full object-cover"
          />
          
          <button 
            className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            onClick={handlePlayClick}
          >
            {isCurrentTrack && isPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/track/${track.id}`}>
                <a className="font-semibold text-card-foreground text-lg hover:underline">
                  {track.title}
                </a>
              </Link>
              <Link href={`/profile/${track.user.username}`}>
                <a className="text-muted-foreground text-sm flex items-center gap-1 hover:underline">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={track.user.profilePicture} alt={track.user.displayName} />
                    <AvatarFallback>{track.user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{track.user.displayName}</span>
                </a>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isLiked && "text-accent hover:text-accent/80"
                )}
                onClick={handleLikeClick}
              >
                <HeartIcon className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleShareClick}
              >
                <Share2Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3">
            <AudioProgress 
              currentTime={isCurrentTrack ? currentTime : 0}
              duration={track.duration / 1000}
              isActive={isCurrentTrack}
              onSeek={(percent) => {
                if (isCurrentTrack) {
                  // Seek to position
                }
              }}
            />
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
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
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageSquareIcon className="h-3 w-3" />
                <span>
                  {/* We would fetch the actual comment count here */}
                  {Math.floor(Math.random() * 20)}
                </span>
              </span>
            </div>
            <span className="text-xs text-secondary">New</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="4" height="16" x="6" y="4" />
      <rect width="4" height="16" x="14" y="4" />
    </svg>
  );
}
