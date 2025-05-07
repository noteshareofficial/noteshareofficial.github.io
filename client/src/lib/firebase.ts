import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { User } from "@shared/schema";
import { isGitHubPages } from "./staticApiService";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase - only if not in GitHub Pages mode or if required keys exist
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  // Only initialize Firebase if we're not in GitHub Pages mode
  if (!isGitHubPages()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.log("GitHub Pages mode: Skipping Firebase initialization");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create mock versions if needed
  auth = null;
  googleProvider = null;
}

// Sign in with Google popup
export const signInWithGoogle = async (): Promise<User> => {
  // For GitHub Pages static deployment, return a mock user
  if (isGitHubPages()) {
    console.log("Using mock login for GitHub Pages");
    // Return a demo user
    const demoUser: User = {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      password: "", // Not stored
      displayName: "Demo User",
      bio: "This is a demo account for GitHub Pages deployment",
      profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=demo",
      isAdmin: false,
      createdAt: new Date()
    };
    return demoUser;
  }
  
  try {
    // Check if Firebase is initialized
    if (!auth || !googleProvider) {
      throw new Error("Firebase authentication is not initialized");
    }
    
    // Normal Firebase auth flow
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Convert Firebase user to our User type
    const appUser: User = {
      id: parseInt(user.uid.substring(0, 8), 16) || 1, // Convert part of UID to number
      username: user.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user',
      email: user.email || '',
      password: '', // Not stored
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      bio: null,
      profilePicture: user.photoURL || null,
      isAdmin: false, // Default to false
      createdAt: new Date()
    };
    
    // Here you would typically create/update the user in your database
    // For now, just return the user object
    return appUser;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  // For GitHub Pages static deployment, just log a message
  if (isGitHubPages()) {
    console.log("Mock sign-out for GitHub Pages");
    return;
  }
  
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get the current authenticated user
export const getCurrentAuthUser = (): Promise<FirebaseUser | null> => {
  // For GitHub Pages static deployment, return null
  if (isGitHubPages()) {
    console.log("Mock getCurrentAuthUser for GitHub Pages");
    return Promise.resolve(null);
  }
  
  if (!auth) {
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    // Cast to the correct type with non-null assertion since we already checked above
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Export auth instance for direct use
export { auth };