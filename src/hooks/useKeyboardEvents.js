import { useEffect } from "react";

/**
 * 键盘事件处理的hook
 * @param {boolean} isOpen - 是否打开状态
 * @param {Function} onEscape - 按下Escape键时的回调
 * @param {Function} onEnter - 按下Enter键时的回调
 */
export function useKeyboardEvents(isOpen, onEscape, onEnter) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onEscape?.();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onEnter?.();
      }
    };

    if (isOpen) {
      // 使用 capture 阶段监听，确保优先处理
      document.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onEscape, onEnter]);
}

export default useKeyboardEvents;
