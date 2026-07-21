"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, resetPassword as apiResetPassword, updateProfile as apiUpdateProfile, deleteAccount as apiDeleteAccount, recordVisit as apiRecordVisit, getStoredSession, saveStoredSession } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  const restoreSession = useCallback(async () => {
    try {
      const u = await getCurrentUser();
      if (u) {
        setUser(u);
        apiRecordVisit().then((result) => {
          if (result?.streak !== undefined) {
            const updated = { ...u, streak: result.streak };
            setUser(updated);
            const session = getStoredSession();
            if (session?.user) {
              saveStoredSession({ ...session, user: updated });
            }
          }
        }).catch(() => {});
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signIn = useCallback(async (email, password) => {
    setSignInLoading(true);
    setError(null);
    try {
      const result = await apiSignIn(email.trim().toLowerCase(), password);
      setUser(result.user);
      setSignInLoading(false);
      apiRecordVisit().then((visit) => {
        if (visit?.streak !== undefined) {
          const updated = { ...result.user, streak: visit.streak };
          setUser(updated);
          const session = getStoredSession();
          if (session?.user) {
            saveStoredSession({ ...session, user: updated });
          }
        }
      }).catch(() => {});
      return { error: null };
    } catch (e) {
      const msg = e?.message || "Sign in failed. Please try again.";
      setError(msg);
      setSignInLoading(false);
      return { error: msg };
    }
  }, []);

  const signUp = useCallback(async (email, password) => {
    setSignUpLoading(true);
    setError(null);
    try {
      const result = await apiSignUp(email.trim().toLowerCase(), password);
      if (!result.needsConfirmation && result.user) {
        setUser(result.user);
        setSignUpLoading(false);
        apiRecordVisit().then((visit) => {
          if (visit?.streak !== undefined) {
            const updated = { ...result.user, streak: visit.streak };
            setUser(updated);
            const session = getStoredSession();
            if (session?.user) {
              saveStoredSession({ ...session, user: updated });
            }
          }
        }).catch(() => {});
      } else {
        setSignUpLoading(false);
      }
      return { error: null, needsConfirmation: result.needsConfirmation };
    } catch (e) {
      const msg = e?.message || "Sign up failed. Please try again.";
      setError(msg);
      setSignUpLoading(false);
      return { error: msg, needsConfirmation: false };
    }
  }, []);

  const signOut = useCallback(async () => {
    setSignOutLoading(true);
    try {
      await apiSignOut();
    } finally {
      setUser(null);
      setError(null);
      setSignOutLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setResetPasswordLoading(true);
    setError(null);
    try {
      await apiResetPassword(email.trim().toLowerCase());
      setResetPasswordLoading(false);
      return { error: null };
    } catch (e) {
      const msg = e?.message || "Password reset failed. Please try again.";
      setError(msg);
      setResetPasswordLoading(false);
      return { error: msg };
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setDeleteAccountLoading(true);
    setError(null);
    try {
      await apiDeleteAccount();
      setUser(null);
      setError(null);
      setDeleteAccountLoading(false);
      return { error: null };
    } catch (e) {
      const msg = e?.message || "Account deletion failed. Please try again.";
      setError(msg);
      setDeleteAccountLoading(false);
      return { error: msg };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateProfile = useCallback(async (updates) => {
    setUpdateProfileLoading(true);
    setError(null);
    try {
      const updatedUser = await apiUpdateProfile(updates);
      setUser(updatedUser);
      setUpdateProfileLoading(false);
      return { error: null };
    } catch (e) {
      const msg = e?.message || "Profile update failed. Please try again.";
      setError(msg);
      setUpdateProfileLoading(false);
      return { error: msg };
    }
  }, []);

  const value = {
    user,
    signInLoading,
    signUpLoading,
    signOutLoading,
    resetPasswordLoading,
    updateProfileLoading,
    deleteAccountLoading,
    initializing,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    restoreSession,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
