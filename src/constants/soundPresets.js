/**
 * 音效预设配置
 * 每个预设包含点击音效和完成音效的配置
 */

export const SOUND_PRESETS = {
  piano: {
    name: "钢琴",
    click: {
      type: "sine",
      startFreq: 523,
      endFreq: 523,
      duration: 0.15,
      volume: 0.3,
      rampDuration: 0.15,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 523, time: 0, duration: 0.3 },
        { freq: 659, time: 0.3, duration: 0.3 },
        { freq: 784, time: 0.6, duration: 0.3 },
        { freq: 1047, time: 0.9, duration: 0.5 },
      ],
      waveType: "sine",
      volume: 0.3,
    },
    error: {
      type: "sine",
      startFreq: 440,
      endFreq: 220,
      duration: 0.2,
      volume: 0.25,
      rampDuration: 0.2,
    },
  },

  beep: {
    name: "蜂鸣器",
    click: {
      type: "square",
      startFreq: 800,
      endFreq: 800,
      duration: 0.05,
      volume: 0.15,
      rampDuration: 0.05,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 800, time: 0, duration: 0.1 },
        { freq: 800, time: 0.15, duration: 0.1 },
        { freq: 800, time: 0.3, duration: 0.1 },
        { freq: 1000, time: 0.5, duration: 0.3 },
      ],
      waveType: "square",
      volume: 0.2,
    },
    error: {
      type: "square",
      startFreq: 600,
      endFreq: 300,
      duration: 0.15,
      volume: 0.18,
      rampDuration: 0.15,
    },
  },

  bubble: {
    name: "泡泡",
    click: {
      type: "sine",
      startFreq: 800,
      endFreq: 1200,
      duration: 0.12,
      volume: 0.25,
      rampDuration: 0.12,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 659, time: 0, duration: 0.2 },
        { freq: 784, time: 0.15, duration: 0.2 },
        { freq: 988, time: 0.3, duration: 0.2 },
        { freq: 1175, time: 0.45, duration: 0.2 },
        { freq: 1319, time: 0.6, duration: 0.3 },
      ],
      waveType: "sine",
      volume: 0.25,
    },
    error: {
      type: "sine",
      startFreq: 500,
      endFreq: 250,
      duration: 0.18,
      volume: 0.22,
      rampDuration: 0.18,
    },
  },

  bell: {
    name: "铃铛",
    click: {
      type: "sine",
      startFreq: 1047,
      endFreq: 1047,
      duration: 0.25,
      volume: 0.2,
      rampDuration: 0.25,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 1047, time: 0, duration: 0.3 },
        { freq: 1175, time: 0.25, duration: 0.3 },
        { freq: 1319, time: 0.5, duration: 0.3 },
        { freq: 1568, time: 0.75, duration: 0.5 },
      ],
      waveType: "sine",
      volume: 0.25,
    },
    error: {
      type: "sine",
      startFreq: 880,
      endFreq: 440,
      duration: 0.22,
      volume: 0.2,
      rampDuration: 0.22,
    },
  },

  drum: {
    name: "鼓点",
    click: {
      type: "triangle",
      startFreq: 100,
      endFreq: 50,
      duration: 0.08,
      volume: 0.35,
      rampDuration: 0.08,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 100, time: 0, duration: 0.1 },
        { freq: 100, time: 0.15, duration: 0.1 },
        { freq: 100, time: 0.3, duration: 0.1 },
        { freq: 80, time: 0.5, duration: 0.15 },
        { freq: 60, time: 0.7, duration: 0.2 },
      ],
      waveType: "triangle",
      volume: 0.35,
    },
    error: {
      type: "triangle",
      startFreq: 150,
      endFreq: 60,
      duration: 0.2,
      volume: 0.3,
      rampDuration: 0.2,
    },
  },

  laser: {
    name: "激光",
    click: {
      type: "sawtooth",
      startFreq: 1500,
      endFreq: 500,
      duration: 0.1,
      volume: 0.2,
      rampDuration: 0.1,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 2000, time: 0, duration: 0.15 },
        { freq: 1800, time: 0.15, duration: 0.15 },
        { freq: 1600, time: 0.3, duration: 0.15 },
        { freq: 1400, time: 0.45, duration: 0.15 },
        { freq: 1200, time: 0.6, duration: 0.2 },
      ],
      waveType: "sawtooth",
      volume: 0.2,
    },
    error: {
      type: "sawtooth",
      startFreq: 1200,
      endFreq: 400,
      duration: 0.18,
      volume: 0.18,
      rampDuration: 0.18,
    },
  },

  wind: {
    name: "风铃",
    click: {
      type: "sine",
      startFreq: 880,
      endFreq: 1320,
      duration: 0.2,
      volume: 0.18,
      rampDuration: 0.2,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 880, time: 0, duration: 0.25 },
        { freq: 1047, time: 0.2, duration: 0.25 },
        { freq: 1175, time: 0.4, duration: 0.25 },
        { freq: 1320, time: 0.6, duration: 0.25 },
        { freq: 1568, time: 0.8, duration: 0.35 },
      ],
      waveType: "sine",
      volume: 0.2,
    },
    error: {
      type: "sine",
      startFreq: 660,
      endFreq: 330,
      duration: 0.2,
      volume: 0.16,
      rampDuration: 0.2,
    },
  },

  retro: {
    name: "复古游戏",
    click: {
      type: "square",
      startFreq: 440,
      endFreq: 880,
      duration: 0.12,
      volume: 0.22,
      rampDuration: 0.06,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 440, time: 0, duration: 0.15 },
        { freq: 554, time: 0.15, duration: 0.15 },
        { freq: 659, time: 0.3, duration: 0.15 },
        { freq: 880, time: 0.5, duration: 0.2 },
        { freq: 1047, time: 0.75, duration: 0.3 },
      ],
      waveType: "square",
      volume: 0.25,
    },
    error: {
      type: "square",
      startFreq: 400,
      endFreq: 200,
      duration: 0.16,
      volume: 0.2,
      rampDuration: 0.16,
    },
  },

  mario: {
    name: "超级玛丽",
    click: {
      type: "square",
      startFreq: 330,
      endFreq: 659,
      duration: 0.18,
      volume: 0.2,
      rampDuration: 0.08,
    },
    complete: {
      type: "melody",
      notes: [
        { freq: 523, time: 0, duration: 0.2 },
        { freq: 523, time: 0.2, duration: 0.2 },
        { freq: 523, time: 0.4, duration: 0.2 },
        { freq: 392, time: 0.65, duration: 0.2 },
        { freq: 523, time: 0.85, duration: 0.2 },
        { freq: 659, time: 1.1, duration: 0.4 },
      ],
      waveType: "square",
      volume: 0.25,
    },
    error: {
      type: "square",
      startFreq: 350,
      endFreq: 175,
      duration: 0.18,
      volume: 0.18,
      rampDuration: 0.18,
    },
  },
};

// 获取所有音效预设的键名列表
export const getSoundPresetKeys = () => Object.keys(SOUND_PRESETS);

// 获取音效预设的显示名称
export const getSoundPresetName = (key) => SOUND_PRESETS[key]?.name || key;

// 获取音效预设配置
export const getSoundPresetConfig = (key) => SOUND_PRESETS[key];
