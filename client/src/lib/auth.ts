import { authDB } from './indexedDb';
import { User, InsertUser } from '@shared/schema';
import bcrypt from 'bcryptjs';

// Register a new user
export const registerUser = async (userData: InsertUser): Promise<User> => {
  // Check if username already exists
  const existingUsername = await authDB.getUserByUsername(userData.username);
  if (existingUsername) {
    throw new Error('Username already exists');
  }
  
  // Check if email already exists
  const existingEmail = await authDB.getUserByEmail(userData.email);
  if (existingEmail) {
    throw new Error('Email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Create user
  const user = await authDB.addUser({
    ...userData,
    password: hashedPassword,
    isAdmin: false,
  });
  
  // Save session
  await authDB.saveSession(user.id);
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

// Login user
export const loginUser = async (
  usernameOrEmail: string, 
  password: string
): Promise<User> => {
  // Check if user exists
  const user = await authDB.getUserByUsername(usernameOrEmail) 
    || await authDB.getUserByEmail(usernameOrEmail);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Save session
  await authDB.saveSession(user.id);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  await authDB.clearSession();
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const userId = await authDB.getSession();
  if (!userId) {
    return null;
  }
  
  const user = await authDB.getUserById(userId);
  if (!user) {
    await authDB.clearSession();
    return null;
  }
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

// Update user profile
export const updateUserProfile = async (
  userId: number, 
  userData: Partial<User>
): Promise<User> => {
  const user = await authDB.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // If updating username, check if it already exists
  if (userData.username && userData.username !== user.username) {
    const existingUsername = await authDB.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }
  }
  
  // If updating email, check if it already exists
  if (userData.email && userData.email !== user.email) {
    const existingEmail = await authDB.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }
  }
  
  // Update user
  const updatedUser = await authDB.updateUser({
    ...user,
    ...userData,
  });
  
  // Return user without password
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as User;
};

// Change password
export const changePassword = async (
  userId: number, 
  currentPassword: string, 
  newPassword: string
): Promise<User> => {
  const user = await authDB.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update user
  const updatedUser = await authDB.updateUser({
    ...user,
    password: hashedPassword,
  });
  
  // Return user without password
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as User;
};

// Check if user is admin
export const isAdmin = async (userId: number): Promise<boolean> => {
  const user = await authDB.getUserById(userId);
  return user?.isAdmin || false;
};

// Admin: Get all users
export const getAllUsers = async (): Promise<User[]> => {
  const users = await authDB.getAllUsers();
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  });
};

// Admin: Toggle admin status
export const toggleAdminStatus = async (
  adminId: number, 
  targetUserId: number
): Promise<User> => {
  // Check if requester is admin
  const admin = await authDB.getUserById(adminId);
  if (!admin?.isAdmin) {
    throw new Error('Unauthorized');
  }
  
  // Check if target user exists
  const targetUser = await authDB.getUserById(targetUserId);
  if (!targetUser) {
    throw new Error('User not found');
  }
  
  // Toggle admin status
  const updatedUser = await authDB.updateUser({
    ...targetUser,
    isAdmin: !targetUser.isAdmin,
  });
  
  // Return user without password
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as User;
};
