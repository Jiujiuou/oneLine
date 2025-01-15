import { useState, useEffect } from "react";

/**
 * 提示位置计算的hook
 * 根据元素在视口中的位置动态调整提示框的显示位置
 * @param {React.RefObject} ref - 元素引用
 * @param {string} tips - 提示内容
 * @returns {string} 提示位置类型
 */
export function useTipsPosition(ref, tips) {
  const [tipsPosition, setTipsPosition] = useState("Top");

  // 检测开关位置并调整提示框位置
  useEffect(() => {
    if (!tips || !ref.current) return;

    const checkPosition = () => {
      const rect = ref.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      // 距离边缘的阈值（像素）
      const threshold = 100;

      // 根据开关位置决定提示框的位置
      let position = "Top"; // 默认在上方

      // 如果靠近顶部，提示显示在下方
      if (rect.top < threshold) {
        position = "Bottom";
      }

      // 如果靠近右侧，提示水平方向靠左对齐
      if (windowWidth - rect.right < threshold) {
        position = position === "Bottom" ? "BottomLeft" : "TopLeft";
      }

      // 如果靠近左侧，提示水平方向靠右对齐
      if (rect.left < threshold) {
        position = position === "Bottom" ? "BottomRight" : "TopRight";
      }

      setTipsPosition(position);
    };

    // 初始检测
    checkPosition();

    // 窗口大小变化时重新检测
    window.addEventListener("resize", checkPosition);

    return () => {
      window.removeEventListener("resize", checkPosition);
    };
  }, [tips, ref]);

  return tipsPosition;
}

export default useTipsPosition;
