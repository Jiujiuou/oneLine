import { useEffect } from "react";
import { useGameStore, useMessageStore } from "@/store";
import { Button } from "@/components";
import styles from "./index.module.less";

function Control() {
  const { 
    currentLevel, 
    generateGame, 
    resetGame, 
    nextLevel, 
    prevLevel,
    gameState 
  } = useGameStore();
  
  const { showMessage } = useMessageStore();

  // 初始加载第一关
  useEffect(() => {
      generateGame();
  }, []); // 只在挂载时执行一次

  const handleNextLevel = () => {
      const result = nextLevel();
      if (result.success) {
          showMessage(`已进入第 ${currentLevel + 1} 关`, "success");
      } else {
          showMessage(result.message, "error");
      }
  };

  const handlePrevLevel = () => {
    const result = prevLevel();
    if (!result.success) {
        showMessage(result.message, "warning");
    } else {
        showMessage(`回到第 ${currentLevel - 1} 关`, "success");
    }
  };

  const handleReset = () => {
      resetGame();
      showMessage("当前关卡已重置", "info");
  };

  return (
    <div className={styles.control}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>关卡控制</h3>
        
        <div className={styles.levelDisplay}>
            <span className={styles.levelLabel}>LEVEL</span>
            <span className={styles.levelNumber}>{currentLevel}</span>
        </div>

        <div className={styles.buttonGroup}>
             <Button 
                text="上一关" 
                type="secondary" 
                onClick={handlePrevLevel} 
                disabled={currentLevel <= 1}
            />
            <Button 
                text="重置" 
                type="secondary" 
                onClick={handleReset} 
            />
        </div>

        {gameState === 'WON' && (
            <div className={styles.victoryMessage}>
                🎉 恭喜通过本关！
            </div>
        )}

        <Button 
            text={gameState === 'WON' ? "下一关 (Next)" : "跳过本关"} 
            type={gameState === 'WON' ? "primary" : "secondary"}
            onClick={handleNextLevel} 
            style={{ marginTop: '12px', height: '48px', fontSize: '16px' }}
        />
      </div>
    </div>
  );
}

export default Control;
