import { useState, useCallback } from "react";
import { audioDB } from "@/lib/indexedDb";
import { Track, Comment, InsertComment } from "@shared/schema";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useTrack() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchTrack = useCallback(async (trackId: number) => {
    try {
      setIsLoading(true);
      return await audioDB.getTrackById(trackId);
    } catch (error) {
      console.error("Error fetching track:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchTracksByUserId = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      return await audioDB.getTracksByUserId(userId);
    } catch (error) {
      console.error("Error fetching user tracks:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchTracksByGenre = useCallback(async (genre: string) => {
    try {
      setIsLoading(true);
      return await audioDB.getTracksByGenre(genre);
    } catch (error) {
      console.error("Error fetching genre tracks:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const likeTrack = useCallback(async (trackId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like tracks",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      await audioDB.addLike({
        userId: user.id,
        trackId,
      });
      return true;
    } catch (error) {
      console.error("Error liking track:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  const unlikeTrack = useCallback(async (trackId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to unlike tracks",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      await audioDB.removeLike(user.id, trackId);
      return true;
    } catch (error) {
      console.error("Error unliking track:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  const isTrackLiked = useCallback(async (trackId: number) => {
    if (!user) return false;
    
    try {
      return await audioDB.isTrackLiked(user.id, trackId);
    } catch (error) {
      console.error("Error checking if track is liked:", error);
      return false;
    }
  }, [user]);
  
  const addComment = useCallback(async (trackId: number, content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment on tracks",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsLoading(true);
      return await audioDB.addComment({
        userId: user.id,
        trackId,
        content,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  const getComments = useCallback(async (trackId: number) => {
    try {
      setIsLoading(true);
      return await audioDB.getCommentsByTrackId(trackId);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteComment = useCallback(async (commentId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to delete comments",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      await audioDB.deleteComment(commentId);
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  const incrementPlays = useCallback(async (trackId: number) => {
    try {
      return await audioDB.incrementPlays(trackId);
    } catch (error) {
      console.error("Error incrementing plays:", error);
      throw error;
    }
  }, []);
  
  return {
    isLoading,
    fetchTrack,
    fetchTracksByUserId,
    fetchTracksByGenre,
    likeTrack,
    unlikeTrack,
    isTrackLiked,
    addComment,
    getComments,
    deleteComment,
    incrementPlays
  };
}
