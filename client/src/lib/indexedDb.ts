import { User, Track, Like, Comment, Follow, Playlist, PlaylistTrack } from '@shared/schema';
import { openDB, IDBPDatabase } from 'idb';

// Database names
const AUTH_DB_NAME = 'noteShareAuth';
const AUDIO_DB_NAME = 'noteShareAudio';

// Database versions
const AUTH_DB_VERSION = 1;
const AUDIO_DB_VERSION = 1;

// Store names
export const USERS_STORE = 'users';
export const SESSION_STORE = 'session';

export const TRACKS_STORE = 'tracks';
export const LIKES_STORE = 'likes';
export const COMMENTS_STORE = 'comments';
export const FOLLOWS_STORE = 'follows';
export const PLAYLISTS_STORE = 'playlists';
export const PLAYLIST_TRACKS_STORE = 'playlistTracks';

// Initialize Auth DB
export const initAuthDB = async (): Promise<IDBPDatabase> => {
  return openDB(AUTH_DB_NAME, AUTH_DB_VERSION, {
    upgrade(db) {
      // Create users store
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const userStore = db.createObjectStore(USERS_STORE, { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('username', 'username', { unique: true });
        userStore.createIndex('email', 'email', { unique: true });
      }
      
      // Create session store
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      }
    }
  });
};

// Initialize Audio DB
export const initAudioDB = async (): Promise<IDBPDatabase> => {
  return openDB(AUDIO_DB_NAME, AUDIO_DB_VERSION, {
    upgrade(db) {
      // Create tracks store
      if (!db.objectStoreNames.contains(TRACKS_STORE)) {
        const trackStore = db.createObjectStore(TRACKS_STORE, { keyPath: 'id', autoIncrement: true });
        trackStore.createIndex('userId', 'userId');
        trackStore.createIndex('genre', 'genre');
        trackStore.createIndex('createdAt', 'createdAt');
        trackStore.createIndex('plays', 'plays');
      }
      
      // Create likes store
      if (!db.objectStoreNames.contains(LIKES_STORE)) {
        const likeStore = db.createObjectStore(LIKES_STORE, { keyPath: 'id', autoIncrement: true });
        likeStore.createIndex('userId', 'userId');
        likeStore.createIndex('trackId', 'trackId');
        likeStore.createIndex('userTrackId', ['userId', 'trackId'], { unique: true });
      }
      
      // Create comments store
      if (!db.objectStoreNames.contains(COMMENTS_STORE)) {
        const commentStore = db.createObjectStore(COMMENTS_STORE, { keyPath: 'id', autoIncrement: true });
        commentStore.createIndex('userId', 'userId');
        commentStore.createIndex('trackId', 'trackId');
        commentStore.createIndex('createdAt', 'createdAt');
      }
      
      // Create follows store
      if (!db.objectStoreNames.contains(FOLLOWS_STORE)) {
        const followStore = db.createObjectStore(FOLLOWS_STORE, { keyPath: 'id', autoIncrement: true });
        followStore.createIndex('followerId', 'followerId');
        followStore.createIndex('followedId', 'followedId');
        followStore.createIndex('followerFollowed', ['followerId', 'followedId'], { unique: true });
      }
      
      // Create playlists store
      if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
        const playlistStore = db.createObjectStore(PLAYLISTS_STORE, { keyPath: 'id', autoIncrement: true });
        playlistStore.createIndex('userId', 'userId');
        playlistStore.createIndex('isPublic', 'isPublic');
      }
      
      // Create playlist tracks store
      if (!db.objectStoreNames.contains(PLAYLIST_TRACKS_STORE)) {
        const playlistTracksStore = db.createObjectStore(PLAYLIST_TRACKS_STORE, { keyPath: 'id', autoIncrement: true });
        playlistTracksStore.createIndex('playlistId', 'playlistId');
        playlistTracksStore.createIndex('trackId', 'trackId');
        playlistTracksStore.createIndex('position', 'position');
        playlistTracksStore.createIndex('playlistTrackId', ['playlistId', 'trackId'], { unique: true });
      }
    }
  });
};

// Auth DB operations
export const authDB = {
  async getAuthDB() {
    return openDB(AUTH_DB_NAME, AUTH_DB_VERSION);
  },
  
  async addUser(user: Omit<User, 'id'>): Promise<User> {
    const db = await this.getAuthDB();
    const id = await db.add(USERS_STORE, {
      ...user,
      createdAt: new Date()
    });
    return { ...user, id } as User;
  },
  
  async getUserById(id: number): Promise<User | undefined> {
    const db = await this.getAuthDB();
    return db.get(USERS_STORE, id);
  },
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getAuthDB();
    return db.getFromIndex(USERS_STORE, 'username', username);
  },
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.getAuthDB();
    return db.getFromIndex(USERS_STORE, 'email', email);
  },
  
  async updateUser(user: User): Promise<User> {
    const db = await this.getAuthDB();
    await db.put(USERS_STORE, user);
    return user;
  },
  
  async saveSession(userId: number): Promise<void> {
    const db = await this.getAuthDB();
    await db.put(SESSION_STORE, { id: 'currentUser', userId });
  },
  
  async getSession(): Promise<number | null> {
    const db = await this.getAuthDB();
    const session = await db.get(SESSION_STORE, 'currentUser');
    return session ? session.userId : null;
  },
  
  async clearSession(): Promise<void> {
    const db = await this.getAuthDB();
    await db.delete(SESSION_STORE, 'currentUser');
  },
  
  async getAllUsers(): Promise<User[]> {
    const db = await this.getAuthDB();
    return db.getAll(USERS_STORE);
  }
};

// Audio DB operations
export const audioDB = {
  async getAudioDB() {
    return openDB(AUDIO_DB_NAME, AUDIO_DB_VERSION);
  },
  
  // Tracks
  async addTrack(track: Omit<Track, 'id'>): Promise<Track> {
    const db = await this.getAudioDB();
    const id = await db.add(TRACKS_STORE, {
      ...track,
      plays: 0,
      createdAt: new Date()
    });
    return { ...track, id } as Track;
  },
  
  async getTrackById(id: number): Promise<Track | undefined> {
    const db = await this.getAudioDB();
    return db.get(TRACKS_STORE, id);
  },
  
  async getTracksByUserId(userId: number): Promise<Track[]> {
    const db = await this.getAudioDB();
    return db.getAllFromIndex(TRACKS_STORE, 'userId', userId);
  },
  
  async getTracksByGenre(genre: string): Promise<Track[]> {
    const db = await this.getAudioDB();
    return db.getAllFromIndex(TRACKS_STORE, 'genre', genre);
  },
  
  async getTrendingTracks(limit: number = 10): Promise<Track[]> {
    const db = await this.getAudioDB();
    const tracks = await db.getAllFromIndex(TRACKS_STORE, 'plays');
    return tracks.sort((a, b) => b.plays - a.plays).slice(0, limit);
  },
  
  async getLatestTracks(limit: number = 10): Promise<Track[]> {
    const db = await this.getAudioDB();
    const tracks = await db.getAllFromIndex(TRACKS_STORE, 'createdAt');
    return tracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  },
  
  async updateTrack(track: Track): Promise<Track> {
    const db = await this.getAudioDB();
    await db.put(TRACKS_STORE, track);
    return track;
  },
  
  async incrementPlays(trackId: number): Promise<Track> {
    const db = await this.getAudioDB();
    const track = await this.getTrackById(trackId);
    if (!track) throw new Error(`Track with ID ${trackId} not found`);
    
    const updatedTrack = { ...track, plays: track.plays + 1 };
    await db.put(TRACKS_STORE, updatedTrack);
    return updatedTrack;
  },
  
  async deleteTrack(id: number): Promise<void> {
    const db = await this.getAudioDB();
    await db.delete(TRACKS_STORE, id);
  },
  
  async getAllTracks(): Promise<Track[]> {
    const db = await this.getAudioDB();
    return db.getAll(TRACKS_STORE);
  },
  
  // Likes
  async addLike(like: Omit<Like, 'id' | 'createdAt'>): Promise<Like> {
    const db = await this.getAudioDB();
    // Check if already liked
    const existingLike = await db.getFromIndex(
      LIKES_STORE, 
      'userTrackId', 
      [like.userId, like.trackId]
    );
    
    if (existingLike) return existingLike;
    
    const id = await db.add(LIKES_STORE, {
      ...like,
      createdAt: new Date()
    });
    return { ...like, id, createdAt: new Date() } as Like;
  },
  
  async removeLike(userId: number, trackId: number): Promise<void> {
    const db = await this.getAudioDB();
    const like = await db.getFromIndex(
      LIKES_STORE, 
      'userTrackId', 
      [userId, trackId]
    );
    
    if (like) {
      await db.delete(LIKES_STORE, like.id);
    }
  },
  
  async getLikesByUserId(userId: number): Promise<Like[]> {
    const db = await this.getAudioDB();
    return db.getAllFromIndex(LIKES_STORE, 'userId', userId);
  },
  
  async getLikesByTrackId(trackId: number): Promise<Like[]> {
    const db = await this.getAudioDB();
    return db.getAllFromIndex(LIKES_STORE, 'trackId', trackId);
  },
  
  async isTrackLiked(userId: number, trackId: number): Promise<boolean> {
    const db = await this.getAudioDB();
    const like = await db.getFromIndex(
      LIKES_STORE, 
      'userTrackId', 
      [userId, trackId]
    );
    return !!like;
  },
  
  // Comments
  async addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const db = await this.getAudioDB();
    const id = await db.add(COMMENTS_STORE, {
      ...comment,
      createdAt: new Date()
    });
    return { ...comment, id, createdAt: new Date() } as Comment;
  },
  
  async getCommentsByTrackId(trackId: number): Promise<Comment[]> {
    const db = await this.getAudioDB();
    const comments = await db.getAllFromIndex(COMMENTS_STORE, 'trackId', trackId);
    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  async deleteComment(id: number): Promise<void> {
    const db = await this.getAudioDB();
    await db.delete(COMMENTS_STORE, id);
  },
  
  // Follows
  async addFollow(follow: Omit<Follow, 'id' | 'createdAt'>): Promise<Follow> {
    const db = await this.getAudioDB();
    // Check if already following
    const existingFollow = await db.getFromIndex(
      FOLLOWS_STORE, 
      'followerFollowed', 
      [follow.followerId, follow.followedId]
    );
    
    if (existingFollow) return existingFollow;
    
    const id = await db.add(FOLLOWS_STORE, {
      ...follow,
      createdAt: new Date()
    });
    return { ...follow, id, createdAt: new Date() } as Follow;
  },
  
  async removeFollow(followerId: number, followedId: number): Promise<void> {
    const db = await this.getAudioDB();
    const follow = await db.getFromIndex(
      FOLLOWS_STORE, 
      'followerFollowed', 
      [followerId, followedId]
    );
    
    if (follow) {
      await db.delete(FOLLOWS_STORE, follow.id);
    }
  },
  
  async getFollowsByFollowerId(followerId: number): Promise<Follow[]> {
    const db = await this.getAudioDB();
    return db.getAllFromIndex(FOLLOWS_STORE, 'followerId', followerId);
  },
  
  async getFollowsByFollowedId(followedId: number): Promise<Follow[]> {
    const db = await this.getAudioDB();
    return db.getAllFromIndex(FOLLOWS_STORE, 'followedId', followedId);
  },
  
  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    const db = await this.getAudioDB();
    const follow = await db.getFromIndex(
      FOLLOWS_STORE, 
      'followerFollowed', 
      [followerId, followedId]
    );
    return !!follow;
  },
  
  // Playlists
  async addPlaylist(playlist: Omit<Playlist, 'id' | 'createdAt'>): Promise<Playlist> {
    const db = await this.getAudioDB();
    const id = await db.add(PLAYLISTS_STORE, {
      ...playlist,
      createdAt: new Date()
    });
    return { ...playlist, id, createdAt: new Date() } as Playlist;
  },
  
  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    const db = await this.getAudioDB();
    return db.get(PLAYLISTS_STORE, id);
  },
  
  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    const db = await this.getAudioDB();
    return db.getAllFromIndex(PLAYLISTS_STORE, 'userId', userId);
  },
  
  async updatePlaylist(playlist: Playlist): Promise<Playlist> {
    const db = await this.getAudioDB();
    await db.put(PLAYLISTS_STORE, playlist);
    return playlist;
  },
  
  async deletePlaylist(id: number): Promise<void> {
    const db = await this.getAudioDB();
    await db.delete(PLAYLISTS_STORE, id);
    
    // Delete all playlist tracks
    const playlistTracks = await this.getPlaylistTracksByPlaylistId(id);
    for (const track of playlistTracks) {
      await db.delete(PLAYLIST_TRACKS_STORE, track.id);
    }
  },
  
  // Playlist Tracks
  async addTrackToPlaylist(
    playlistTrack: Omit<PlaylistTrack, 'id' | 'createdAt'>
  ): Promise<PlaylistTrack> {
    const db = await this.getAudioDB();
    // Check if already in playlist
    const existingTrack = await db.getFromIndex(
      PLAYLIST_TRACKS_STORE, 
      'playlistTrackId', 
      [playlistTrack.playlistId, playlistTrack.trackId]
    );
    
    if (existingTrack) return existingTrack;
    
    const id = await db.add(PLAYLIST_TRACKS_STORE, {
      ...playlistTrack,
      createdAt: new Date()
    });
    return { ...playlistTrack, id, createdAt: new Date() } as PlaylistTrack;
  },
  
  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<void> {
    const db = await this.getAudioDB();
    const playlistTrack = await db.getFromIndex(
      PLAYLIST_TRACKS_STORE, 
      'playlistTrackId', 
      [playlistId, trackId]
    );
    
    if (playlistTrack) {
      await db.delete(PLAYLIST_TRACKS_STORE, playlistTrack.id);
    }
  },
  
  async getPlaylistTracksByPlaylistId(playlistId: number): Promise<PlaylistTrack[]> {
    const db = await this.getAudioDB();
    const tracks = await db.getAllFromIndex(PLAYLIST_TRACKS_STORE, 'playlistId', playlistId);
    return tracks.sort((a, b) => a.position - b.position);
  },
  
  async updatePlaylistTrackPosition(
    playlistId: number, 
    trackId: number, 
    newPosition: number
  ): Promise<PlaylistTrack> {
    const db = await this.getAudioDB();
    const playlistTrack = await db.getFromIndex(
      PLAYLIST_TRACKS_STORE, 
      'playlistTrackId', 
      [playlistId, trackId]
    );
    
    if (!playlistTrack) {
      throw new Error(`Track ${trackId} is not in playlist ${playlistId}`);
    }
    
    const updatedTrack = { ...playlistTrack, position: newPosition };
    await db.put(PLAYLIST_TRACKS_STORE, updatedTrack);
    return updatedTrack;
  }
};
