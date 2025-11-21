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

// ========== 斜向移动支持（地狱模式）==========
// 8方向定义：上、右、下、左 + 左上、右上、左下、右下
const DIAGONAL_DIRECTIONS = [
  { r: -1, c: 0 },  // Up
  { r: -1, c: 1 },  // Up-Right
  { r: 0, c: 1 },   // Right
  { r: 1, c: 1 },   // Down-Right
  { r: 1, c: 0 },   // Down
  { r: 1, c: -1 },  // Down-Left
  { r: 0, c: -1 },  // Left
  { r: -1, c: -1 }, // Up-Left
];

/**
 * 获取合法邻居（8方向版本）
 */
function getValidNeighborsDiagonal(r, c, grid, rows, cols) {
  const neighbors = [];
  for (const dir of DIAGONAL_DIRECTIONS) {
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
 * 检测两条线段是否相交（用于防止路径交叉）
 */
function doSegmentsIntersect(p1, p2, p3, p4) {
  // 将格子坐标转换为数值坐标（用于计算）
  const toPoint = (r, c) => ({ x: c, y: r });
  const a = toPoint(p1.r, p1.c);
  const b = toPoint(p2.r, p2.c);
  const c = toPoint(p3.r, p3.c);
  const d = toPoint(p4.r, p4.c);

  // 计算方向向量（判断点C相对于线段AB的位置）
  const ccw = (A, B, C) => {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  };

  // 两条线段相交当且仅当：
  // (点C和D在AB两侧) 且 (点A和B在CD两侧)
  const intersect1 = ccw(a, c, d) !== ccw(b, c, d);
  const intersect2 = ccw(a, b, c) !== ccw(a, b, d);
  
  return intersect1 && intersect2;
}

/**
 * 检查新添加的线段是否会与现有路径交叉
 */
function wouldPathCross(path, newPoint) {
  if (path.length < 2) return false;

  // 新线段是从路径最后一个点到新点
  const lastPoint = path[path.length - 1];

  // 检查新线段是否与路径中已有的线段相交
  // 注意：相邻的线段共享端点，不算交叉
  for (let i = 0; i < path.length - 1; i++) {
    const segStart = path[i];
    const segEnd = path[i + 1];

    // 跳过共享端点的相邻线段（包括紧邻的线段）
    const sharesStartPoint =
      (segStart.r === lastPoint.r && segStart.c === lastPoint.c) ||
      (segEnd.r === lastPoint.r && segEnd.c === lastPoint.c);
    const sharesEndPoint =
      (segStart.r === newPoint.r && segStart.c === newPoint.c) ||
      (segEnd.r === newPoint.r && segEnd.c === newPoint.c);

    // 如果共享端点，跳过（相邻线段不算交叉）
    if (sharesStartPoint || sharesEndPoint) {
      continue;
    }

    // 检查两条线段是否相交（不包括端点）
    if (doSegmentsIntersect(segStart, segEnd, lastPoint, newPoint)) {
      return true;
    }
  }

  return false;
}

/**
 * 回溯函数 (DFS) - 8方向版本（带交叉检测）
 */
function backtrackDiagonal(r, c, grid, path, targetLength, rows, cols, counter) {
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
  const neighbors = getValidNeighborsDiagonal(r, c, grid, rows, cols);
  shuffleArray(neighbors);

  for (const next of neighbors) {
    // 检查添加这个邻居是否会与现有路径交叉
    if (wouldPathCross(path, next)) {
      continue; // 如果会交叉，跳过这个邻居
    }

    if (
      backtrackDiagonal(next.r, next.c, grid, path, targetLength, rows, cols, counter)
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
 * 生成哈密顿路径（8方向版本，支持斜向移动）
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 * @param {Array} obstacles - 障碍物坐标数组 [{r, c}, ...]
 * @param {Object} startPos - 起点坐标 {r, c} (可选，如果不传则随机)
 * @returns {Array|null} 路径数组 [{r, c, index}, ...] 或 null (如果无解)
 */
export function generateHamiltonianPathDiagonal(
  rows,
  cols,
  obstacles = [],
  startPos = null
) {
  console.log(
    `[Algo-Diagonal] Start generation: ${rows}x${cols}, obstacles: ${obstacles.length}`
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
  console.log(`[Algo-Diagonal] Target path length: ${targetLength}`);

  // 如果没有有效格子，直接返回空路径
  if (targetLength <= 0) return [];

  // 2. 确定起点策略
  let startPosList = [];
  if (startPos) {
    // 如果指定了起点，就只试这一个
    if (grid[startPos.r][startPos.c] === 1) {
      console.error("[Algo-Diagonal] Start position is on an obstacle!");
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
      console.error("[Algo-Diagonal] No valid start position found!");
      return null;
    }
    // 随机打乱所有可能的起点，依次尝试
    shuffleArray(validStarts);
    // 8方向搜索空间更大，尝试更多起点
    startPosList = validStarts.slice(0, 15);
  }

  // 3. 尝试从候选起点开始搜索
  for (const start of startPosList) {
    console.log(`[Algo-Diagonal] Trying start: (${start.r}, ${start.c})`);

    // 每次尝试都需要一个新的计数器和空的路径
    const path = [];
    const MAX_STEPS = 5000000; // 8方向搜索空间更大，增加最大步数
    const counter = { count: 0, max: MAX_STEPS };

    if (
      backtrackDiagonal(start.r, start.c, grid, path, targetLength, rows, cols, counter)
    ) {
      console.log(`[Algo-Diagonal] Success! Path found in ${counter.count} steps.`);
      return path.map((pos, i) => ({ ...pos, index: i + 1 }));
    }

    console.log(`[Algo-Diagonal] Start (${start.r}, ${start.c}) failed. Trying next...`);
  }

  console.warn(`[Algo-Diagonal] All attempts failed.`);
  return null; // 所有尝试都失败
}
