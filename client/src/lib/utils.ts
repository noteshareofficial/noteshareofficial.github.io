import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a timestamp in seconds to a string in the format mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  if (!date) return "";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Generates waveform data from an audio file
 */
export async function generateWaveformData(audioFile: File): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioData = await audioContext.decodeAudioData(e.target!.result as ArrayBuffer);
        
        // Get audio channel data (mono or first channel of stereo)
        const channelData = audioData.getChannelData(0);
        
        // Number of bars to generate
        const numBars = 30;
        
        // Calculate samples per bar
        const samplesPerBar = Math.floor(channelData.length / numBars);
        
        // Generate waveform data
        const waveformData = [];
        for (let i = 0; i < numBars; i++) {
          let sum = 0;
          for (let j = 0; j < samplesPerBar; j++) {
            const index = i * samplesPerBar + j;
            if (index < channelData.length) {
              sum += Math.abs(channelData[index]);
            }
          }
          
          // Calculate average amplitude for this segment
          const average = sum / samplesPerBar;
          
          // Scale to a reasonable height (5px to 35px)
          const scaledHeight = Math.floor(average * 300) + 5;
          const clampedHeight = Math.min(Math.max(scaledHeight, 5), 35);
          
          waveformData.push(clampedHeight);
        }
        
        resolve(waveformData);
      } catch (error) {
        console.error("Error generating waveform data:", error);
        // Fallback to random heights if there's an error
        const fallbackData = Array(30).fill(0).map(() => Math.floor(Math.random() * 30) + 5);
        resolve(fallbackData);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading audio file:", error);
      // Fallback to random heights if there's an error
      const fallbackData = Array(30).fill(0).map(() => Math.floor(Math.random() * 30) + 5);
      resolve(fallbackData);
    };
    
    reader.readAsArrayBuffer(audioFile);
  });
}
