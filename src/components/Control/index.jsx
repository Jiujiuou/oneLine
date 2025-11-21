import { useEffect } from "react";
import { useGameStore, useMessageStore } from "@/store";
import { Button, Timer } from "@/components";
import styles from "./index.module.less";

function Control() {
  const { currentLevel, generateGame, nextLevel, gameState } = useGameStore();
  const { showMessage } = useMessageStore();

  // 初始加载第一关
  useEffect(() => {
    generateGame();
  }, []);

  const handleNextLevel = () => {
    const result = nextLevel();
    if (result.success) {
      showMessage(`已进入第 ${currentLevel + 1} 关`, "success");
    } else {
      showMessage(result.message, "error");
    }
  };

  return (
    <div className={styles.control}>
      <div className={styles.section}>
        <div className={styles.levelDisplay}>
          <span className={styles.levelLabel}>LEVEL</span>
          <span className={styles.levelNumber}>{currentLevel}</span>
        </div>

        <Timer />

        <div className={styles.buttonGroup}>
          <Button
            text="💡"
            type="secondary"
            size="medium"
            onClick={() => {}}
            className={styles.tipButton}
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
