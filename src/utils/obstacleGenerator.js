/**
 * 障碍物生成器
 * 生成障碍物并确保仍能形成哈密顿路径
 */

import { generateHamiltonianPath } from "./hamiltonian";

/**
 * 生成障碍物
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 * @param {number} obstacleCount - 障碍物数量
 * @param {number} maxAttempts - 最大尝试次数（默认50）
 * @returns {Array|null} 障碍物坐标数组 [{r, c}, ...] 或 null (如果生成失败)
 */
export function generateObstacles(rows, cols, obstacleCount, maxAttempts = 50) {
  if (obstacleCount <= 0) return [];
  
  const totalCells = rows * cols;
  if (obstacleCount >= totalCells) {
    console.warn(`[Obstacle] 障碍物数量 ${obstacleCount} 超过总格子数 ${totalCells}`);
    return null;
  }

  // 生成所有可能的格子位置
  const allPositions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      allPositions.push({ r, c });
    }
  }

  // 尝试生成有效的障碍物配置
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 随机选择障碍物位置
    const shuffled = [...allPositions];
    shuffleArray(shuffled);
    const obstacles = shuffled.slice(0, obstacleCount);

    // 尝试生成路径，验证障碍物配置是否有效
    const path = generateHamiltonianPath(rows, cols, obstacles);
    
    if (path && path.length > 0) {
      console.log(`[Obstacle] 成功生成 ${obstacleCount} 个障碍物，尝试次数: ${attempt + 1}`);
      return obstacles;
    }
  }

  console.warn(`[Obstacle] 经过 ${maxAttempts} 次尝试，无法生成有效的障碍物配置`);
  return null;
}

/**
 * Fisher-Yates 洗牌算法
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

