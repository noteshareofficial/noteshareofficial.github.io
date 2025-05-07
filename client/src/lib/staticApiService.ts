import { User, Track, Comment, Like, Follow, Playlist } from "@shared/schema";

/**
 * This file provides a static data service for GitHub Pages deployment
 * where there is no backend server available.
 */

// Mock user data
const mockUsers: User[] = [
  {
    id: 1,
    username: "demo_user",
    password: "",
    email: "demo@example.com",
    displayName: "Demo User",
    bio: "This is a demo user for the GitHub Pages deployment",
    profilePicture: null,
    isAdmin: false,
    createdAt: new Date("2025-01-01")
  },
  {
    id: 2,
    username: "music_creator",
    password: "",
    email: "creator@example.com",
    displayName: "Music Creator",
    bio: "I make awesome music",
    profilePicture: null,
    isAdmin: false,
    createdAt: new Date("2025-01-15")
  }
];

// Mock track data
const mockTracks: Track[] = [
  {
    id: 1,
    userId: 1,
    title: "Summer Vibes",
    description: "A chill track for summer days",
    coverArt: null,
    audioUrl: "https://example.com/track1.mp3",
    duration: 180,
    waveformData: "data:...",
    genre: "Chill",
    plays: 1250,
    createdAt: new Date("2025-02-15")
  },
  {
    id: 2,
    userId: 2,
    title: "Urban Beat",
    description: "An energetic urban track",
    coverArt: null,
    audioUrl: "https://example.com/track2.mp3",
    duration: 240,
    waveformData: "data:...",
    genre: "Electronic",
    plays: 843,
    createdAt: new Date("2025-03-01")
  }
];

// Mock comments
const mockComments: Comment[] = [
  {
    id: 1,
    userId: 2,
    trackId: 1,
    content: "Great track! I love the melody.",
    createdAt: new Date("2025-02-16")
  },
  {
    id: 2,
    userId: 1,
    trackId: 2,
    content: "This beat is fire!",
    createdAt: new Date("2025-03-02")
  }
];

// Mock likes
const mockLikes: Like[] = [
  {
    id: 1,
    userId: 1,
    trackId: 2,
    createdAt: new Date("2025-03-02")
  },
  {
    id: 2,
    userId: 2,
    trackId: 1,
    createdAt: new Date("2025-02-18")
  }
];

// Mock follows
const mockFollows: Follow[] = [
  {
    id: 1,
    followerId: 1,
    followedId: 2,
    createdAt: new Date("2025-02-20")
  }
];

// Mock playlists
const mockPlaylists: Playlist[] = [
  {
    id: 1,
    userId: 1,
    title: "My Favorite Tracks",
    description: "A collection of my favorite tracks",
    coverArt: null,
    isPublic: true,
    createdAt: new Date("2025-02-25")
  }
];

// Static API service for GitHub Pages
export const staticApiService = {
  // User operations
  getCurrentUser: () => Promise.resolve(mockUsers[0]),
  getUsers: () => Promise.resolve(mockUsers),
  getUserById: (id: number) => Promise.resolve(mockUsers.find(user => user.id === id) || null),
  
  // Track operations
  getTracks: () => Promise.resolve(mockTracks),
  getTrackById: (id: number) => Promise.resolve(mockTracks.find(track => track.id === id) || null),
  getTracksByUserId: (userId: number) => Promise.resolve(mockTracks.filter(track => track.userId === userId)),
  getTrendingTracks: () => Promise.resolve([...mockTracks].sort((a, b) => b.plays - a.plays)),
  
  // Comment operations
  getCommentsByTrackId: (trackId: number) => Promise.resolve(mockComments.filter(comment => comment.trackId === trackId)),
  
  // Like operations
  getLikesByTrackId: (trackId: number) => Promise.resolve(mockLikes.filter(like => like.trackId === trackId)),
  isTrackLikedByUser: (userId: number, trackId: number) => 
    Promise.resolve(!!mockLikes.find(like => like.userId === userId && like.trackId === trackId)),
  
  // Follow operations
  getFollowersByUserId: (userId: number) => Promise.resolve(mockFollows.filter(follow => follow.followedId === userId)),
  getFollowingByUserId: (userId: number) => Promise.resolve(mockFollows.filter(follow => follow.followerId === userId)),
  isUserFollowing: (followerId: number, followedId: number) => 
    Promise.resolve(!!mockFollows.find(follow => follow.followerId === followerId && follow.followedId === followedId)),
  
  // Playlist operations
  getPlaylistsByUserId: (userId: number) => Promise.resolve(mockPlaylists.filter(playlist => playlist.userId === userId)),
};

// Helper function to check if app is running on GitHub Pages
export const isGitHubPages = () => {
  return window.location.hostname.includes('github.io');
};

export default staticApiService;