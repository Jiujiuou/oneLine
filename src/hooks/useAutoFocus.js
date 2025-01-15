import { useEffect } from "react";

/**
 * 自动聚焦的hook
 * @param {boolean} isOpen - 是否打开状态
 * @param {React.RefObject} ref - 需要聚焦的元素引用
 * @param {number} delay - 延迟聚焦的时间（毫秒）
 */
export function useAutoFocus(isOpen, ref, delay = 100) {
  useEffect(() => {
    if (isOpen && ref.current) {
      // 延迟聚焦确保动画完成后再聚焦
      const timer = setTimeout(() => {
        ref.current?.focus();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, ref, delay]);
}

export default useAutoFocus;
