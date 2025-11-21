import { useEffect } from "react";
import { useGameStore, useMessageStore } from "@/store";
import { Button, Timer, Switch } from "@/components";
import styles from "./index.module.less";

function Control() {
  const {
    currentLevel,
    generateGame,
    nextLevel,
    gameState,
    showNextHint,
    resetGame,
    showFullAnswer,
    fullPath,
    moveMode,
    toggleMoveMode,
  } = useGameStore();
  const { showMessage } = useMessageStore();

  // 初始加载第一关
  useEffect(() => {
    generateGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextLevel = () => {
    const result = nextLevel();
    if (result.success) {
      showMessage(`已进入第 ${currentLevel + 1} 关`, "success");
    } else {
      showMessage(result.message, "error");
    }
  };

  const handleTipClick = () => {
    if (gameState === "PLAYING") {
      // 20% 概率触发提示消息，不显示路径
      if (Math.random() < 0.2) {
        showMessage("自己动脑想想！", "info");
      } else {
        showNextHint();
      }
    } else if (gameState === "WON") {
      // 过关后点击提示按钮，重置游戏并显示完整答案
      resetGame();
      // 显示完整答案路径
      if (fullPath && fullPath.length > 0) {
        showFullAnswer();
        showMessage("已重置，显示官方答案", "info");
      }
    }
  };

  const handleModeToggle = () => {
    // 先获取当前模式，计算切换后的模式名称
    const newMode = moveMode === "orthogonal" ? "diagonal" : "orthogonal";
    const modeName = newMode === "diagonal" ? "地狱模式" : "标准模式";

    const result = toggleMoveMode();
    if (result.success) {
      showMessage(`已切换到${modeName}`, "success");
    } else {
      showMessage(result.message || "模式切换失败", "error");
    }
  };

  const handleRestart = () => {
    resetGame();
    showMessage("已重置本关", "info");
  };

  return (
    <div className={styles.control}>
      <div className={styles.section}>
        <div className={styles.levelDisplay}>
          <span className={styles.levelLabel}>LEVEL</span>
          <span className={styles.levelNumber}>{currentLevel}</span>
        </div>

        <Timer />

        {/* 模式切换开关和提示按钮 */}
        <div className={styles.modeSwitchContainer}>
          <Button
            text="💡"
            type="secondary"
            size="medium"
            onClick={handleTipClick}
            className={styles.tipButton}
          />
          <Switch
            checked={moveMode === "diagonal"}
            onChange={handleModeToggle}
            leftContent="标准"
            rightContent="地狱"
            tips={
              moveMode === "orthogonal"
                ? "只能上下左右移动"
                : "可以斜向移动，但线条不能交叉"
            }
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button
            text="重玩本关"
            type="secondary"
            size="medium"
            onClick={handleRestart}
            className={styles.restartButton}
          />
          <Button
            text={gameState === "WON" ? "下一关" : "跳过本关"}
            type={gameState === "WON" ? "primary" : "secondary"}
            size="medium"
            onClick={handleNextLevel}
            className={styles.nextLevelButton}
          />
        </div>
      </div>
    </div>
  );
}

export default Control;
