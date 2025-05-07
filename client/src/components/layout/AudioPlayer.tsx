import { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, ShuffleIcon, RepeatIcon, VolumeIcon, Volume2Icon, ListIcon, HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Link } from "wouter";
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function AudioPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    seekTo, 
    volume, 
    setVolume,
    duration,
    currentTime,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    shuffle,
    repeat,
  } = useAudioPlayer();
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  
  // Refs for progress bar interaction
  const progressRef = useRef<HTMLDivElement>(null);
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentTrack) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
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
  
  // Load like status when track changes
  useEffect(() => {
    if (currentTrack && user) {
      // Here you would fetch the like status from your API
      setIsLiked(false);
    }
  }, [currentTrack, user]);
  
  if (!currentTrack) return null;
  
  return (
    <div className="bg-sidebar border-t border-sidebar-border py-2 px-4 md:px-8 sticky bottom-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 w-64 flex-shrink-0">
          <Link href={`/track/${currentTrack.id}`}>
            <a>
              <img 
                src={currentTrack.coverArt || "https://via.placeholder.com/60x60"} 
                alt="Now playing" 
                className="w-12 h-12 rounded object-cover"
              />
            </a>
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link href={`/track/${currentTrack.id}`}>
              <a className="text-foreground text-sm font-medium truncate block hover:underline">
                {currentTrack.title}
              </a>
            </Link>
            <Link href={`/profile/${currentTrack.user.username}`}>
              <a className="text-muted-foreground text-xs truncate block hover:underline">
                {currentTrack.user.displayName}
              </a>
            </Link>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-muted-foreground hover:text-foreground",
              isLiked && "text-accent hover:text-accent/80"
            )}
            onClick={handleLikeClick}
          >
            <HeartIcon className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
          </Button>
        </div>
        
        <div className="hidden md:flex flex-col flex-1 gap-1">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                shuffle && "text-primary"
              )}
              onClick={toggleShuffle}
            >
              <ShuffleIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={previousTrack}
            >
              <SkipBackIcon className="h-5 w-5" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={nextTrack}
            >
              <SkipForwardIcon className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                repeat && "text-primary"
              )}
              onClick={toggleRepeat}
            >
              <RepeatIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">{formatTime(currentTime)}</span>
            <div 
              ref={progressRef}
              className="audio-progress flex-1 cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="audio-progress-fill" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs">{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground md:hidden"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground md:hidden"
            onClick={nextTrack}
          >
            <SkipForwardIcon className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              {volume > 0.5 ? (
                <Volume2Icon className="h-4 w-4" />
              ) : (
                <VolumeIcon className="h-4 w-4" />
              )}
            </Button>
            
            <Slider
              className="w-24"
              defaultValue={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hidden md:flex"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
