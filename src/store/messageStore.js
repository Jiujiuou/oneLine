import { create } from "zustand";
import { MESSAGE_TYPES } from "@/constants";

/**
 * 消息状态管理Store
 */
export const useMessageStore = create((set, get) => ({
  // 消息状态
  message: null, // { text: string, type: string }
  messageVisible: false,
  messageTimer: null,

  // 显示消息 - 直接覆盖显示，不使用队列
  showMessage: (text, type = MESSAGE_TYPES.INFO) => {
    const { messageTimer } = get();

    // 清除当前计时器
    if (messageTimer) {
      clearTimeout(messageTimer);
    }

    // 直接显示新消息
    set({
      message: { text, type },
      messageVisible: true,
    });

    // 设置新的定时器
    const timer = setTimeout(() => {
      set({ messageVisible: false });
    }, 2500);

    set({ messageTimer: timer });
  },
}));

export default useMessageStore;
