import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { initAuthDB, initAudioDB } from "@/lib/indexedDb";
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';

// Entry point component that doesn't rely on contexts immediately
function InitialApp() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-3xl font-bold mb-4">NoteShare</h1>
        <p className="mb-4">A music sharing platform</p>
        <div className="animate-pulse bg-primary/20 rounded-md p-4">
          Loading application...
        </div>
      </div>
    </div>
  );
}

// Create root outside of async function so we can render loading state immediately
const root = createRoot(document.getElementById("root")!);

// Render initial loading state
root.render(<InitialApp />);

// Initialize databases and then render the real app
(async () => {
  try {
    console.log("Initializing databases...");
    await initAuthDB();
    await initAudioDB();
    console.log("Databases initialized successfully");
    
    // Dynamically import components to prevent them from loading too early
    const { AudioPlayerProvider } = await import("./context/AudioPlayerContext");
    
    // Render the full application
    root.render(
      <QueryClientProvider client={queryClient}>
        <FirebaseAuthProvider>
          <AudioPlayerProvider>
            <App />
          </AudioPlayerProvider>
        </FirebaseAuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("Failed to initialize application:", error);
    
    // Render error state
    root.render(
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-destructive">Error</h1>
          <p className="mb-4">Failed to initialize application</p>
          <div className="bg-destructive/10 text-left rounded-md p-4 overflow-auto max-h-60">
            <pre className="text-xs">{String(error)}</pre>
          </div>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
})();
