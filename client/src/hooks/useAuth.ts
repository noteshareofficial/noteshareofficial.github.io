import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * Custom hook to access the Auth context
 * This must be used within an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
