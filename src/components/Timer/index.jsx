import { useEffect, useState } from "react";
import { useGameStore } from "@/store";
import styles from "./index.module.less";

function Timer() {
  const { gameState, getTimerElapsed } = useGameStore();
  const [timerDisplay, setTimerDisplay] = useState("00:00:00");

  // 格式化时间为 分：秒：毫秒
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // 毫秒转换为两位（0-99）

    const minutesStr = String(minutes).padStart(2, "0");
    const secondsStr = String(seconds).padStart(2, "0");
    const msStr = String(ms).padStart(2, "0"); // 两位毫秒

    return `${minutesStr}:${secondsStr}:${msStr}`;
  };

  // 计时器更新逻辑
  useEffect(() => {
    // 初始显示
    const elapsed = getTimerElapsed();
    const formatted = formatTime(elapsed);
    setTimerDisplay(formatted);

    if (gameState !== "PLAYING") {
      // 如果游戏不在进行中，显示最终时间（不再更新）
      return;
    }

    // 游戏进行中，使用 requestAnimationFrame 以获得流畅的更新
    let animationFrameId;
    let isRunning = true;

    const updateTimer = () => {
      if (!isRunning) return;

      const elapsed = getTimerElapsed();
      const formatted = formatTime(elapsed);
      setTimerDisplay(formatted);

      // 继续更新
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameState, getTimerElapsed]);

  return (
    <div className={styles.timerDisplay}>
      <span className={styles.timerLabel}>TIME</span>
      <span className={styles.timerValue}>{timerDisplay}</span>
    </div>
  );
}

export default Timer;

