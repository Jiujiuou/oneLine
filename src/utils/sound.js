import { getSoundPresetConfig } from "@/constants/soundPresets";

// 创建音频上下文
let audioContext = null;

// 初始化音频上下文
export const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// 播放点击音效（使用当前预设）
export const playClickSound = (presetKey = "bubble") => {
  if (!audioContext) {
    initAudioContext();
  }
  if (!audioContext) return;

  const preset = getSoundPresetConfig(presetKey);
  if (!preset || !preset.click) return;

  const config = preset.click;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(
    config.startFreq,
    audioContext.currentTime
  );

  if (config.startFreq !== config.endFreq) {
    oscillator.frequency.exponentialRampToValueAtTime(
      config.endFreq,
      audioContext.currentTime + config.rampDuration
    );
  }

  gainNode.gain.setValueAtTime(config.volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + config.duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + config.duration);
};

// 播放完成音效（使用当前预设）
export const playCompleteSound = (presetKey = "bubble") => {
  if (!audioContext) {
    initAudioContext();
  }
  if (!audioContext) return;

  const preset = getSoundPresetConfig(presetKey);
  if (!preset || !preset.complete) return;

  const config = preset.complete;

  if (config.type === "melody" && config.notes) {
    config.notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = config.waveType;
      oscillator.frequency.setValueAtTime(
        note.freq,
        audioContext.currentTime + note.time
      );

      gainNode.gain.setValueAtTime(
        config.volume,
        audioContext.currentTime + note.time
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + note.time + note.duration
      );

      oscillator.start(audioContext.currentTime + note.time);
      oscillator.stop(audioContext.currentTime + note.time + note.duration);
    });
  }
};

// 播放错误音效（使用当前预设）
export const playErrorSound = (presetKey = "bubble") => {
  if (!audioContext) {
    initAudioContext();
  }
  if (!audioContext) return;

  const preset = getSoundPresetConfig(presetKey);
  if (!preset || !preset.error) {
    // 如果没有预设配置，使用默认错误音效
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      audioContext.currentTime + 0.15
    );

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.15
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    return;
  }

  const config = preset.error;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(
    config.startFreq,
    audioContext.currentTime
  );

  if (config.startFreq !== config.endFreq) {
    oscillator.frequency.exponentialRampToValueAtTime(
      config.endFreq,
      audioContext.currentTime + config.rampDuration
    );
  }

  gainNode.gain.setValueAtTime(config.volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + config.duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + config.duration);
};
