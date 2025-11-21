import { useEffect } from "react";
import { useThemeStore, useGameStore } from "@/store";
import { BOARD_THEMES } from "@/constants/themes";
import GridBoard from "@/components/GridBoard";
import Confetti from "@/components/Confetti";
import styles from "./index.module.less";

function Preview() {
  const { boardThemeId } = useThemeStore();
  const { gameState } = useGameStore();
  const currentTheme = BOARD_THEMES[boardThemeId] || BOARD_THEMES.DEFAULT;
  const isWon = gameState === "WON";

  // 调试日志
  useEffect(() => {
    if (isWon) {
      console.log('[Preview] 游戏胜利，激活彩带效果');
    }
  }, [isWon]);

  return (
    <div className={styles.preview}>
      <GridBoard theme={currentTheme} />
      <Confetti active={isWon} count={100} />
    </div>
  );
}

export default Preview;
