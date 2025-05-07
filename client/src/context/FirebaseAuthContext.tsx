import React, { createContext, useState, useEffect, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { 
  auth,
  signInWithGoogle, 
  signOutUser, 
  getCurrentAuthUser 
} from "@/lib/firebase";
import { User } from "@shared/schema";
import { isGitHubPages } from "@/lib/staticApiService";

interface FirebaseAuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

export const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // If in GitHub Pages mode, don't try to load a user automatically
        if (isGitHubPages()) {
          console.log("GitHub Pages mode: Skipping automatic user loading");
          setIsLoading(false);
          return;
        }
        
        // Get current Firebase user
        const currentUser = await getCurrentAuthUser();
        setFirebaseUser(currentUser);
        
        if (currentUser) {
          // Convert Firebase user to our User type
          const appUser: User = {
            id: parseInt(currentUser.uid.substring(0, 8), 16) || 1, // Convert part of UID to number
            username: currentUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user',
            email: currentUser.email || '',
            password: '', // Not stored
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            bio: null,
            profilePicture: currentUser.photoURL || null,
            isAdmin: false, // Would typically be fetched from your database
            createdAt: new Date(currentUser.metadata.creationTime || Date.now())
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only set up auth state listener if auth is available
    let unsubscribe = () => {};
    
    if (auth) {
      // Listen for auth state changes
      unsubscribe = auth.onAuthStateChanged((user) => {
        setFirebaseUser(user);
        loadUser();
      });
    } else {
      // No auth available, so just load user directly
      loadUser();
    }
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);
  
  // Google login handler
  const loginWithGoogle = useCallback(async (): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      return user;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
      throw error;
    }
  }, []);
  
  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!user,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};