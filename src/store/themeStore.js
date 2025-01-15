import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_TYPES } from "@/constants";

/**
 * 主题状态管理Store
 */
export const useThemeStore = create(
  persist(
    (set) => ({
      // 主题状态
      theme: THEME_TYPES.LIGHT,

      // 主题切换
      toggleTheme: () => {
        set((state) => ({
          theme:
            state.theme === THEME_TYPES.LIGHT
              ? THEME_TYPES.DARK
              : THEME_TYPES.LIGHT,
        }));
      },

      // 设置主题
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "theme-store",
    }
  )
);

export default useThemeStore;
