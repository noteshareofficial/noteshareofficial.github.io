import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import { Track, User } from "@shared/schema";
import { audioDB } from "@/lib/indexedDb";

interface AudioPlayerContextType {
  currentTrack: (Track & { user: User }) | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  queue: (Track & { user: User })[];
  playTrack: (track: Track & { user: User }) => void;
  togglePlay: () => void;
  pauseTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track & { user: User }) => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<(Track & { user: User }) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [queue, setQueue] = useState<(Track & { user: User })[]>([]);
  const [playbackHistory, setPlaybackHistory] = useState<(Track & { user: User })[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  // Initialize audio element and Web Audio API
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Set up Web Audio API
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Add event listeners
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleTrackEnded);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('error', handleError);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleTrackEnded);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, []);
  
  // Event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleTrackEnded = () => {
    if (repeat) {
      // Replay the current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(handlePlaybackError);
      }
    } else {
      // Play the next track
      nextTrack();
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleError = (e: Event) => {
    console.error("Audio playback error", e);
    setIsPlaying(false);
  };
  
  const handlePlaybackError = (error: any) => {
    console.error("Playback error:", error);
    setIsPlaying(false);
  };
  
  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Play a track
  const playTrack = useCallback(async (track: Track & { user: User }) => {
    try {
      if (audioRef.current) {
        // Clear current source if exists
        if (audioSourceRef.current) {
          audioSourceRef.current.disconnect();
        }
        
        // If the audio context is suspended (e.g., due to autoplay policies), resume it
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        // Set audio source URL (assuming track.audioUrl is a base64 data URL)
        audioRef.current.src = track.audioUrl;
        
        // Connect to Web Audio API
        if (audioContextRef.current) {
          audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          audioSourceRef.current.connect(audioContextRef.current.destination);
        }
        
        // Start playback
        await audioRef.current.play();
        setIsPlaying(true);
        
        // Set current track and update history
        setCurrentTrack(track);
        setPlaybackHistory(prev => [track, ...prev.filter(t => t.id !== track.id)]);
        
        // Log play to database
        await audioDB.incrementPlays(track.id);
      }
    } catch (error) {
      handlePlaybackError(error);
    }
  }, []);
  
  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(handlePlaybackError);
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);
  
  // Pause track
  const pauseTrack = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);
  
  // Go to next track
  const nextTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    
    let nextTrackIndex: number;
    
    if (shuffle) {
      // Play a random track from the queue
      nextTrackIndex = Math.floor(Math.random() * queue.length);
    } else {
      // Find current track in queue
      const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
      
      // If track is not in queue or is the last one
      if (currentIndex === -1 || currentIndex === queue.length - 1) {
        // Loop back to the start if repeat is enabled, otherwise stop
        if (repeat) {
          nextTrackIndex = 0;
        } else {
          return;
        }
      } else {
        nextTrackIndex = currentIndex + 1;
      }
    }
    
    // Play the next track
    playTrack(queue[nextTrackIndex]);
  }, [currentTrack, queue, shuffle, repeat, playTrack]);
  
  // Go to previous track
  const previousTrack = useCallback(() => {
    if (!currentTrack || playbackHistory.length < 2) return;
    
    // Get the previous track from history (excluding current track)
    const prevTrack = playbackHistory[1];
    playTrack(prevTrack);
  }, [currentTrack, playbackHistory, playTrack]);
  
  // Seek to a specific time
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);
  
  // Toggle shuffle mode
  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);
  
  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setRepeat(prev => !prev);
  }, []);
  
  // Add track to queue
  const addToQueue = useCallback((track: Track & { user: User }) => {
    setQueue(prev => [...prev, track]);
  }, []);
  
  // Remove track from queue
  const removeFromQueue = useCallback((trackId: number) => {
    setQueue(prev => prev.filter(track => track.id !== trackId));
  }, []);
  
  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);
  
  // Automatically add current track to queue if queue is empty
  useEffect(() => {
    if (currentTrack && queue.length === 0) {
      setQueue([currentTrack]);
    }
  }, [currentTrack]);
  
  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        duration,
        currentTime,
        volume,
        shuffle,
        repeat,
        queue,
        playTrack,
        togglePlay,
        pauseTrack,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
