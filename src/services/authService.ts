import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

export interface SignUpParams {
  displayName: string;
  username: string; // Unique User ID
  password: string;
}

export interface LoginParams {
  username: string; // Unique User ID or email
  password: string;
}

const USERS_STORAGE_KEY = 'growtogether_registered_users';
const CURRENT_SESSION_KEY = 'growtogether_auth_session';

// Helper: Securely hash password using Web Crypto API SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = 'growtogether_salt_2026_';
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial seed user for instant login testing
const DEFAULT_SEED_USER = {
  id: 'usr_demo_123',
  username: 'alex_grower',
  displayName: 'Alex Rivers',
  bio: 'Building consistency one day at a time 🌱',
  streakCount: 14,
  streakFreezeTokens: 2,
  passwordHash: '', // Set in init
};

export const authService = {
  // Validate User ID format
  validateUsername(username: string): { valid: boolean; error?: string } {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3 || clean.length > 20) {
      return { valid: false, error: 'User ID must be between 3 and 20 characters.' };
    }
    if (!/^[a-z0-9_]+$/.test(clean)) {
      return { valid: false, error: 'User ID can only contain letters, numbers, and underscores.' };
    }
    return { valid: true };
  },

  // Check if User ID is unique
  async isUsernameUnique(username: string): Promise<boolean> {
    const cleanUser = username.trim().toLowerCase();
    const users = this.getStoredUsers();
    return !users.some(u => u.username.toLowerCase() === cleanUser);
  },

  getStoredUsers(): Array<UserProfile & { passwordHash: string }> {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveUsers(users: Array<UserProfile & { passwordHash: string }>) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  // Seed default demo user if storage empty
  async initSeedUser() {
    const users = this.getStoredUsers();
    if (users.length === 0) {
      const demoHash = await hashPassword('password123');
      const seeded = [{ ...DEFAULT_SEED_USER, passwordHash: demoHash }];
      this.saveUsers(seeded);
    }
  },

  // Real SignUp logic
  async signUp(params: SignUpParams): Promise<UserProfile> {
    await this.initSeedUser();

    // 1. Validate Display Name
    if (!params.displayName.trim() || params.displayName.trim().length < 2) {
      throw new Error('Display Name must be at least 2 characters.');
    }

    // 2. Validate User ID
    const userVal = this.validateUsername(params.username);
    if (!userVal.valid) {
      throw new Error(userVal.error || 'Invalid User ID');
    }

    // 3. Validate Password length
    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanUsername = params.username.trim().toLowerCase();

    // 4. Check uniqueness
    const isUnique = await this.isUsernameUnique(cleanUsername);
    if (!isUnique) {
      throw new Error(`User ID "${cleanUsername}" is already taken. Please choose another User ID.`);
    }

    // 5. Securely Hash Password
    const passwordHash = await hashPassword(params.password);

    // 6. Create Profile Object
    const newProfile: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username: cleanUsername,
      displayName: params.displayName.trim(),
      bio: 'New member in the GrowTogether circle 🌱',
      streakCount: 1,
    };

    // 7. Store Profile & Password Hash
    const users = this.getStoredUsers();
    users.push({ ...newProfile, passwordHash });
    this.saveUsers(users);

    // 8. Save Current Active Session
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newProfile));

    return newProfile;
  },

  // Real Login logic
  async login(params: LoginParams): Promise<UserProfile> {
    await this.initSeedUser();

    if (!params.username.trim() || !params.password) {
      throw new Error('Please enter your User ID and password.');
    }

    const cleanInput = params.username.trim().toLowerCase();
    const users = this.getStoredUsers();

    // Find user by User ID (or email prefix match)
    const userRecord = users.find(u =>
      u.username.toLowerCase() === cleanInput ||
      u.username.toLowerCase() === cleanInput.replace('@', '').split('@')[0]
    );

    if (!userRecord) {
      throw new Error(`No account found for User ID "${cleanInput}". Please check spelling or create an account.`);
    }

    // Verify Password Hash securely
    const inputHash = await hashPassword(params.password);
    if (userRecord.passwordHash !== inputHash) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Extract public profile (without password hash)
    const { passwordHash: _, ...profile } = userRecord;

    // Save Active Session
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(profile));

    return profile;
  },

  // Get current active session user
  getCurrentUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(CURRENT_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Logout & clear active session
  logout() {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  },
};
