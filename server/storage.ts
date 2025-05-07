import { 
  users, type User, type InsertUser,
  tracks, type Track, type InsertTrack,
  likes, type Like, type InsertLike,
  comments, type Comment, type InsertComment,
  follows, type Follow, type InsertFollow,
  playlists, type Playlist, type InsertPlaylist,
  playlistTracks, type PlaylistTrack, type InsertPlaylistTrack
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Track operations
  getTrack(id: number): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  getTracksByUserId(userId: number): Promise<Track[]>;
  getAllTracks(): Promise<Track[]>;
  incrementTrackPlays(id: number): Promise<Track | undefined>;
  getTrendingTracks(limit?: number): Promise<Track[]>;
  getLatestTracks(limit?: number): Promise<Track[]>;
  
  // Like operations
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, trackId: number): Promise<void>;
  getLikesByTrackId(trackId: number): Promise<Like[]>;
  getLikesByUserId(userId: number): Promise<Like[]>;
  isTrackLikedByUser(userId: number, trackId: number): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByTrackId(trackId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<void>;
  
  // Follow operations
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followedId: number): Promise<void>;
  getFollowsByFollowerId(followerId: number): Promise<Follow[]>;
  getFollowsByFollowedId(followedId: number): Promise<Follow[]>;
  isUserFollowing(followerId: number, followedId: number): Promise<boolean>;
  
  // Playlist operations
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistsByUserId(userId: number): Promise<Playlist[]>;
  
  // Playlist tracks operations
  addTrackToPlaylist(playlistTrack: InsertPlaylistTrack): Promise<PlaylistTrack>;
  removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<void>;
  getPlaylistTracks(playlistId: number): Promise<PlaylistTrack[]>;
  
  // Stats operations
  getPopularUsers(limit?: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tracks: Map<number, Track>;
  private likes: Map<number, Like>;
  private comments: Map<number, Comment>;
  private follows: Map<number, Follow>;
  private playlists: Map<number, Playlist>;
  private playlistTracks: Map<number, PlaylistTrack>;
  
  private userIdCounter: number = 1;
  private trackIdCounter: number = 1;
  private likeIdCounter: number = 1;
  private commentIdCounter: number = 1;
  private followIdCounter: number = 1;
  private playlistIdCounter: number = 1;
  private playlistTrackIdCounter: number = 1;
  
  constructor() {
    this.users = new Map();
    this.tracks = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.follows = new Map();
    this.playlists = new Map();
    this.playlistTracks = new Map();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Track operations
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }
  
  async createTrack(trackData: InsertTrack): Promise<Track> {
    const id = this.trackIdCounter++;
    const createdAt = new Date();
    const track: Track = { ...trackData, id, plays: 0, createdAt };
    this.tracks.set(id, track);
    return track;
  }
  
  async getTracksByUserId(userId: number): Promise<Track[]> {
    return Array.from(this.tracks.values()).filter(track => track.userId === userId);
  }
  
  async getAllTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }
  
  async incrementTrackPlays(id: number): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;
    
    const updatedTrack: Track = { ...track, plays: track.plays + 1 };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }
  
  async getTrendingTracks(limit: number = 10): Promise<Track[]> {
    return Array.from(this.tracks.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);
  }
  
  async getLatestTracks(limit: number = 10): Promise<Track[]> {
    return Array.from(this.tracks.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  // Like operations
  async createLike(likeData: InsertLike): Promise<Like> {
    // Check if like already exists
    const existingLike = Array.from(this.likes.values()).find(
      like => like.userId === likeData.userId && like.trackId === likeData.trackId
    );
    
    if (existingLike) {
      return existingLike;
    }
    
    const id = this.likeIdCounter++;
    const createdAt = new Date();
    const like: Like = { ...likeData, id, createdAt };
    this.likes.set(id, like);
    return like;
  }
  
  async deleteLike(userId: number, trackId: number): Promise<void> {
    const likeToDelete = Array.from(this.likes.values()).find(
      like => like.userId === userId && like.trackId === trackId
    );
    
    if (likeToDelete) {
      this.likes.delete(likeToDelete.id);
    }
  }
  
  async getLikesByTrackId(trackId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.trackId === trackId);
  }
  
  async getLikesByUserId(userId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.userId === userId);
  }
  
  async isTrackLikedByUser(userId: number, trackId: number): Promise<boolean> {
    return Array.from(this.likes.values()).some(
      like => like.userId === userId && like.trackId === trackId
    );
  }
  
  // Comment operations
  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    const comment: Comment = { ...commentData, id, createdAt };
    this.comments.set(id, comment);
    return comment;
  }
  
  async getCommentsByTrackId(trackId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.trackId === trackId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async deleteComment(id: number): Promise<void> {
    this.comments.delete(id);
  }
  
  // Follow operations
  async createFollow(followData: InsertFollow): Promise<Follow> {
    // Check if follow already exists
    const existingFollow = Array.from(this.follows.values()).find(
      follow => follow.followerId === followData.followerId && follow.followedId === followData.followedId
    );
    
    if (existingFollow) {
      return existingFollow;
    }
    
    const id = this.followIdCounter++;
    const createdAt = new Date();
    const follow: Follow = { ...followData, id, createdAt };
    this.follows.set(id, follow);
    return follow;
  }
  
  async deleteFollow(followerId: number, followedId: number): Promise<void> {
    const followToDelete = Array.from(this.follows.values()).find(
      follow => follow.followerId === followerId && follow.followedId === followedId
    );
    
    if (followToDelete) {
      this.follows.delete(followToDelete.id);
    }
  }
  
  async getFollowsByFollowerId(followerId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(follow => follow.followerId === followerId);
  }
  
  async getFollowsByFollowedId(followedId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(follow => follow.followedId === followedId);
  }
  
  async isUserFollowing(followerId: number, followedId: number): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      follow => follow.followerId === followerId && follow.followedId === followedId
    );
  }
  
  // Playlist operations
  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistIdCounter++;
    const createdAt = new Date();
    const playlist: Playlist = { ...playlistData, id, createdAt };
    this.playlists.set(id, playlist);
    return playlist;
  }
  
  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }
  
  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(playlist => playlist.userId === userId);
  }
  
  // Playlist tracks operations
  async addTrackToPlaylist(playlistTrackData: InsertPlaylistTrack): Promise<PlaylistTrack> {
    // Check if track is already in playlist
    const existingPlaylistTrack = Array.from(this.playlistTracks.values()).find(
      pt => pt.playlistId === playlistTrackData.playlistId && pt.trackId === playlistTrackData.trackId
    );
    
    if (existingPlaylistTrack) {
      return existingPlaylistTrack;
    }
    
    const id = this.playlistTrackIdCounter++;
    const createdAt = new Date();
    const playlistTrack: PlaylistTrack = { ...playlistTrackData, id, createdAt };
    this.playlistTracks.set(id, playlistTrack);
    return playlistTrack;
  }
  
  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<void> {
    const ptToDelete = Array.from(this.playlistTracks.values()).find(
      pt => pt.playlistId === playlistId && pt.trackId === trackId
    );
    
    if (ptToDelete) {
      this.playlistTracks.delete(ptToDelete.id);
    }
  }
  
  async getPlaylistTracks(playlistId: number): Promise<PlaylistTrack[]> {
    return Array.from(this.playlistTracks.values())
      .filter(pt => pt.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);
  }
  
  // Stats operations
  async getPopularUsers(limit: number = 10): Promise<User[]> {
    // Get followers count for each user
    const followerCounts = new Map<number, number>();
    
    for (const user of this.users.values()) {
      const followers = await this.getFollowsByFollowedId(user.id);
      followerCounts.set(user.id, followers.length);
    }
    
    // Sort users by follower count
    return Array.from(this.users.values())
      .sort((a, b) => (followerCounts.get(b.id) || 0) - (followerCounts.get(a.id) || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
