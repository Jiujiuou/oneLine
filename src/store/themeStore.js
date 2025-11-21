import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_TYPES } from "@/constants";
import { BOARD_THEMES } from "@/constants/themes";

/**
 * 主题状态管理Store
 */
export const useThemeStore = create(
  persist(
    (set) => ({
      // App 整体明暗模式
      theme: THEME_TYPES.LIGHT,
      
      // 游戏棋盘主题 (默认经典蓝)
      boardThemeId: 'DEFAULT', 

      // 切换明暗模式
      toggleTheme: () => {
        set((state) => ({
          theme:
            state.theme === THEME_TYPES.LIGHT
              ? THEME_TYPES.DARK
              : THEME_TYPES.LIGHT,
        }));
      },

      // 设置明暗模式
      setTheme: (theme) => {
        set({ theme });
      },

      // 设置棋盘主题
      setBoardThemeId: (id) => {
        if (BOARD_THEMES[id]) {
            set({ boardThemeId: id });
        }
      }
    }),
    {
      name: "theme-store",
    }
  )
);

export default useThemeStore;
