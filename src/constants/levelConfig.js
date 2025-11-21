/**
 * 关卡配置生成器
 */

// 难度配置常量
// Note: hiddenRate 代表隐藏的比例。
// 提示数字 <= 50% 意味着 hiddenRate >= 0.5
const DIFFICULTY_SETTINGS = {
  // 入门: 3x3, 无障碍, 隐藏率 50%-60% (显示 4-5 个)
  TUTORIAL: {
    rows: 3,
    cols: 3,
    minHidden: 0.5,
    maxHidden: 0.6,
    obstacles: 0,
  },
  // 初级: 3x4, 无障碍, 隐藏率 55%-65% (显示 4-6 个)
  EASY: {
    rows: 3,
    cols: 4,
    minHidden: 0.55,
    maxHidden: 0.65,
    obstacles: 0,
  },
  // 中级: 4x4, 无障碍, 隐藏率 60%-70% (显示 5-7 个)
  NORMAL: {
    rows: 4,
    cols: 4,
    minHidden: 0.6,
    maxHidden: 0.7,
    obstacles: 0,
  },
  // 进阶: 4x5, 无障碍, 隐藏率 65%-75% (显示 5-7 个)
  HARD: {
    rows: 4,
    cols: 5,
    minHidden: 0.65,
    maxHidden: 0.75,
    obstacles: 0,
  },
  // 高级: 5x5, 无障碍, 隐藏率 70%-80% (显示 5-8 个)
  EXPERT: {
    rows: 5,
    cols: 5,
    minHidden: 0.7,
    maxHidden: 0.8,
    obstacles: 0,
  },
};

const levelCount = 3;

/**
 * 获取指定关卡的配置
 * @param {number} level - 关卡号 (1-based)
 * @returns {Object} { rows, cols, hiddenRate, obstaclesCount }
 */
export const getLevelConfig = (level) => {
  let settings;

  if (level <= levelCount) {
    settings = DIFFICULTY_SETTINGS.TUTORIAL;
  } else if (level <= levelCount * 2) {
    settings = DIFFICULTY_SETTINGS.EASY;
  } else if (level <= levelCount * 3) {
    settings = DIFFICULTY_SETTINGS.NORMAL;
  } else if (level <= levelCount * 4) {
    settings = DIFFICULTY_SETTINGS.HARD;
  } else {
    // Lv. 41-50 及以上默认使用 EXPERT，后续可扩展 MASTER
    settings = DIFFICULTY_SETTINGS.EXPERT;
  }

  // 计算当前关卡的具体隐藏率
  // 在范围内根据关卡进度线性增加，或者保持随机
  // 这里采用区间内随机，增加重玩性
  const hiddenRate =
    settings.minHidden +
    Math.random() * (settings.maxHidden - settings.minHidden);

  return {
    level,
    rows: settings.rows,
    cols: settings.cols,
    hiddenRate: parseFloat(hiddenRate.toFixed(2)),
    obstaclesCount: settings.obstacles,
  };
};
