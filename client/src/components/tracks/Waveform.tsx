import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WaveformProps {
  waveformData: string;
  active?: boolean;
  className?: string;
}

export default function Waveform({ waveformData, active = false, className }: WaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!waveformRef.current) return;
    
    // Parse the waveform data (assuming it's a JSON string of heights)
    try {
      const bars = waveformRef.current.querySelectorAll('.waveform-bar');
      const heights = JSON.parse(waveformData) as number[];
      
      bars.forEach((bar, index) => {
        if (index < heights.length) {
          (bar as HTMLElement).style.height = `${heights[index]}px`;
        }
      });
    } catch (error) {
      console.error("Error parsing waveform data:", error);
    }
  }, [waveformData]);
  
  return (
    <div ref={waveformRef} className={cn("waveform", className)}>
      {Array(30).fill(0).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "waveform-bar", 
            active && "bg-primary"
          )} 
          style={{ height: "10px" }} // Default height, will be overridden by useEffect
        />
      ))}
    </div>
  );
}
