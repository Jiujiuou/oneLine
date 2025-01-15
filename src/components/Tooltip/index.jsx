import styles from "./index.module.less";

function Tooltip({ visible, x, y, text }) {
  if (!visible) {
    return null;
  }

  return (
    <div className={styles.tooltip} style={{ left: x + "px", top: y + "px" }}>
      {text}
    </div>
  );
}

export default Tooltip;
