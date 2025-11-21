import { useThemeStore } from "@/store";
import { BOARD_THEMES } from "@/constants/themes";
import GridBoard from "@/components/GridBoard";
import styles from "./index.module.less";

function Preview() {
  const { boardThemeId } = useThemeStore();
  const currentTheme = BOARD_THEMES[boardThemeId] || BOARD_THEMES.DEFAULT;

  return (
    <div className={styles.preview}>
      <GridBoard theme={currentTheme} />
    </div>
  );
}

export default Preview;
