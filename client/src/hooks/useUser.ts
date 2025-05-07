import { useState, useCallback } from "react";
import { authDB, audioDB } from "@/lib/indexedDb";
import { User } from "@shared/schema";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useUser() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchUserById = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      return await authDB.getUserById(userId);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchUserByUsername = useCallback(async (username: string) => {
    try {
      setIsLoading(true);
      return await authDB.getUserByUsername(username);
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to update your profile",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsLoading(true);
      return await authDB.updateUser({
        ...currentUser,
        ...userData,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);
  
  const followUser = useCallback(async (userId: number) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return null;
    }
    
    if (currentUser.id === userId) {
      toast({
        title: "Cannot follow yourself",
        description: "You cannot follow your own account",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsLoading(true);
      return await audioDB.addFollow({
        followerId: currentUser.id,
        followedId: userId,
      });
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);
  
  const unfollowUser = useCallback(async (userId: number) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to unfollow users",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      await audioDB.removeFollow(currentUser.id, userId);
      return true;
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);
  
  const toggleFollow = useCallback(async (userId: number) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const isFollowing = await audioDB.isFollowing(currentUser.id, userId);
      
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      
      return !isFollowing;
    } catch (error) {
      console.error("Error toggling follow:", error);
      throw error;
    }
  }, [currentUser, followUser, unfollowUser, toast]);
  
  const isFollowing = useCallback(async (userId: number) => {
    if (!currentUser) return false;
    
    try {
      return await audioDB.isFollowing(currentUser.id, userId);
    } catch (error) {
      console.error("Error checking if following:", error);
      return false;
    }
  }, [currentUser]);
  
  const getFollowers = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      const follows = await audioDB.getFollowsByFollowedId(userId);
      
      // Fetch user data for each follower
      const followers = await Promise.all(
        follows.map(async (follow) => {
          const user = await authDB.getUserById(follow.followerId);
          return user;
        })
      );
      
      return followers.filter(Boolean) as User[];
    } catch (error) {
      console.error("Error getting followers:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getFollowing = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      const follows = await audioDB.getFollowsByFollowerId(userId);
      
      // Fetch user data for each followed user
      const following = await Promise.all(
        follows.map(async (follow) => {
          const user = await authDB.getUserById(follow.followedId);
          return user;
        })
      );
      
      return following.filter(Boolean) as User[];
    } catch (error) {
      console.error("Error getting following:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isLoading,
    fetchUserById,
    fetchUserByUsername,
    updateProfile,
    followUser,
    unfollowUser,
    toggleFollow,
    isFollowing,
    getFollowers,
    getFollowing
  };
}
