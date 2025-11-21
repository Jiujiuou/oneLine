import { create } from "zustand";
import { generateHamiltonianPath } from "@/utils/hamiltonian";
import { generatePuzzle } from "@/utils/puzzleGenerator";
import { getLevelConfig } from "@/constants/levelConfig";

/**
 * 游戏核心状态 Store
 */
export const useGameStore = create((set, get) => ({
  // --- 配置 ---
  currentLevel: 1,
  rows: 3,
  cols: 3,
  hiddenRate: 0.2,
  
  // --- 游戏数据 ---
  hints: {},        // 提示数字 Map: "r,c" -> number
  fullPath: [],     // 完整答案 (仅用于调试或提示)
  obstacles: [],    // 障碍物列表
  
  // --- 玩家状态 ---
  userPath: [],     // 用户当前画的路径 [{r,c}, ...]
  gameState: 'IDLE', // IDLE, PLAYING, WON, LOST
  
  // --- 计时器状态 ---
  timerStartTime: null,  // 计时开始时间戳（毫秒）
  timerEndTime: null,    // 计时结束时间戳（毫秒，游戏成功时设置）

  // --- Actions ---
  
  // 生成新游戏 (内部方法，根据传入的 level 配置生成)
  _generateGameByLevel: (level) => {
    const config = getLevelConfig(level);
    
    // 尝试生成有效路径 (最多重试 10 次，增加重试次数以防万一)
    let path = null;
    for (let i = 0; i < 10; i++) {
        path = generateHamiltonianPath(config.rows, config.cols, []);
        if (path) break;
    }
    
    if (!path) {
      return { success: false, message: `关卡 ${level} 生成失败，请重试` };
    }

    // 挖空生成谜题
    const { hints } = generatePuzzle(path, config.hiddenRate);

    // 一切成功后，统一更新状态
    set({
        currentLevel: level,
        rows: config.rows,
        cols: config.cols,
        hiddenRate: config.hiddenRate,
        obstacles: [], // 目前无障碍
        hints,
        fullPath: path,
        userPath: [],
        gameState: 'PLAYING',
        timerStartTime: Date.now(), // 开始计时
        timerEndTime: null // 重置结束时间
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
      timerStartTime: Date.now(), // 重新开始计时
      timerEndTime: null // 重置结束时间
    });
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
}));

export default useGameStore;
