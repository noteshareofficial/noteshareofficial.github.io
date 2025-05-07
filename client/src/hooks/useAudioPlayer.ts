import { useContext } from "react";
import { AudioPlayerContext } from "@/context/AudioPlayerContext";

/**
 * Custom hook to access the AudioPlayer context
 * This must be used within an AudioPlayerProvider
 */
export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  
  return context;
}
