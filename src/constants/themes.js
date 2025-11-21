/**
 * 游戏棋盘主题配置
 */
export const BOARD_THEMES = {
  DEFAULT: {
    id: "default",
    name: "经典蓝",
    colors: {
      background: "transparent",
      cellBg: "#f5f5f5",
      cellBorder: "#d9d9d9", // 普通边框加深一点 (Grey-5)

      // 1. 提示格 (Hint)
      hintBg: "#bae7ff",
      hintText: "#000000",
      hintBorder: "#69c0ff", // 提示格边框 (Blue-4)

      // 2. 移动路径 (Active)
      activeBg: "#69c0ff",
      activeText: "#000000",
      activeBorder: "#1890ff", // 路径格边框 (Blue-6)

      // 3. 完成状态 (Success)
      successBg: "#d9f7be",
      successText: "#000000",
      successBorder: "#73d13d", // 成功格边框 (Green-5)

      // 4. 错误 (Error)
      errorBg: "#ffccc7",
      errorText: "#000000",
      errorBorder: "#ff7875", // 错误格边框 (Red-5)

      obstacleBg: "#434343",
      obstacleText: "#ffffff",
      line: "#1890ff",
    },
  },
};
