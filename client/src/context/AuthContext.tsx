import React, { createContext, useState, useEffect, useCallback } from "react";
import { User, InsertUser } from "@shared/schema";
import { registerUser, loginUser, logoutUser, getCurrentUser, updateUserProfile } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  register: (userData: Omit<InsertUser, "isAdmin">) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Login handler
  const login = useCallback(
    async (usernameOrEmail: string, password: string): Promise<User> => {
      setIsLoading(true);
      try {
        const loggedInUser = await loginUser(usernameOrEmail, password);
        setUser(loggedInUser);
        return loggedInUser;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  
  // Register handler
  const register = useCallback(
    async (userData: Omit<InsertUser, "isAdmin">): Promise<User> => {
      setIsLoading(true);
      try {
        const newUser = await registerUser(userData);
        setUser(newUser);
        return newUser;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  
  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
      throw error;
    }
  }, []);
  
  // Update profile handler
  const updateProfile = useCallback(
    async (userData: Partial<User>): Promise<User> => {
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      setIsLoading(true);
      try {
        const updatedUser = await updateUserProfile(user.id, userData);
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
