import { create } from 'zustand';
import { Profile } from '../types';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  resetPassword as apiResetPassword,
  deleteAccount as apiDeleteAccount,
  getCurrentUser,
  updateProfile as apiUpdateProfile,
  recordVisit as apiRecordVisit,
  AuthUser,
} from '../services/madhaApi';

interface AuthStore {
  session: { access_token: string } | null;
  user: AuthUser | null;
  profile: Profile | null;
  signInLoading: boolean;
  signUpLoading: boolean;
  signOutLoading: boolean;
  resetPasswordLoading: boolean;
  updateProfileLoading: boolean;
  deleteAccountLoading: boolean;
  initializing: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  clearError: () => void;
  setSession: (session: { access_token: string } | null) => void;
  restoreSession: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<AuthUser, 'language' | 'bookFilter'>>) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

function authUserToProfile(user: AuthUser | null): Profile | null {
  if (!user) return null;
  return {
    id: user.id,
    displayName: user.displayName || 'Dear Friend',
    email: user.email,
    avatarUrl: user.avatarUrl,
    language: user.language || 'english',
    bookFilter: user.bookFilter || 'all',
    subscriptionTier: user.subscriptionTier || 'free',
    streak: user.streak || 0,
    createdAt: new Date(user.createdAt || Date.now()),
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  profile: null,
  signInLoading: false,
  signUpLoading: false,
  signOutLoading: false,
  resetPasswordLoading: false,
  updateProfileLoading: false,
  deleteAccountLoading: false,
  initializing: true,
  error: null,

  setSession: (session) => {
    set({
      session,
      initializing: false,
    });
  },

  restoreSession: async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const { getAccessToken } = await import('../services/tokenStorage');
        const token = await getAccessToken();
        set({
          session: token ? { access_token: token } : null,
          user,
          profile: authUserToProfile(user),
          initializing: false,
        });
        apiRecordVisit().then((visit) => {
          if (visit?.streak !== undefined) {
            const updatedUser = { ...user, streak: visit.streak };
            set({
              user: updatedUser,
              profile: authUserToProfile(updatedUser),
            });
            import('../services/tokenStorage').then(({ getAccessToken, getRefreshToken, getExpiresAt, saveAuthSession }) => {
              Promise.all([getAccessToken(), getRefreshToken(), getExpiresAt()]).then(([t, r, e]) => {
                if (t && r && e) {
                  saveAuthSession({ access_token: t, refresh_token: r, expires_at: e, user: updatedUser });
                }
              });
            });
          }
        }).catch(() => {});
      } else {
        set({ session: null, user: null, profile: null, initializing: false });
      }
    } catch {
      set({ session: null, user: null, profile: null, initializing: false });
    }
  },

  signIn: async (email, password) => {
    set({ signInLoading: true, error: null });
    try {
      const result = await apiSignIn(email.trim().toLowerCase(), password);
      set({
        session: { access_token: result.access_token },
        user: result.user,
        profile: authUserToProfile(result.user),
        signInLoading: false,
        error: null,
      });
      apiRecordVisit().then((visit) => {
        if (visit?.streak !== undefined) {
          const updatedUser = { ...result.user, streak: visit.streak };
          set({
            user: updatedUser,
            profile: authUserToProfile(updatedUser),
          });
          import('../services/tokenStorage').then(({ getAccessToken, getRefreshToken, getExpiresAt, saveAuthSession }) => {
            Promise.all([getAccessToken(), getRefreshToken(), getExpiresAt()]).then(([t, r, e]) => {
              if (t && r && e) {
                saveAuthSession({ access_token: t, refresh_token: r, expires_at: e, user: updatedUser });
              }
            });
          });
        }
      }).catch(() => {});
      return { error: null };
    } catch (e: any) {
      const msg = e?.message || 'Sign in failed. Please try again.';
      set({ signInLoading: false, error: msg });
      return { error: msg };
    }
  },

  signUp: async (email, password) => {
    set({ signUpLoading: true, error: null });
    try {
      const result = await apiSignUp(email.trim().toLowerCase(), password);
      if (!result.needsConfirmation && result.user) {
        set({
          session: { access_token: '' },
          user: result.user,
          profile: authUserToProfile(result.user),
          signUpLoading: false,
        });
      } else {
        set({ signUpLoading: false });
      }
      return { error: null, needsConfirmation: result.needsConfirmation };
    } catch (e: any) {
      const msg = e?.message || 'Sign up failed. Please try again.';
      set({ signUpLoading: false, error: msg });
      return { error: msg, needsConfirmation: false };
    }
  },

  signOut: async () => {
    set({ signOutLoading: true });
    try {
      await apiSignOut();
    } finally {
      set({
        session: null,
        user: null,
        profile: null,
        signOutLoading: false,
        error: null,
      });
    }
  },

  resetPassword: async (email) => {
    set({ resetPasswordLoading: true, error: null });
    try {
      await apiResetPassword(email.trim().toLowerCase());
      set({ resetPasswordLoading: false });
      return { error: null };
    } catch (e: any) {
      const msg = e?.message || 'Password reset failed. Please try again.';
      set({ resetPasswordLoading: false, error: msg });
      return { error: msg };
    }
  },

  clearError: () => set({ error: null }),

  deleteAccount: async () => {
    set({ deleteAccountLoading: true, error: null });
    try {
      await apiDeleteAccount();
      set({
        session: null,
        user: null,
        profile: null,
        deleteAccountLoading: false,
        error: null,
      });
      return { error: null };
    } catch (e: any) {
      const msg = e?.message || 'Account deletion failed. Please try again.';
      set({ deleteAccountLoading: false, error: msg });
      return { error: msg };
    }
  },

  updateProfile: async (updates) => {
    set({ updateProfileLoading: true, error: null });
    try {
      const updatedUser = await apiUpdateProfile(updates);
      set((state) => ({
        user: { ...state.user, ...updatedUser } as AuthUser,
        profile: authUserToProfile({ ...state.user, ...updatedUser } as AuthUser),
        updateProfileLoading: false,
      }));
      return { error: null };
    } catch (e: any) {
      const msg = e?.message || 'Profile update failed. Please try again.';
      set({ updateProfileLoading: false, error: msg });
      return { error: msg };
    }
  },
}));
