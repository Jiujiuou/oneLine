import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 音效设置 Store
 */
export const useSoundStore = create(
  persist(
    (set) => ({
      // 当前选中的音效预设
      currentPreset: "bubble",

      // 设置音效预设
      setPreset: (preset) => set({ currentPreset: preset }),
    }),
    {
      name: "sound-storage", // localStorage 中的键名
    }
  )
);

export default useSoundStore;
