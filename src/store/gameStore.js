import { create } from "zustand";
import { generateHamiltonianPath, generateHamiltonianPathDiagonal } from "@/utils/hamiltonian";
import { generatePuzzle } from "@/utils/puzzleGenerator";
import { getLevelConfig } from "@/constants/levelConfig";
import { generateObstacles } from "@/utils/obstacleGenerator";

/**
 * 游戏核心状态 Store
 */
export const useGameStore = create((set, get) => ({
  // --- 配置 ---
  currentLevel: 1,
  rows: 3,
  cols: 3,
  hiddenRate: 0.2,
  moveMode: 'orthogonal', // 'orthogonal' | 'diagonal' - 移动模式（标准/地狱）
  
  // --- 游戏数据 ---
  hints: {},        // 提示数字 Map: "r,c" -> number
  fullPath: [],     // 完整答案 (仅用于调试或提示)
  obstacles: [],    // 障碍物列表
  
  // --- 玩家状态 ---
  userPath: [],     // 用户当前画的路径 [{r,c}, ...]
  gameState: 'IDLE', // IDLE, PLAYING, WON, LOST
  hintPathLength: 0, // 当前显示的提示路径长度（点击💡按钮时逐步增加）
  
  // --- 计时器状态 ---
  timerStartTime: null,  // 计时开始时间戳（毫秒）
  timerEndTime: null,    // 计时结束时间戳（毫秒，游戏成功时设置）

  // --- Actions ---
  
  // 生成新游戏 (内部方法，根据传入的 level 配置生成)
  _generateGameByLevel: (level) => {
    const config = getLevelConfig(level);
    const { moveMode } = get(); // 获取当前移动模式
    
    // 1. 生成障碍物（如果有）
    let obstacles = [];
    if (config.obstaclesCount > 0) {
      obstacles = generateObstacles(config.rows, config.cols, config.obstaclesCount);
      if (!obstacles) {
        return { success: false, message: `关卡 ${level} 障碍物生成失败，请重试` };
      }
    }
    
    // 2. 根据移动模式选择不同的路径生成函数
    // 如果配置中指定了 moveMode，优先使用配置的；否则使用 store 中的
    const effectiveMoveMode = config.moveMode || moveMode;
    const pathGenerator = effectiveMoveMode === 'diagonal' 
      ? generateHamiltonianPathDiagonal 
      : generateHamiltonianPath;
    
    // 尝试生成有效路径 (最多重试 10 次，增加重试次数以防万一)
    let path = null;
    for (let i = 0; i < 10; i++) {
        path = pathGenerator(config.rows, config.cols, obstacles);
        if (path) break;
    }
    
    if (!path) {
      return { success: false, message: `关卡 ${level} 生成失败，请重试` };
    }

    // 3. 挖空生成谜题
    const { hints } = generatePuzzle(path, config.hiddenRate);

    // 4. 一切成功后，统一更新状态
    set({
        currentLevel: level,
        rows: config.rows,
        cols: config.cols,
        hiddenRate: config.hiddenRate,
        obstacles: obstacles,
        hints,
        fullPath: path,
        userPath: [],
        gameState: 'PLAYING',
        hintPathLength: 0, // 重置提示路径长度
        timerStartTime: Date.now(), // 开始计时
        timerEndTime: null, // 重置结束时间
        moveMode: effectiveMoveMode // 更新移动模式
    });

    return { success: true };
  },

  // 外部调用的生成当前关卡
  generateGame: () => {
    const { currentLevel } = get();
    return get()._generateGameByLevel(currentLevel);
  },

  // 切换到下一关
  nextLevel: () => {
      const { currentLevel, _generateGameByLevel } = get();
      const nextLv = currentLevel + 1;
      // 尝试生成下一关
      return _generateGameByLevel(nextLv);
  },

  // 切换到上一关
  prevLevel: () => {
      const { currentLevel, _generateGameByLevel } = get();
      if (currentLevel > 1) {
          return _generateGameByLevel(currentLevel - 1);
      }
      return { success: false, message: "已经是第一关了" };
  },

  // 跳转到指定关卡
  jumpToLevel: (level) => {
      if (level < 1) level = 1;
      return get()._generateGameByLevel(level);
  },

  // 重置当前游戏
  resetGame: () => {
    set({ 
      userPath: [], 
      gameState: 'PLAYING',
      hintPathLength: 0, // 重置提示路径长度
      timerStartTime: Date.now(), // 重新开始计时
      timerEndTime: null // 重置结束时间
    });
  },

  // 切换移动模式（标准模式/地狱模式）
  toggleMoveMode: () => {
    const { moveMode, currentLevel, _generateGameByLevel } = get();
    const newMode = moveMode === 'orthogonal' ? 'diagonal' : 'orthogonal';
    set({ moveMode: newMode });
    // 切换模式后重新生成当前关卡
    return _generateGameByLevel(currentLevel);
  },

  // 设置移动模式
  setMoveMode: (mode) => {
    if (mode !== 'orthogonal' && mode !== 'diagonal') {
      return { success: false, message: '无效的移动模式' };
    }
    const { currentLevel, _generateGameByLevel } = get();
    set({ moveMode: mode });
    // 设置模式后重新生成当前关卡
    return _generateGameByLevel(currentLevel);
  },

  // 显示下一段提示路径
  showNextHint: () => {
    const { fullPath, hintPathLength } = get();
    if (!fullPath || fullPath.length === 0) return;
    
    let newLength;
    if (hintPathLength === 0) {
      // 第一次点击：直接显示第一段路线（需要2个格子）
      newLength = Math.min(2, fullPath.length);
    } else {
      // 之后每次点击：只增加1个格子，显示下一段路径
      newLength = Math.min(hintPathLength + 1, fullPath.length);
    }
    
    set({ hintPathLength: newLength });
  },

  // 显示完整答案路径（用于过关后查看官方答案）
  showFullAnswer: () => {
    const { fullPath } = get();
    if (!fullPath || fullPath.length === 0) return;
    set({ hintPathLength: fullPath.length });
  },
  
  // 获取当前计时时间（毫秒）
  getTimerElapsed: () => {
    const { timerStartTime, timerEndTime, gameState } = get();
    if (!timerStartTime) return 0;
    
    // 如果游戏已成功，返回固定时间
    if (gameState === 'WON' && timerEndTime) {
      return timerEndTime - timerStartTime;
    }
    
    // 如果游戏进行中，返回当前时间差
    if (gameState === 'PLAYING') {
      return Date.now() - timerStartTime;
    }
    
    return 0;
  },
  
  // 更新用户路径并检查胜利
  setUserPath: (path) => {
      set({ userPath: path });
      
      // 检查胜利条件
      const { rows, cols, obstacles, hints } = get();
      const totalCells = rows * cols;
      const validCells = totalCells - obstacles.length;
      
      // 1. 长度检查
      if (path.length !== validCells) return;

      // 2. 提示匹配检查
      for (const key in hints) {
          const hintStep = hints[key];
          const [r, c] = key.split(',').map(Number);
          
          const userPos = path[hintStep - 1];
          
          if (!userPos || userPos.r !== r || userPos.c !== c) {
              return; 
          }
      }

      // 3. 如果都通过，胜利！
      set({ 
        gameState: 'WON',
        timerEndTime: Date.now() // 停止计时
      });
  },

  // 测试方法：生成 5x5 带障碍物的关卡
  generateTestLevelWithObstacles: (obstacleCount = 2) => {
    const rows = 5;
    const cols = 5;
    const hiddenRate = 0.75; // 隐藏率 75%

    // 1. 生成障碍物
    const obstacles = generateObstacles(rows, cols, obstacleCount);
    if (!obstacles) {
      return { success: false, message: "无法生成有效的障碍物配置" };
    }

    // 2. 生成路径
    let path = null;
    for (let i = 0; i < 10; i++) {
      path = generateHamiltonianPath(rows, cols, obstacles);
      if (path) break;
    }

    if (!path) {
      return { success: false, message: "无法生成有效路径" };
    }

    // 3. 生成谜题
    const { hints } = generatePuzzle(path, hiddenRate);

    // 4. 更新状态
    set({
      currentLevel: 999, // 测试关卡
      rows,
      cols,
      hiddenRate,
      obstacles,
      hints,
      fullPath: path,
      userPath: [],
      gameState: 'PLAYING',
      hintPathLength: 0, // 重置提示路径长度
      timerStartTime: Date.now(),
      timerEndTime: null
    });

    return { success: true, message: `成功生成 5x5 关卡，包含 ${obstacleCount} 个障碍物` };
  },
}));

export default useGameStore;
