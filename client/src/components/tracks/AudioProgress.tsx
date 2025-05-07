import { useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  isActive: boolean;
  onSeek?: (percent: number) => void;
  showTimestamps?: boolean;
  className?: string;
}

export default function AudioProgress({
  currentTime,
  duration,
  isActive,
  onSeek,
  showTimestamps = true,
  className
}: AudioProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !onSeek) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent);
  };
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div 
        ref={progressRef}
        className="audio-progress cursor-pointer"
        onClick={handleProgressClick}
      >
        <div 
          className={cn(
            "audio-progress-fill", 
            isActive ? "bg-primary" : "bg-muted"
          )} 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {showTimestamps && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
