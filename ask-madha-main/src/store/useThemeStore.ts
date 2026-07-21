import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeId, getThemeColors } from '../theme/themes';

interface ThemeStore {
  currentTheme: ThemeId;
  colors: ThemeColors;
  pendingTheme: ThemeId | null;
  setTheme: (theme: ThemeId) => void;
  setPendingTheme: (theme: ThemeId) => void;
  applyPendingTheme: () => void;
  cancelPendingTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'light',
      colors: getThemeColors('light'),
      pendingTheme: null,

      setTheme: (theme: ThemeId) => {
        set({
          currentTheme: theme,
          colors: getThemeColors(theme),
          pendingTheme: null,
        });
      },

      setPendingTheme: (theme: ThemeId) => {
        set({ pendingTheme: theme });
      },

      applyPendingTheme: () => {
        const { pendingTheme } = get();
        if (pendingTheme) {
          set({
            currentTheme: pendingTheme,
            colors: getThemeColors(pendingTheme),
            pendingTheme: null,
          });
        }
      },

      cancelPendingTheme: () => {
        set({ pendingTheme: null });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentTheme: state.currentTheme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = getThemeColors(state.currentTheme);
        }
      },
    }
  )
);
