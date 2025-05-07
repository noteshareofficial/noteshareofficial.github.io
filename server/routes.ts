import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertTrackSchema,
  insertLikeSchema,
  insertCommentSchema,
  insertFollowSchema,
  insertPlaylistSchema,
  insertPlaylistTrackSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Base API route
  const apiRouter = '/api';

  // User routes
  app.get(`${apiRouter}/users`, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get(`${apiRouter}/users/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post(`${apiRouter}/users`, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.format() });
      }
      
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(result.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Track routes
  app.get(`${apiRouter}/tracks`, async (req, res) => {
    try {
      const tracks = await storage.getAllTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tracks" });
    }
  });

  app.get(`${apiRouter}/tracks/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const track = await storage.getTrack(id);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Failed to get track" });
    }
  });

  app.post(`${apiRouter}/tracks`, async (req, res) => {
    try {
      const result = insertTrackSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid track data", errors: result.error.format() });
      }
      
      const track = await storage.createTrack(result.data);
      res.status(201).json(track);
    } catch (error) {
      res.status(500).json({ message: "Failed to create track" });
    }
  });

  app.get(`${apiRouter}/tracks/user/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tracks = await storage.getTracksByUserId(userId);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user tracks" });
    }
  });

  app.put(`${apiRouter}/tracks/:id/increment-plays`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const track = await storage.incrementTrackPlays(id);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Failed to increment track plays" });
    }
  });

  // Like routes
  app.post(`${apiRouter}/likes`, async (req, res) => {
    try {
      const result = insertLikeSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid like data", errors: result.error.format() });
      }
      
      const like = await storage.createLike(result.data);
      res.status(201).json(like);
    } catch (error) {
      res.status(500).json({ message: "Failed to create like" });
    }
  });

  app.delete(`${apiRouter}/likes/user/:userId/track/:trackId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trackId = parseInt(req.params.trackId);
      
      await storage.deleteLike(userId, trackId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete like" });
    }
  });

  app.get(`${apiRouter}/likes/track/:trackId`, async (req, res) => {
    try {
      const trackId = parseInt(req.params.trackId);
      const likes = await storage.getLikesByTrackId(trackId);
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get likes" });
    }
  });

  app.get(`${apiRouter}/likes/user/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const likes = await storage.getLikesByUserId(userId);
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user likes" });
    }
  });

  app.get(`${apiRouter}/likes/check/user/:userId/track/:trackId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trackId = parseInt(req.params.trackId);
      
      const isLiked = await storage.isTrackLikedByUser(userId, trackId);
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  // Comment routes
  app.post(`${apiRouter}/comments`, async (req, res) => {
    try {
      const result = insertCommentSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid comment data", errors: result.error.format() });
      }
      
      const comment = await storage.createComment(result.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get(`${apiRouter}/comments/track/:trackId`, async (req, res) => {
    try {
      const trackId = parseInt(req.params.trackId);
      const comments = await storage.getCommentsByTrackId(trackId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.delete(`${apiRouter}/comments/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Follow routes
  app.post(`${apiRouter}/follows`, async (req, res) => {
    try {
      const result = insertFollowSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid follow data", errors: result.error.format() });
      }
      
      const follow = await storage.createFollow(result.data);
      res.status(201).json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to create follow" });
    }
  });

  app.delete(`${apiRouter}/follows/follower/:followerId/followed/:followedId`, async (req, res) => {
    try {
      const followerId = parseInt(req.params.followerId);
      const followedId = parseInt(req.params.followedId);
      
      await storage.deleteFollow(followerId, followedId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete follow" });
    }
  });

  app.get(`${apiRouter}/follows/follower/:followerId`, async (req, res) => {
    try {
      const followerId = parseInt(req.params.followerId);
      const follows = await storage.getFollowsByFollowerId(followerId);
      res.json(follows);
    } catch (error) {
      res.status(500).json({ message: "Failed to get follows" });
    }
  });

  app.get(`${apiRouter}/follows/followed/:followedId`, async (req, res) => {
    try {
      const followedId = parseInt(req.params.followedId);
      const followers = await storage.getFollowsByFollowedId(followedId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get followers" });
    }
  });

  app.get(`${apiRouter}/follows/check/follower/:followerId/followed/:followedId`, async (req, res) => {
    try {
      const followerId = parseInt(req.params.followerId);
      const followedId = parseInt(req.params.followedId);
      
      const isFollowing = await storage.isUserFollowing(followerId, followedId);
      res.json({ isFollowing });
    } catch (error) {
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Playlist routes
  app.post(`${apiRouter}/playlists`, async (req, res) => {
    try {
      const result = insertPlaylistSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid playlist data", errors: result.error.format() });
      }
      
      const playlist = await storage.createPlaylist(result.data);
      res.status(201).json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to create playlist" });
    }
  });

  app.get(`${apiRouter}/playlists/user/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const playlists = await storage.getPlaylistsByUserId(userId);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to get playlists" });
    }
  });

  app.get(`${apiRouter}/playlists/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const playlist = await storage.getPlaylist(id);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to get playlist" });
    }
  });

  // Playlist track routes
  app.post(`${apiRouter}/playlist-tracks`, async (req, res) => {
    try {
      const result = insertPlaylistTrackSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid playlist track data", errors: result.error.format() });
      }
      
      const playlistTrack = await storage.addTrackToPlaylist(result.data);
      res.status(201).json(playlistTrack);
    } catch (error) {
      res.status(500).json({ message: "Failed to add track to playlist" });
    }
  });

  app.get(`${apiRouter}/playlist-tracks/playlist/:playlistId`, async (req, res) => {
    try {
      const playlistId = parseInt(req.params.playlistId);
      const tracks = await storage.getPlaylistTracks(playlistId);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get playlist tracks" });
    }
  });

  app.delete(`${apiRouter}/playlist-tracks/playlist/:playlistId/track/:trackId`, async (req, res) => {
    try {
      const playlistId = parseInt(req.params.playlistId);
      const trackId = parseInt(req.params.trackId);
      
      await storage.removeTrackFromPlaylist(playlistId, trackId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove track from playlist" });
    }
  });

  // Stats routes
  app.get(`${apiRouter}/stats/trending`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const trendingTracks = await storage.getTrendingTracks(limit);
      res.json(trendingTracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trending tracks" });
    }
  });

  app.get(`${apiRouter}/stats/latest`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const latestTracks = await storage.getLatestTracks(limit);
      res.json(latestTracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get latest tracks" });
    }
  });

  app.get(`${apiRouter}/stats/popular-users`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const popularUsers = await storage.getPopularUsers(limit);
      res.json(popularUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get popular users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
