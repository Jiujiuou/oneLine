/**
 * 谜题生成器
 * 基于哈密顿路径生成游戏关卡数据（决定哪些数字显示，哪些隐藏）
 */

/**
 * 生成谜题
 * @param {Array} path - 完整的哈密顿路径 [{r, c, index}, ...]
 * @param {number} hiddenRate - 隐藏率 (0.0 - 1.0)，例如 0.3 表示隐藏 30%
 * @returns {Object} 包含 hints (Map) 和 solution 的对象
 */
export function generatePuzzle(path, hiddenRate = 0.5) {
  const totalSteps = path.length;
  const hideCount = Math.floor(totalSteps * hiddenRate);
  
  // 1. 创建所有索引池 (不再强制保留 1)
  const candidateIndices = [];
  for (let i = 1; i <= totalSteps; i++) {
    candidateIndices.push(i);
  }
  
  // 2. 随机选择要隐藏的索引
  shuffleArray(candidateIndices);
  const hiddenIndices = new Set(candidateIndices.slice(0, hideCount));
  
  // 3. 构建提示 Map: "r,c" -> number
  // 只有未被隐藏的才放入 hints
  const hints = {};
  
  path.forEach(step => {
    if (!hiddenIndices.has(step.index)) {
      const key = `${step.r},${step.c}`;
      hints[key] = step.index;
    }
  });

  return {
    hints,        // 用于显示在棋盘上的固定数字: { "0,0": 1, "0,2": 3 }
    fullPath: path // 完整答案
  };
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
