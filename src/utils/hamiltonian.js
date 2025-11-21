/**
 * 哈密顿路径生成算法
 * 使用回溯法 (Backtracking) 在网格中寻找哈密顿路径
 */

// 方向定义：上、右、下、左
const DIRECTIONS = [
  { r: -1, c: 0 }, // Up
  { r: 0, c: 1 }, // Right
  { r: 1, c: 0 }, // Down
  { r: 0, c: -1 }, // Left
];

/**
 * 生成哈密顿路径
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 * @param {Array} obstacles - 障碍物坐标数组 [{r, c}, ...]
 * @param {Object} startPos - 起点坐标 {r, c} (可选，如果不传则随机)
 * @returns {Array|null} 路径数组 [{r, c, index}, ...] 或 null (如果无解)
 */
export function generateHamiltonianPath(
  rows,
  cols,
  obstacles = [],
  startPos = null
) {
  console.log(
    `[Algo] Start generation: ${rows}x${cols}, obstacles: ${obstacles.length}`
  );

  // 1. 初始化网格状态
  // 0: 空闲, 1: 障碍物, 2: 已访问
  const grid = Array(rows)
    .fill()
    .map(() => Array(cols).fill(0));

  // 标记障碍物
  let obstacleCount = 0;
  obstacles.forEach(({ r, c }) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = 1;
      obstacleCount++;
    }
  });

  const totalCells = rows * cols;
  const targetLength = totalCells - obstacleCount;
  console.log(`[Algo] Target path length: ${targetLength}`);

  // 如果没有有效格子，直接返回空路径
  if (targetLength <= 0) return [];

  // 2. 确定起点策略
  let startPosList = [];
  if (startPos) {
    // 如果指定了起点，就只试这一个
    if (grid[startPos.r][startPos.c] === 1) {
      console.error("[Algo] Start position is on an obstacle!");
      return null;
    }
    startPosList.push(startPos);
  } else {
    // 如果没指定起点，收集所有有效起点
    const validStarts = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 0) {
          validStarts.push({ r, c });
        }
      }
    }
    if (validStarts.length === 0) {
      console.error("[Algo] No valid start position found!");
      return null;
    }
    // 随机打乱所有可能的起点，依次尝试
    shuffleArray(validStarts);
    // 为避免性能问题，最多尝试 5 个不同的起点（对于 3x3 这种小图，通常前两个就能命中正确的奇偶性）
    startPosList = validStarts.slice(0, 10);
  }

  // 3. 尝试从候选起点开始搜索
  for (const start of startPosList) {
    console.log(`[Algo] Trying start: (${start.r}, ${start.c})`);

    // 每次尝试都需要一个新的计数器和空的路径
    const path = [];
    const MAX_STEPS = 2000000;
    const counter = { count: 0, max: MAX_STEPS };

    // 需要深拷贝一份 grid 状态用于回溯，或者在 backtrack 内部妥善回退（目前的 backtrack 已经妥善回退了，但要确保 grid 在每次尝试前是干净的）
    // 注意：我们的 backtrack 是修改 grid 的。虽然它会回退，但为了保险，确保每次尝试都是基于原始 grid
    // 其实 backtrack 里的逻辑是回退时会 grid[r][c] = 0，所以理论上只要 backtrack 返回 false，grid 就恢复原状了。
    // 直接调用即可。

    if (
      backtrack(start.r, start.c, grid, path, targetLength, rows, cols, counter)
    ) {
      console.log(`[Algo] Success! Path found in ${counter.count} steps.`);
      return path.map((pos, i) => ({ ...pos, index: i + 1 }));
    }

    console.log(`[Algo] Start (${start.r}, ${start.c}) failed. Trying next...`);
  }

  console.warn(`[Algo] All attempts failed.`);
  return null; // 所有尝试都失败
}

/**
 * 回溯函数 (DFS)
 */
function backtrack(r, c, grid, path, targetLength, rows, cols, counter) {
  counter.count++;
  if (counter.count > counter.max) {
    return false;
  }

  // 记录当前步
  grid[r][c] = 2; // Mark as visited
  path.push({ r, c });

  // Base case: 路径长度达标，找到解
  if (path.length === targetLength) {
    return true;
  }

  // 获取合法的邻居并随机打乱顺序 (增加随机性)
  const neighbors = getValidNeighbors(r, c, grid, rows, cols);
  shuffleArray(neighbors);

  for (const next of neighbors) {
    if (
      backtrack(next.r, next.c, grid, path, targetLength, rows, cols, counter)
    ) {
      return true;
    }
  }

  // Backtrack: 撤销当前步
  path.pop();
  grid[r][c] = 0; // Unmark
  return false;
}

/**
 * 获取合法邻居
 */
function getValidNeighbors(r, c, grid, rows, cols) {
  const neighbors = [];
  for (const dir of DIRECTIONS) {
    const nr = r + dir.r;
    const nc = c + dir.c;

    // 边界检查 && 非障碍物 && 未访问
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0) {
      neighbors.push({ r: nr, c: nc });
    }
  }
  return neighbors;
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
