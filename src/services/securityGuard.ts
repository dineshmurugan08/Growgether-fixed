import { UserProfile, SharedGoal, SharedHabit } from '../types';
import { authService } from './authService';

export class AuthorizationError extends Error {
  public statusCode: number;

  constructor(message: string = 'Access Denied: Authorization Enforced') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export const securityGuard = {
  // Get active authenticated session user ID
  getAuthenticatedUserId(): string | null {
    const user = authService.getCurrentUser();
    return user?.id || null;
  },

  // Enforce valid authentication & match calling ID against active session
  assertAuthenticated(callingUserId?: string): string {
    const activeUserId = this.getAuthenticatedUserId();
    if (!activeUserId) {
      throw new AuthorizationError('401 Unauthorized: Authentication required to perform this action.');
    }
    if (callingUserId && callingUserId !== activeUserId) {
      throw new AuthorizationError(
        `403 Forbidden: Session mismatch. Calling user "${callingUserId}" does not match active session "${activeUserId}".`
      );
    }
    return activeUserId;
  },

  // Enforce direct resource ownership (User A cannot read/modify User B's private items)
  assertOwner(resourceOwnerId: string, actionName: string = 'resource') {
    const activeUserId = this.assertAuthenticated();
    if (resourceOwnerId !== activeUserId) {
      throw new AuthorizationError(
        `403 Access Denied: You do not have permission to ${actionName} belonging to user "${resourceOwnerId}".`
      );
    }
  },

  // Enforce membership on shared goals
  assertCanAccessSharedGoal(members: Array<{ userId: string; status: string }>, actionName: string = 'access shared goal') {
    const activeUserId = this.assertAuthenticated();
    const isMember = members.some(m => m.userId === activeUserId);
    if (!isMember) {
      throw new AuthorizationError(`403 Access Denied: You are not an explicit participant of this shared goal.`);
    }
  },

  // Enforce membership on shared habits
  assertCanAccessSharedHabit(members: Array<{ userId: string; status: string }>, actionName: string = 'access shared habit') {
    const activeUserId = this.assertAuthenticated();
    const isMember = members.some(m => m.userId === activeUserId);
    if (!isMember) {
      throw new AuthorizationError(`403 Access Denied: You are not an explicit participant of this shared habit.`);
    }
  },

  // Sanitize user object: ALWAYS strip passwordHash
  sanitizeProfile<T extends UserProfile & { passwordHash?: string }>(user: T): UserProfile {
    const { passwordHash: _, ...publicProfile } = user;
    return publicProfile;
  },

  // Safe localStorage write wrapper with QuotaExceededError fallback
  safeSetItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      if (
        err?.name === 'QuotaExceededError' ||
        err?.code === 22 ||
        err?.code === 1014
      ) {
        console.warn(`[SecurityGuard] LocalStorage quota exceeded writing key "${key}". Consider clearing old logs or connecting Supabase backend.`);
        return false;
      }
      throw err;
    }
  },
};
